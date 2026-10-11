import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest, requireRoles, paymentRateLimiter } from '../../middleware/index.ts';
import { tryCatch } from '../../utils/index.ts';
import { StructuredLogger } from '../../utils/logger.ts';
import { initiateMpesaStkPush, handleMpesaCallbackPayload, getMpesaTransactionStatus } from '../../services/mpesa.ts';
import { getWholesaleMinimumForCategory } from '../../utils/orderRules.ts';

const paymentsRouter = Router();

// Apply payment rate limiter (10 req/min)
paymentsRouter.use(paymentRateLimiter);

// ==========================================
// M-PESA DARAJA STK PUSH & WEBHOOK HANDLERS
// ==========================================

// @route   POST /api/v1/payments/mpesa/stkpush
// Initiates Safaricom Lipa Na M-Pesa Online STK Push prompt to customer handset
paymentsRouter.post('/mpesa/stkpush', tryCatch(async (req: any, res: any) => {
  const { phoneNumber, amount, accountReference, transactionDesc, buyerType = 'retail', items = [] } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({
      success: false,
      error: { message: 'Phone number and amount are required for M-Pesa STK push.' }
    });
  }

  if (buyerType === 'wholesale') {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Wholesale payment requires order items.' }
      });
    }

    for (const item of items) {
      const quantity = Number(item.quantity);
      const minimum = getWholesaleMinimumForCategory(item.category);
      if (!Number.isInteger(quantity) || quantity < minimum) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WHOLESALE_MINIMUM_NOT_MET',
            message: `${item.category === 'eggs' ? 'Egg' : 'Chicken'} wholesale orders require at least ${minimum} units per product.`,
            productId: item.productId,
            minimum
          }
        });
      }
    }
  }

  const result = await initiateMpesaStkPush({
    phoneNumber,
    amount: Number(amount),
    accountReference: accountReference || 'CHX-ORDER',
    transactionDesc: transactionDesc || 'ChickMagnet Order'
  });

  res.json({
    success: true,
    data: result
  });
}));

// @route   POST /api/v1/payments/mpesa/callback
// Instant Payment Notification (IPN) webhook from Safaricom M-Pesa Daraja
paymentsRouter.post('/mpesa/callback', tryCatch(async (req: any, res: any) => {
  StructuredLogger.info(`[MPESA_WEBHOOK_RECEIVED] Payload: ${JSON.stringify(req.body)}`);
  const result = handleMpesaCallbackPayload(req.body);

  if (result && result.status === 'COMPLETED' && result.checkoutRequestId) {
    // Optionally update order status in database if accountReference was stored
    StructuredLogger.info(`[MPESA_PAYMENT_CONFIRMED] Receipt: ${result.mpesaReceiptNumber}, Phone: ${result.phoneNumber}`);
  }

  // Safaricom expects a success response acknowledging receipt of callback
  res.json({
    ResultCode: 0,
    ResultDesc: 'Callback received successfully'
  });
}));

// @route   GET /api/v1/payments/mpesa/status/:checkoutRequestId
// Poll STK Push transaction confirmation status
paymentsRouter.get('/mpesa/status/:checkoutRequestId', tryCatch(async (req: any, res: any) => {
  const { checkoutRequestId } = req.params;
  const status = getMpesaTransactionStatus(checkoutRequestId);

  if (!status) {
    return res.status(404).json({
      success: false,
      error: { message: 'M-Pesa transaction request ID not found.' }
    });
  }

  res.json({
    success: true,
    data: status
  });
}));

// @route   GET /api/v1/payments/me/payouts
paymentsRouter.get('/me/payouts', requireAuth, requireRoles('KEEPER'), tryCatch(async (req: AuthRequest, res: any) => {
  const maker = await prisma.keeperProfile.findUnique({ where: { userId: req.user!.id } });
  if (!maker) return res.status(404).json({ success: false, error: { message: 'Profile not found.' } });

  const payouts = await prisma.payout.findMany({
    where: { keeperId: maker.id },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, data: payouts });
}));

export default paymentsRouter;
