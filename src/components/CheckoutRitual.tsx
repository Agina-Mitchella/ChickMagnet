import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Lock, 
  Calendar, 
  Scale, 
  Building2, 
  Smartphone, 
  Check, 
  Search, 
  MapPin, 
  Copy, 
  RefreshCw, 
  AlertCircle, 
  XCircle, 
  Info, 
  Sparkles,
  Timer,
  ChevronRight
} from 'lucide-react';
import { CartItem, BuyerType, FulfillmentType, User } from '../types';

interface CheckoutRitualProps {
  cartItems: CartItem[];
  buyerType: BuyerType;
  currentUser?: User | null;
  onOrderCompleted: (orderSummary: any) => void;
  onCancel: () => void;
}

const KENYA_DELIVERY_LOCATIONS = [
  'Nairobi Metro - Westlands & Parklands',
  'Nairobi Metro - Karen, Langata & Rongai',
  'Nairobi Metro - Dagoretti & Naivasha Rd',
  'Nairobi Metro - Kasarani, Roysambu & Thika Rd',
  'Nairobi Metro - Embakasi, Donholm & Fedha',
  'Nairobi Metro - Kilimani, Lavington & Kileleshwa',
  'Kiambu County - Thika, Ruiru & Juja',
  'Kiambu County - Kiambu Town & Karuri',
  'Kiambu County - Kikuyu & Limuru',
  'Nakuru County - Nakuru City & Njoro',
  'Nakuru County - Naivasha & Mai Mahiu',
  'Nakuru County - Gilgil & Molo',
  'Mombasa County - Mombasa Island & Nyali',
  'Mombasa County - Bamburi, Shanzu & Kisauni',
  'Mombasa County - Likoni & Changamwe',
  'Uasin Gishu County - Eldoret Town & Turbo',
  'Kisumu County - Kisumu City & Maseno',
  'Nyeri County - Nyeri Town & Karatina',
  'Machakos County - Machakos Town & Athi River / Syokimau',
  'Kajiado County - Kitengela, Ngong & Kajiado Town',
  'Meru County - Meru Town, Nanyuki Corridor & Maua',
  'Laikipia County - Nanyuki & Nyahururu',
  'Kakamega County - Kakamega Town & Mumias',
  'Bungoma County - Bungoma Town & Webuye',
  'Trans Nzoia County - Kitale Town & Kiminini',
  'Kericho County - Kericho Town & Litein',
  'Bomet County - Bomet Town & Sotik',
  'Nandi County - Kapsabet & Nandi Hills',
  'Kilifi County - Malindi, Kilifi Town & Mtwapa',
  'Kwale County - Diani, Ukunda & Kwale Town',
  'Murang\'a County - Murang\'a Town, Kenol & Maragua',
  'Kirinyaga County - Kerugoya, Sagana & Wang\'uru',
  'Embu County - Embu Town & Runyenjes',
  'Kitui County - Kitui Town & Mwingi',
  'Makueni County - Wote, Kibwezi & Mtito Andei',
  'Garissa County - Garissa Town',
  'Wajir County - Wajir Town',
  'Mandera County - Mandera Town',
  'Marsabit County - Marsabit Town & Moyale',
  'Isiolo County - Isiolo Town',
  'Turkana County - Lodwar & Kakuma',
  'West Pokot County - Kapenguria',
  'Samburu County - Maralal',
  'Baringo County - Kabarnet & Eldama Ravine',
  'Nyandarua County - Ol Kalou & Engineer',
  'Narok County - Narok Town & Kilgoris',
  'Kisii County - Kisii Town & Ogembo',
  'Nyamira County - Nyamira Town',
  'Migori County - Migori Town & Rongo',
  'Homa Bay County - Homa Bay Town & Mbita',
  'Siaya County - Siaya Town & Bondo',
  'Busia County - Busia Town & Malaba',
  'Vihiga County - Mbale & Luanda',
  'Taita Taveta County - Voi & Taveta',
  'Tana River County - Hola & Garsen',
  'Lamu County - Lamu Town & Mpeketoni',
  'Elgeyo Marakwet County - Iten'
];

export type PaymentSubStep = 'phone_entry' | 'waiting' | 'success' | 'failure';
export type MobileMoneyProvider = 'mpesa';
export type PaymentFailureReason = 'wrong_pin' | 'insufficient_funds' | 'timeout' | 'user_cancelled' | 'network_error';

