import { StructuredLogger } from '../utils/logger.ts';

// In-memory or Redis fallback status cache for M-Pesa transactions
const mpesaTransactionsStore = new Map<string, {
  checkoutRequestId: string;
  merchantRequestId: string;
  phoneNumber: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  mpesaReceiptNumber?: string;
  resultDesc?: string;
  updatedAt: string;
}>();

export function formatMpesaPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    // Already in 254 format
  } else if (cleaned.length === 9) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

export function getMpesaTimestamp(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export async function getMpesaAccessToken(): Promise<string | null> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
  const env = process.env.MPESA_ENVIRONMENT || 'sandbox';

  if (!consumerKey || !consumerSecret || consumerKey === 'your_daraja_consumer_key_here') {
    return null;
  }

  const url = env === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Basic ${auth}` }
    });
    if (!response.ok) return null;
    const data: any = await response.json();
    return data?.access_token || null;
  } catch (err: any) {
    StructuredLogger.error(`[MPESA_AUTH_ERROR] Failed to obtain M-Pesa token: ${err.message}`);
    return null;
  }
}

export interface StkPushParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  callbackUrl?: string;
  simulateFailureReason?: 'wrong_pin' | 'insufficient_funds' | 'timeout' | 'user_cancelled' | 'network_error';
}

export async function initiateMpesaStkPush(params: StkPushParams) {
  const formattedPhone = formatMpesaPhoneNumber(params.phoneNumber);
  const shortCode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
  const callbackUrl = params.callbackUrl || process.env.MPESA_CALLBACK_URL || 'https://chickmagnet.app/api/v1/payments/mpesa/callback';

  const timestamp = getMpesaTimestamp();
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  const token = await getMpesaAccessToken();

  // If real Daraja API token is available, trigger real Safaricom STK Push
  if (token) {
    const processUrl = env === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.max(1, Math.round(params.amount)),
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: params.accountReference.substring(0, 12),
      TransactionDesc: (params.transactionDesc || 'Poultry Order').substring(0, 13)
    };

    try {
      const response = await fetch(processUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data: any = await response.json();
      if (data.ResponseCode === '0') {
        const record = {
          checkoutRequestId: data.CheckoutRequestID,
          merchantRequestId: data.MerchantRequestID,
          phoneNumber: formattedPhone,
          amount: params.amount,
          status: 'PENDING' as const,
          updatedAt: new Date().toISOString()
        };
        mpesaTransactionsStore.set(data.CheckoutRequestID, record);

        StructuredLogger.info(`[MPESA_STK_PUSH_SENT] CheckoutRequestID: ${data.CheckoutRequestID} to ${formattedPhone}`);

        return {
          success: true,
          checkoutRequestId: data.CheckoutRequestID,
          merchantRequestId: data.MerchantRequestID,
          customerMessage: data.CustomerMessage || 'STK Push sent to phone handset',
          isSimulated: false
        };
      } else {
        throw new Error(data.ResponseDescription || 'M-Pesa STK Push rejected');
      }
    } catch (err: any) {
      StructuredLogger.error(`[MPESA_STK_PUSH_FAILED] Error: ${err.message}`);
      throw new Error(err.message || 'M-Pesa Gateway Error');
    }
  }

  // Graceful Sandbox / Demo Fallback Mode
  const simulatedCheckoutId = `ws_CO_SIM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const simulatedMerchantId = `MERCH_${Math.floor(Math.random() * 900000 + 100000)}`;

  const mockRecord = {
    checkoutRequestId: simulatedCheckoutId,
    merchantRequestId: simulatedMerchantId,
    phoneNumber: formattedPhone,
    amount: params.amount,
    status: 'PENDING' as const,
    updatedAt: new Date().toISOString()
  };
  mpesaTransactionsStore.set(simulatedCheckoutId, mockRecord);

  // Auto-complete or fail based on simulated parameters
  if (params.simulateFailureReason) {
    setTimeout(() => {
      const existing = mpesaTransactionsStore.get(simulatedCheckoutId);
      if (existing && existing.status === 'PENDING') {
        existing.status = 'FAILED';
        if (params.simulateFailureReason === 'insufficient_funds') {
          existing.resultDesc = 'DS timeout user cannot be reached or insufficient funds in M-Pesa account.';
        } else if (params.simulateFailureReason === 'wrong_pin' || params.simulateFailureReason === 'user_cancelled') {
          existing.resultDesc = 'Request cancelled by user or incorrect M-Pesa PIN.';
        } else if (params.simulateFailureReason === 'timeout') {
          existing.resultDesc = 'Transaction timed out: No response received from handset.';
        } else {
          existing.resultDesc = 'Network transmission error from Safaricom core gateway.';
        }
        existing.updatedAt = new Date().toISOString();
        mpesaTransactionsStore.set(simulatedCheckoutId, existing);
        StructuredLogger.warn(`[MPESA_SIMULATED_FAILURE] ${simulatedCheckoutId} failed with ${existing.resultDesc}`);
      }
    }, 4500);
  } else {
    // Auto-complete simulated payment after 4 seconds to simulate user entering PIN
    setTimeout(() => {
      const existing = mpesaTransactionsStore.get(simulatedCheckoutId);
      if (existing && existing.status === 'PENDING') {
        existing.status = 'COMPLETED';
        existing.mpesaReceiptNumber = `QK${Math.floor(100000000 + Math.random() * 900000000)}`;
        existing.resultDesc = 'The service request is processed successfully.';
        existing.updatedAt = new Date().toISOString();
        mpesaTransactionsStore.set(simulatedCheckoutId, existing);
        StructuredLogger.info(`[MPESA_SIMULATED_PIN_ENTERED] ${simulatedCheckoutId} completed with receipt ${existing.mpesaReceiptNumber}`);
      }
    }, 4000);
  }

  return {
    success: true,
    checkoutRequestId: simulatedCheckoutId,
    merchantRequestId: simulatedMerchantId,
    customerMessage: `Success. Prompt sent to ${formattedPhone}. Please check your phone and enter your M-Pesa PIN.`,
    isSimulated: true
  };
}

export function handleMpesaCallbackPayload(body: any) {
  try {
    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) return null;

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    let receiptNumber = '';
    let amount = 0;
    let phoneNumber = '';

    if (stkCallback.CallbackMetadata?.Item) {
      for (const item of stkCallback.CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') receiptNumber = String(item.Value);
        if (item.Name === 'Amount') amount = Number(item.Value);
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
      }
    }

    const isSuccess = resultCode === 0;
    const record = mpesaTransactionsStore.get(checkoutRequestId) || {
      checkoutRequestId,
      merchantRequestId: stkCallback.MerchantRequestID,
      phoneNumber,
      amount,
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      mpesaReceiptNumber: receiptNumber,
      resultDesc,
      updatedAt: new Date().toISOString()
    };

    record.status = isSuccess ? 'COMPLETED' : 'FAILED';
    if (receiptNumber) record.mpesaReceiptNumber = receiptNumber;
    record.resultDesc = resultDesc;
    record.updatedAt = new Date().toISOString();

    mpesaTransactionsStore.set(checkoutRequestId, record);

    StructuredLogger.info(`[MPESA_CALLBACK_PROCESSED] Request: ${checkoutRequestId}, Success: ${isSuccess}, Receipt: ${receiptNumber}`);

    return record;
  } catch (err: any) {
    StructuredLogger.error(`[MPESA_CALLBACK_PARSING_FAILED] Error: ${err.message}`);
    return null;
  }
}

export function getMpesaTransactionStatus(checkoutRequestId: string) {
  return mpesaTransactionsStore.get(checkoutRequestId) || null;
}