export default function CheckoutRitual({
  cartItems,
  buyerType,
  currentUser,
  onOrderCompleted,
  onCancel
}: CheckoutRitualProps) {
  // Top-level checkout step: 'fulfillment' -> 'payment'
  const [currentStep, setCurrentStep] = useState<'fulfillment' | 'payment'>('fulfillment');

  // Customer Contact Info
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('+254 7');
  const [deliveryZone, setDeliveryZone] = useState('Nairobi Metro - Dagoretti & Naivasha Rd');
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [address, setAddress] = useState('');

  // Account Payment Mode (Homesteaders Upfront Mobile Money vs Commercial Wholesale Net-30)
  const isWholesaleBuyer = buyerType === 'wholesale';
  const [accountTypePath, setAccountTypePath] = useState<'homesteaders' | 'wholesale_net30'>(
    isWholesaleBuyer ? 'wholesale_net30' : 'homesteaders'
  );

  // Mobile Money (M-Pesa) Payment Flow States
  const [paymentSubStep, setPaymentSubStep] = useState<PaymentSubStep>('phone_entry');
  const mobileMoneyProvider: MobileMoneyProvider = 'mpesa';
  const [mobilePhone, setMobilePhone] = useState('+254 7');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // STK Push Waiting & Polling State
  const [activeCheckoutRequestId, setActiveCheckoutRequestId] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(75);
  const [pollingStatusText, setPollingStatusText] = useState<string>('Sending M-Pesa prompt to handset...');
  const [isResending, setIsResending] = useState<boolean>(false);

  // Payment Result State
  const [paymentReceiptCode, setPaymentReceiptCode] = useState<string | null>(null);
  const [paymentFailureReason, setPaymentFailureReason] = useState<PaymentFailureReason>('timeout');
  const [paymentFailureDesc, setPaymentFailureDesc] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);

  // 15-Minute Reservation Grace Period Countdown
  const [reservationMinutesRemaining, setReservationMinutesRemaining] = useState<number>(14);
  const [reservationSecondsRemaining, setReservationSecondsRemaining] = useState<number>(45);

  // Wholesale Net-30 Specific Fields
  const [poNumber, setPoNumber] = useState('PO-2026-NVR-8821');
  const [net30Agreed, setNet30Agreed] = useState(true);

  // Fulfillment group delivery slot choices
  const groupKeys = Array.from(new Set(cartItems.map(i => i.fulfillmentGroup))) as FulfillmentType[];

  const [deliverySlots, setDeliverySlots] = useState<Record<FulfillmentType, string>>({
    'live-climate': 'Tue Morning (06:00 AM - 09:00 AM Express Transport)',
    'chilled-express': 'Today Evening (04:00 PM - 07:00 PM Chilled Van)',
    'frozen-deep': 'Mon Afternoon (01:00 PM - 04:00 PM Sub-Zero)',
    'dry-ambient': 'Standard Parcel Delivery (24-48 Hours)'
  });

  const subtotal = cartItems.reduce((acc, item) => {
    const isWholesale = item.product.wholesalePrice && item.quantity >= (item.product.wholesaleMinQty || 1);
    const price = isWholesale ? item.product.wholesalePrice! : item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  const logisticsTotal = groupKeys.length * 450;
  const grandTotal = subtotal + logisticsTotal;
  const maxPreAuthTotal = Math.round(grandTotal * 1.10); // +10% weight tolerance ceiling

  const hasWeightVariableItems = cartItems.some(i => 
    i.product.category === 'fresh-poultry' || i.product.unit?.includes('kg')
  );

  const filteredLocations = KENYA_DELIVERY_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(deliveryZone.toLowerCase())
  );

  // Polling interval ref & timer ref
  const pollTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const reservationTimerRef = useRef<any>(null);

  // Manage 15-Minute Reservation Grace Period
  useEffect(() => {
    reservationTimerRef.current = setInterval(() => {
      setReservationSecondsRemaining(prevSec => {
        if (prevSec > 0) return prevSec - 1;
        setReservationMinutesRemaining(prevMin => (prevMin > 0 ? prevMin - 1 : 0));
        return 59;
      });
    }, 1000);

    return () => {
      if (reservationTimerRef.current) clearInterval(reservationTimerRef.current);
    };
  }, []);

  // Cleanup polling & countdowns on unmount or subStep change
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Format and validate Kenyan phone numbers
  const validateKenyanPhone = (input: string): { isValid: boolean; formatted: string; error?: string } => {
    const cleaned = input.replace(/\D/g, '');
    let normalized = cleaned;
    
    if (normalized.startsWith('254')) {
      // 254712345678 -> length 12
    } else if (normalized.startsWith('0')) {
      normalized = '254' + normalized.substring(1);
    } else if (normalized.length === 9) {
      normalized = '254' + normalized;
    }

    if (normalized.length !== 12) {
      return { 
        isValid: false, 
        formatted: input, 
        error: 'Phone number must be a valid 9-digit Kenyan number (e.g., 0712 345 678)' 
      };
    }

    const pretty = `+254 ${normalized.substring(3, 6)} ${normalized.substring(6, 9)} ${normalized.substring(9, 12)}`;
    return { isValid: true, formatted: pretty };
  };

  // Trigger M-Pesa STK Push Request
  const handleSendPaymentRequest = async (simulateFailure?: PaymentFailureReason) => {
    const val = validateKenyanPhone(mobilePhone);
    if (!val.isValid) {
      setPhoneError(val.error || 'Please enter a valid Kenyan phone number');
      return;
    }
    setPhoneError(null);

    setPaymentSubStep('waiting');
    setCountdownSeconds(75);
    setIsResending(false);
    setPollingStatusText(`Sending Lipa Na M-Pesa STK Prompt to ${val.formatted}...`);

    const generatedOrderId = `CHX-${Math.floor(100000 + Math.random() * 900000)}`;
    const chargeAmount = hasWeightVariableItems ? maxPreAuthTotal : grandTotal;

    // Start countdown timer
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          handlePaymentFailure('timeout', 'Payment confirmation timed out after 75 seconds without handset response.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const endpoint = '/api/v1/payments/mpesa/stkpush';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: val.formatted,
          amount: chargeAmount,
          accountReference: generatedOrderId,
          transactionDesc: 'ChickMagnet M-Pesa Order',
          simulateFailureReason: simulateFailure
        })
      });

      const data = await res.json();

      if (data.success && data.data?.checkoutRequestId) {
        const reqId = data.data.checkoutRequestId;
        setActiveCheckoutRequestId(reqId);
        setPollingStatusText(
          `📲 Lipa Na M-Pesa prompt dispatched to ${val.formatted}. Enter your 4-digit M-Pesa PIN on your handset to approve.`
        );

        // Start Polling Backend Status
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(async () => {
          try {
            const statusUrl = `/api/v1/payments/mpesa/status/${reqId}`;
            const statusRes = await fetch(statusUrl);
            const statusData = await statusRes.json();

            if (statusData.success && statusData.data) {
              const tx = statusData.data;

              if (tx.status === 'COMPLETED') {
                clearInterval(pollTimerRef.current);
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

                const receipt = tx.mpesaReceiptNumber || `QK${Date.now().toString().slice(-8)}`;
                setPaymentReceiptCode(receipt);
                setPaymentSubStep('success');
              } else if (tx.status === 'FAILED' || tx.status === 'CANCELLED') {
                clearInterval(pollTimerRef.current);
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

                const reason: PaymentFailureReason = tx.failureReason || (
                  tx.resultDesc?.toLowerCase().includes('insufficient') ? 'insufficient_funds' :
                  tx.resultDesc?.toLowerCase().includes('cancel') || tx.resultDesc?.toLowerCase().includes('pin') ? 'wrong_pin' :
                  'wrong_pin'
                );

                handlePaymentFailure(reason, tx.resultDesc || 'M-Pesa payment was cancelled or rejected by handset.');
              }
            }
          } catch (pollErr) {
            // Transient network polling glitches ignored
          }
        }, 2000);

      } else {
        throw new Error(data.error?.message || 'Failed to dispatch M-Pesa payment prompt');
      }
    } catch (err: any) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      handlePaymentFailure('network_error', err.message || 'Unable to connect to Safaricom Daraja gateway.');
    }
  };

  const handlePaymentFailure = (reason: PaymentFailureReason, desc?: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setPaymentFailureReason(reason);
    setPaymentFailureDesc(desc || null);
    setPaymentSubStep('failure');
  };

  // Finalize order summary and trigger order completion ritual
  const handleProceedToFinalOrderConfirmation = (customReceipt?: string) => {
    const orderDeliverySlots: Record<string, string> = {};
    groupKeys.forEach(group => {
      orderDeliverySlots[group] = deliverySlots[group] || 'Standard Dispatch Slot';
    });

    const generatedOrderId = `CHX-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalReceipt = customReceipt || paymentReceiptCode || 'QK99182310';

    const orderSummary = {
      orderId: generatedOrderId,
      date: new Date().toISOString(),
      name,
      email,
      phone: mobilePhone || phone,
      deliveryZone,
      address,
      buyerType: accountTypePath === 'wholesale_net30' ? 'wholesale' : 'retail',
      items: cartItems,
      deliverySlots: orderDeliverySlots,
      subtotal,
      logisticsTotal,
      grandTotal,
      maxPreAuthTotal: hasWeightVariableItems ? maxPreAuthTotal : grandTotal,
      paymentMethod: accountTypePath === 'wholesale_net30' ? 'net30' : 'mpesa',
      poNumber: accountTypePath === 'wholesale_net30' ? poNumber : null,
      mpesaReceiptNumber: accountTypePath !== 'wholesale_net30' ? finalReceipt : undefined,
      batchIds: Array.from(new Set(cartItems.map(i => i.product.liveData?.batchId || i.product.freshData?.batchId || i.product.processedData?.batchId).filter(Boolean)))
    };

    onOrderCompleted(orderSummary);
  };

  const handleCopyReceipt = () => {
    if (paymentReceiptCode) {
      navigator.clipboard.writeText(paymentReceiptCode);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
    }
  };

  return (
    <div id="checkout-ritual-container" className="fixed inset-0 z-50 bg-[#0b2217]/85 backdrop-blur-md text-emerald-950 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-y-auto">
      
      {/* Main Checkout Modal Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] overflow-y-auto border-2 border-emerald-800 p-6 sm:p-8 shadow-2xl space-y-6 text-emerald-950 my-auto">
        
        {/* Progress & Breadcrumbs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-100 pb-4 gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ChickMagnet Official Checkout
            </span>
            <h1 className="font-serif text-2xl font-black text-emerald-950 mt-0.5">
              {currentStep === 'fulfillment' && '1. Logistics & Delivery Zone'}
              {currentStep === 'payment' && (
                accountTypePath === 'wholesale_net30' 
                  ? 'Commercial Wholesale Net-30 Invoicing'
                  : paymentSubStep === 'phone_entry' ? '2. Pay with M-Pesa (STK Push)' :
                    paymentSubStep === 'waiting' ? 'Authorize M-Pesa PIN on Handset' :
                    paymentSubStep === 'success' ? 'Payment Verified & Confirmed' :
                    'Payment Status & Resolution'
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 15-Min Reservation Tag */}
            <div className="bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <Timer className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>Cart Held: {reservationMinutesRemaining}:{reservationSecondsRemaining < 10 ? `0${reservationSecondsRemaining}` : reservationSecondsRemaining}</span>
            </div>

            <button
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-emerald-950 font-bold underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: LOGISTICS & MULTI-VEHICLE FULFILLMENT                             */}
        {/* ========================================================================= */}
        {currentStep === 'fulfillment' && (
          <div className="space-y-6">
            
            {/* Delivery Contact & Searchable Kenya Delivery Zone */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2 border-b border-emerald-100 pb-2">
                <Truck className="w-4.5 h-4.5 text-emerald-700" />
                Delivery Location & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3.5 py-2 text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Recipient Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setMobilePhone(e.target.value);
                    }}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3.5 py-2 text-emerald-950 font-medium focus:outline-none focus:border-emerald-700 font-mono"
                  />
                </div>

                {/* Searchable Delivery Zone for Kenya */}
                <div className="relative sm:col-span-2">
                  <label className="block text-[11px] text-emerald-900 font-mono font-bold mb-1 flex items-center justify-between">
                    <span>Delivery County / Sub-County</span>
                    <span className="text-[10px] text-emerald-700 font-bold">📍 Kenya-Wide Cold-Chain</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={deliveryZone}
                      onChange={(e) => {
                        setDeliveryZone(e.target.value);
                        setIsZoneOpen(true);
                      }}
                      onFocus={() => setIsZoneOpen(true)}
                      placeholder="Search county or town..."
                      className="w-full bg-white border-2 border-emerald-300 rounded-xl pl-9 pr-8 py-2.5 text-emerald-950 font-semibold focus:outline-none focus:border-emerald-700"
                    />
                    <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 top-3 pointer-events-none" />
                    <Search className="w-4 h-4 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
                  </div>

                  {/* Suggestions Dropdown */}
                  {isZoneOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border-2 border-emerald-600 rounded-xl shadow-2xl divide-y divide-emerald-100 text-xs">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setDeliveryZone(loc);
                              setIsZoneOpen(false);
                            }}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 text-emerald-950 font-medium flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span>{loc}</span>
                            <Check className={`w-4 h-4 ${deliveryZone === loc ? 'text-emerald-700 font-bold' : 'opacity-0'}`} />
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-emerald-900 text-xs font-medium">
                          Using custom destination: <strong>"{deliveryZone}"</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Homestead / Farm Gate Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3.5 py-2 text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* Multi-Vehicle Split Alert */}
            {groupKeys.length > 1 && (
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl text-xs space-y-1 text-amber-950 shadow-xs">
                <div className="font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Multi-Vehicle Specialized Transit ({groupKeys.length} Dedicated Packages)
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Your cart contains products with differing biosecurity & climate requirements. Each category is dispatched in dedicated climate-controlled transit (Ksh 450 per vehicle).
                </p>
              </div>
            )}

            {/* Delivery Slot Selectors */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Dispatch Slots per Fulfillment Group
              </h3>

              {groupKeys.map(group => {
                const groupTitle = group === 'live-climate' 
                  ? '🐥 Live Bird Climate Transit' 
                  : group === 'chilled-express' 
                  ? '❄️ Chilled Cold-Chain Van (0-4°C)' 
                  : group === 'frozen-deep'
                  ? '🧊 Deep Freeze Transit (-18°C)'
                  : '📦 Farm Supplies & Equipment';

                const groupOptions = group === 'live-climate' ? [
                  'Tue Morning (06:00 AM - 09:00 AM Express Transport)',
                  'Thu Morning (06:00 AM - 09:00 AM Express Transport)',
                  'Sat Morning (06:00 AM - 09:00 AM Early Dispatch)'
                ] : group === 'chilled-express' ? [
                  'Today Evening (04:00 PM - 07:00 PM Chilled Van)',
                  'Tomorrow Morning (08:00 AM - 11:00 AM Chilled Van)',
                  'Tomorrow Evening (04:00 PM - 07:00 PM Chilled Van)'
                ] : group === 'frozen-deep' ? [
                  'Mon Afternoon (01:00 PM - 04:00 PM Sub-Zero)',
                  'Wed Afternoon (01:00 PM - 04:00 PM Sub-Zero)',
                  'Fri Afternoon (01:00 PM - 04:00 PM Sub-Zero)'
                ] : [
                  'Standard Parcel Delivery (24-48 Hours)',
                  'Priority Courier (Next Day Delivery)'
                ];

                return (
                  <div key={group} className="bg-white p-4 rounded-2xl border-2 border-emerald-100 space-y-2 text-xs shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-emerald-950 font-mono">{groupTitle}</div>
                      <span className="text-[10px] bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                        Transit Fee: Ksh 450
                      </span>
                    </div>
                    <select
                      value={deliverySlots[group]}
                      onChange={(e) => setDeliverySlots({ ...deliverySlots, [group]: e.target.value })}
                      className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3 py-2 text-emerald-950 focus:outline-none focus:border-emerald-700 cursor-pointer font-medium"
                    >
                      {groupOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Order Total Overview */}
            <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-emerald-900">
                <span>Products Subtotal</span>
                <span>Ksh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-900">
                <span>Logistics ({groupKeys.length} Vehicle{groupKeys.length > 1 ? 's' : ''})</span>
                <span>Ksh {logisticsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-950 font-bold text-base border-t border-emerald-200 pt-2">
                <span className="font-serif">Grand Total</span>
                <span className="font-serif">Ksh {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentStep('payment');
                setPaymentSubStep('phone_entry');
              }}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PAYMENT FLOW SCREENS (LIPA NA M-PESA & WHOLESALE BYPASS)          */}
        {/* ========================================================================= */}
        {currentStep === 'payment' && (
          <div className="space-y-6">

            {/* ───────────────────────────────────────────────────────────────────── */}
            {/* WHOLESALE NET-30 BYPASS / TOGGLE SECTION                              */}
            {/* ───────────────────────────────────────────────────────────────────── */}
            {(isWholesaleBuyer || accountTypePath === 'wholesale_net30') && (
              <div className="bg-emerald-50 p-2 rounded-2xl border-2 border-emerald-200 flex gap-2 shadow-xs">
                <button
                  type="button"
                  onClick={() => setAccountTypePath('homesteaders')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    accountTypePath === 'homesteaders'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-white text-emerald-950 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Lipa Na M-Pesa (STK Push)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountTypePath('wholesale_net30')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    accountTypePath === 'wholesale_net30'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-white text-emerald-950 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Wholesale (Net-30 Invoice)</span>
                </button>
              </div>
            )}

            {/* WHOLESALE NET-30 DIRECT INVOICE CONFIRMATION */}
            {accountTypePath === 'wholesale_net30' ? (
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400 text-emerald-950 text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase">
                        Net-30 Credit Facility Active
                      </span>
                      <h3 className="font-serif font-black text-base text-emerald-950">
                        Commercial Wholesale Invoicing
                      </h3>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-mono mt-1">
                      No upfront STK push required. Order confirmed against your Master Supply Agreement #MSA-891.
                    </p>
                  </div>
                </div>

                {/* Credit Summary */}
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 uppercase font-bold">Approved Facility</div>
                    <div className="text-emerald-950 font-bold text-sm mt-0.5">Ksh 500,000</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 uppercase font-bold">Available Balance</div>
                    <div className="text-emerald-900 font-bold text-sm mt-0.5">Ksh 380,000</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 uppercase font-bold">Terms</div>
                    <div className="text-amber-800 font-bold text-xs mt-0.5">Net-30 Days</div>
                  </div>
                </div>

                {/* PO Number */}
                <div>
                  <label className="block text-xs font-bold text-emerald-950 font-mono mb-1">
                    Purchase Order (PO) Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3.5 py-2.5 text-emerald-950 font-mono text-xs focus:outline-none focus:border-emerald-700"
                    placeholder="e.g. PO-2026-NVR-9912"
                    required
                  />
                  <p className="text-[10px] text-emerald-700 font-mono mt-1">
                    * Invoices can later be settled via Lipa Na M-Pesa (Paybill 174379) or Bank EFT.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={net30Agreed}
                    onChange={(e) => setNet30Agreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-700"
                  />
                  <span className="font-medium">
                    I confirm this order complies with our wholesale credit facility and authorize invoicing at Net-30 terms.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('fulfillment')}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-emerald-950 font-bold py-3.5 rounded-xl text-xs cursor-pointer"
                  >
                    Back to Logistics
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProceedToFinalOrderConfirmation()}
                    disabled={!net30Agreed || !poNumber.trim()}
                    className="w-2/3 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Confirm Net-30 Order (Ksh {grandTotal.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ───────────────────────────────────────────────────────────────── */
              /* LIPA NA M-PESA STK PUSH FLOW (SINGLE-PROVIDER DIRECT FLOW)        */
              /* ───────────────────────────────────────────────────────────────── */
              <div className="space-y-6">

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SCREEN 1: PHONE NUMBER ENTRY / M-PESA CHECKOUT                  */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {paymentSubStep === 'phone_entry' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    
                    {/* Order Total Card */}
                    <div className="bg-emerald-50/90 p-5 rounded-2xl border-2 border-emerald-200 space-y-2.5 font-mono text-xs shadow-xs">
                      <div className="flex justify-between text-emerald-900">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>Ksh {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-900">
                        <span>Biosecure Cold-Chain Logistics ({groupKeys.length} Vehicle{groupKeys.length > 1 ? 's' : ''})</span>
                        <span>Ksh {logisticsTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-emerald-950 font-bold text-lg border-t-2 border-emerald-200/80 pt-2.5">
                        <span className="font-serif">Total Order Due</span>
                        <span className="font-serif text-emerald-950 font-black text-xl">Ksh {grandTotal.toLocaleString()}</span>
                      </div>
                      {hasWeightVariableItems && (
                        <p className="text-[10px] text-amber-800 font-sans pt-1">
                          * Catch-weight items included. Final charge reflects actual certified scale packaging weight.
                        </p>
                      )}
                    </div>

                    {/* Safaricom Lipa Na M-Pesa Brand Banner */}
                    <div className="p-4 rounded-2xl border-2 bg-emerald-50 border-emerald-600 text-emerald-950 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl text-white font-black flex items-center justify-center text-lg shadow-sm bg-emerald-600">
                          🟢
                        </div>
                        <div>
                          <div className="font-serif font-black text-base">
                            Safaricom Lipa Na M-Pesa
                          </div>
                          <div className="text-xs opacity-90 font-mono text-emerald-800">
                            Merchant Till: 174379 • STK Push Online
                          </div>
                        </div>
                      </div>
                      <span className="bg-emerald-200/90 text-emerald-950 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                        Official Payment Partner
                      </span>
                    </div>

                    {/* Phone Number Input Form */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-4 shadow-xs">
                      <div>
                        <label className="block text-xs font-mono font-bold text-emerald-950 mb-1.5 flex items-center justify-between">
                          <span>M-Pesa Registered Phone Number</span>
                          <span className="text-[10px] text-emerald-700 font-normal">
                            Format: +254 7XX XXX XXX
                          </span>
                        </label>

                        <div className="relative">
                          <input
                            type="tel"
                            id="mobile-payment-phone-input"
                            value={mobilePhone}
                            onChange={(e) => {
                              setMobilePhone(e.target.value);
                              setPhoneError(null);
                            }}
                            placeholder="+254 712 345 678"
                            className={`w-full bg-white border-2 rounded-xl pl-10 pr-4 py-3 text-emerald-950 font-mono font-bold text-base focus:outline-none ${
                              phoneError 
                                ? 'border-rose-500 focus:border-rose-600' 
                                : 'border-emerald-400 focus:border-emerald-700'
                            }`}
                          />
                          <Smartphone className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                        </div>

                        {phoneError && (
                          <div className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{phoneError}</span>
                          </div>
                        )}
                      </div>

                      {/* Charge Confirmation Box */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                        <div className="flex justify-between text-slate-700">
                          <span>Exact Amount to Authorize:</span>
                          <span className="font-bold text-emerald-950 text-sm">
                            Ksh {grandTotal.toLocaleString()}
                          </span>
                        </div>

                        {hasWeightVariableItems && (
                          <div className="pt-2 border-t border-slate-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-1.5 font-sans">
                            <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <strong>Catch-Weight Pre-Authorization:</strong> Includes fresh poultry. The final billed amount will be confirmed upon scale weight packaging (+10% ceiling limit: Ksh {maxPreAuthTotal.toLocaleString()}).
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Wholesale Invoicing Bypass Notice (If buyer wants Net-30 instead) */}
                    {!isWholesaleBuyer && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="text-slate-700">
                          <span className="font-bold text-emerald-950">Commercial Poultry Buyer?</span> Eligible accounts can utilize Net-30 monthly invoicing.
                        </div>
                        <button
                          type="button"
                          onClick={() => setAccountTypePath('wholesale_net30')}
                          className="text-emerald-800 hover:text-emerald-950 font-bold underline font-mono text-[11px] cursor-pointer"
                        >
                          Apply Net-30
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('fulfillment')}
                        className="w-1/3 bg-slate-100 hover:bg-slate-200 text-emerald-950 font-bold py-3.5 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        id="send-payment-request-cta"
                        onClick={() => handleSendPaymentRequest()}
                        className="w-2/3 bg-emerald-700 hover:bg-emerald-800 text-amber-200 font-black py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                      >
                        <span>Send M-Pesa STK Prompt (Ksh {grandTotal.toLocaleString()})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SCREEN 2: WAITING / M-PESA STK PUSH SENT                        */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {paymentSubStep === 'waiting' && (
                  <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200 py-2">
                    
                    {/* Active Waiting Pulsing Graphic */}
                    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-emerald-500"></div>
                      <div className="absolute -inset-3 rounded-full opacity-15 animate-pulse bg-emerald-600"></div>
                      <div className="relative w-24 h-24 rounded-3xl border-4 flex flex-col items-center justify-center shadow-xl bg-emerald-50 border-emerald-600 text-emerald-800">
                        <Smartphone className="w-10 h-10 animate-bounce text-emerald-700" />
                        <span className="text-[10px] font-mono font-black mt-1">PIN PROMPT</span>
                      </div>
                    </div>

                    {/* Prominent Message */}
                    <div className="space-y-2">
                      <span className="inline-block font-mono font-bold text-[10px] uppercase px-3 py-1 rounded-full border bg-emerald-100 text-emerald-950 border-emerald-300">
                        Lipa Na M-Pesa Online
                      </span>
                      <h2 className="font-serif text-2xl font-black text-emerald-950">
                        Check Your Phone Handset
                      </h2>
                      <p className="text-xs text-emerald-800 font-mono">
                        Prompt dispatched to <strong className="text-emerald-950">{mobilePhone}</strong>
                      </p>
                      <p className="text-sm font-semibold text-emerald-900 max-w-md mx-auto pt-1">
                        Enter your M-Pesa 4-digit PIN on your phone to complete payment.
                      </p>
                    </div>

                    {/* Countdown Progress & Timeout Indicator */}
                    <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200 max-w-md mx-auto space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-700 animate-spin" />
                          Waiting for handset confirmation...
                        </span>
                        <span className={`font-black text-sm px-2 py-0.5 rounded ${
                          countdownSeconds < 20 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-200 text-emerald-950'
                        }`}>
                          {countdownSeconds}s left
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-emerald-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            countdownSeconds < 20 ? 'bg-rose-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${(countdownSeconds / 75) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[11px] text-emerald-800 font-mono pt-1 border-t border-emerald-200">
                        <span>Amount: <strong>Ksh {grandTotal.toLocaleString()}</strong></span>
                        <span>Till: <strong>174379 (ChickMagnet)</strong></span>
                      </div>
                    </div>

                    {/* Resend & Cancel Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
                      <button
                        type="button"
                        onClick={() => handleSendPaymentRequest()}
                        disabled={isResending}
                        className="flex-1 bg-white hover:bg-emerald-50 text-emerald-950 font-bold py-2.5 px-4 rounded-xl text-xs border-2 border-emerald-300 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                        <span>Resend STK Push</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                          setPaymentSubStep('phone_entry');
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-300 cursor-pointer"
                      >
                        Cancel / Change Number
                      </button>
                    </div>

                    {/* Interactive Dev Testing / Simulation Controls */}
                    <div className="pt-4 border-t border-emerald-100 text-left max-w-md mx-auto">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Test Simulator Modes (Verify all test states):</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                            const rec = `QK${Date.now().toString().slice(-8)}`;
                            setPaymentReceiptCode(rec);
                            setPaymentSubStep('success');
                          }}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 p-2 rounded-lg text-left font-bold cursor-pointer"
                        >
                          ✓ Simulate PIN Success
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePaymentFailure('wrong_pin', 'Customer entered wrong PIN or cancelled M-Pesa prompt.')}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-950 p-2 rounded-lg text-left font-bold cursor-pointer"
                        >
                          ✕ Simulate Wrong PIN
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePaymentFailure('insufficient_funds', 'Insufficient M-Pesa wallet funds.')}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-950 p-2 rounded-lg text-left font-bold cursor-pointer"
                        >
                          ✕ Simulate Low Funds
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePaymentFailure('timeout', 'No response received from phone within 75 seconds.')}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-900 p-2 rounded-lg text-left font-bold cursor-pointer"
                        >
                          ⏱ Simulate Timeout
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SCREEN 3: RESULT — SUCCESS                                      */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {paymentSubStep === 'success' && (
                  <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200 py-2">
                    
                    {/* Success Check Icon */}
                    <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-600 text-emerald-700 rounded-full mx-auto flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono font-bold text-[10px] bg-emerald-200 text-emerald-950 px-3 py-1 rounded-full uppercase border border-emerald-300">
                        Payment Received & Verified
                      </span>
                      <h2 className="font-serif text-2xl font-black text-emerald-950 pt-2">
                        Payment Successful!
                      </h2>
                      <p className="text-xs text-emerald-800 font-mono">
                        Ksh {grandTotal.toLocaleString()} received via Safaricom Lipa Na M-Pesa
                      </p>
                    </div>

                    {/* Receipt Code Box with One-Click Copy */}
                    <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-300 max-w-md mx-auto text-left space-y-3 font-mono">
                      <div className="flex items-center justify-between text-xs text-emerald-800 border-b border-emerald-200 pb-2">
                        <span>Official Receipt Reference</span>
                        <span className="font-bold text-emerald-950">M-PESA</span>
                      </div>

                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-300">
                        <span className="text-base font-black text-emerald-950 tracking-wider">
                          {paymentReceiptCode || 'QK8912891'}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyReceipt}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-emerald-300 transition-colors"
                        >
                          {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedReceipt ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-emerald-900 space-y-1 pt-1">
                        <div className="flex justify-between">
                          <span>Phone Handset:</span>
                          <strong>{mobilePhone}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Timestamp:</span>
                          <strong>{new Date().toLocaleTimeString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Primary CTA - Continue to Order Confirmation */}
                    <div className="max-w-md mx-auto pt-2">
                      <button
                        type="button"
                        id="view-order-confirmation-cta"
                        onClick={() => handleProceedToFinalOrderConfirmation()}
                        className="w-full bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black py-4 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                      >
                        <span>View Order Confirmation & Batch Traceability</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SCREEN 4: RESULT — FAILURE / TIMEOUT                            */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {paymentSubStep === 'failure' && (
                  <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200 py-2">
                    
                    {/* Failure Icon */}
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 ${
                      paymentFailureReason === 'insufficient_funds'
                        ? 'bg-amber-100 border-amber-600 text-amber-700'
                        : paymentFailureReason === 'timeout'
                        ? 'bg-slate-100 border-slate-600 text-slate-700'
                        : 'bg-rose-100 border-rose-600 text-rose-700'
                    }`}>
                      {paymentFailureReason === 'timeout' ? (
                        <Clock className="w-12 h-12" />
                      ) : (
                        <XCircle className="w-12 h-12" />
                      )}
                    </div>

                    <div className="space-y-1.5 max-w-md mx-auto">
                      <span className={`font-mono font-bold text-[10px] px-3 py-1 rounded-full uppercase border ${
                        paymentFailureReason === 'insufficient_funds'
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : paymentFailureReason === 'timeout'
                          ? 'bg-slate-100 text-slate-900 border-slate-300'
                          : 'bg-rose-100 text-rose-950 border-rose-300'
                      }`}>
                        {paymentFailureReason === 'wrong_pin' && 'Incorrect PIN / Cancelled'}
                        {paymentFailureReason === 'insufficient_funds' && 'Insufficient Funds'}
                        {paymentFailureReason === 'timeout' && 'Confirmation Timed Out'}
                        {paymentFailureReason === 'network_error' && 'Telecom Gateway Issue'}
                      </span>

                      <h2 className="font-serif text-2xl font-black text-emerald-950 pt-1">
                        {paymentFailureReason === 'wrong_pin' && 'M-Pesa Payment Was Not Completed'}
                        {paymentFailureReason === 'insufficient_funds' && 'Insufficient M-Pesa Balance'}
                        {paymentFailureReason === 'timeout' && 'No Response Received'}
                        {paymentFailureReason === 'network_error' && 'Unable to Reach Handset'}
                      </h2>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {paymentFailureReason === 'wrong_pin' && (
                          'The M-Pesa request was cancelled or an incorrect PIN was entered on your phone. Please try again with the correct PIN.'
                        )}
                        {paymentFailureReason === 'insufficient_funds' && (
                          `Your M-Pesa balance is below Ksh ${grandTotal.toLocaleString()}. Please top up your M-Pesa wallet and retry.`
                        )}
                        {paymentFailureReason === 'timeout' && (
                          'We didn\'t receive confirmation from Safaricom. Please check if money was deducted from your M-Pesa SMS statement before retrying to avoid double charges.'
                        )}
                        {paymentFailureReason === 'network_error' && (
                          paymentFailureDesc || 'Safaricom Daraja network error. Please verify phone network connectivity and retry.'
                        )}
                      </p>
                    </div>

                    {/* Stock Reservation Grace Period Notice */}
                    <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 max-w-md mx-auto text-left space-y-1.5 text-xs text-amber-950 font-mono">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Cart & Batch Stock Held in Grace Period</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                        Your bird batch allocations and cold-chain cuts are held safely for <strong>{reservationMinutesRemaining} minutes</strong> while you retry. You will not lose your cart to other buyers.
                      </p>
                    </div>

                    {/* Action CTAs: Retry directly to Screen 1 (Phone Entry) or Back to Delivery */}
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('fulfillment')}
                        className="w-full sm:w-1/2 bg-slate-100 hover:bg-slate-200 text-emerald-950 font-bold py-3.5 rounded-xl text-xs cursor-pointer border border-slate-300 transition-colors"
                      >
                        Back to Delivery Details
                      </button>

                      <button
                        type="button"
                        id="retry-payment-cta"
                        onClick={() => setPaymentSubStep('phone_entry')}
                        className="w-full sm:w-1/2 bg-emerald-700 hover:bg-emerald-800 text-amber-200 font-black py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry M-Pesa Payment</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
