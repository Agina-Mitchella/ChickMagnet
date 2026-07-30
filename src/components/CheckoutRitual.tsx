import React, { useState } from 'react';
import { ShieldCheck, Truck, CheckCircle2, Clock, FileText, CreditCard, AlertTriangle, ArrowRight, Lock, Calendar, Scale, Building2, Smartphone, Check } from 'lucide-react';
import { CartItem, BuyerType, FulfillmentType } from '../types';

interface CheckoutRitualProps {
  cartItems: CartItem[];
  buyerType: BuyerType;
  onOrderCompleted: (orderSummary: any) => void;
  onCancel: () => void;
}

export default function CheckoutRitual({
  cartItems,
  buyerType,
  onOrderCompleted,
  onCancel
}: CheckoutRitualProps) {
  // Step flow: fulfillment -> payment -> (weight_preauth if retail card/mpesa with fresh items)
  const [currentStep, setCurrentStep] = useState<'fulfillment' | 'payment' | 'weight_preauth'>('fulfillment');

  // Customer Contact Info
  const [name, setName] = useState('Amara Oakwood');
  const [email, setEmail] = useState('amara.oakwood@farmnet.co.ke');
  const [phone, setPhone] = useState('+254 712 345 678');
  const [deliveryZone, setDeliveryZone] = useState('Nairobi Metro');
  const [address, setAddress] = useState('Farm 14, Naivasha Road, Dagoretti');

  // Account Payment Path Selection
  const [accountTypePath, setAccountTypePath] = useState<'retail' | 'wholesale_net30'>(
    buyerType === 'wholesale' ? 'wholesale_net30' : 'retail'
  );

  // Retail Payment Sub-method (M-Pesa vs Card)
  const [retailPayMethod, setRetailPayMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('+254 712 345 678');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9012');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('123');

  // Wholesale Net-30 Specific Fields
  const [poNumber, setPoNumber] = useState('PO-2026-NVR-8821');
  const [net30Agreed, setNet30Agreed] = useState(true);

  // Weight Pre-Auth Agreement
  const [preAuthAgreed, setPreAuthAgreed] = useState(false);

  // Fulfillment group delivery slot choices
  const groupKeys = Array.from(new Set(cartItems.map(i => i.fulfillmentGroup))) as FulfillmentType[];

  const [deliverySlots, setDeliverySlots] = useState<Record<FulfillmentType, string>>({
    'live-climate': 'Tue Morning (06:00 AM - 09:00 AM Climate Vehicle)',
    'chilled-express': 'Today Evening (04:00 PM - 07:00 PM Chilled Van)',
    'frozen-deep': 'Tomorrow Afternoon (01:00 PM - 04:00 PM Sub-Zero Express)',
    'dry-ambient': 'Standard Delivery (24-48 Hours Parcel)'
  });

  const subtotal = cartItems.reduce((acc, item) => {
    const isWholesale = item.product.wholesalePrice && item.quantity >= (item.product.wholesaleMinQty || 1);
    const price = isWholesale ? item.product.wholesalePrice! : item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  const logisticsTotal = groupKeys.length * 450;
  const grandTotal = subtotal + logisticsTotal;
  const maxPreAuthTotal = Math.round(grandTotal * 1.10); // +10% weight tolerance ceiling

  const hasWeightVariableItems = cartItems.some(i => i.product.category === 'fresh-poultry' || i.product.unit?.includes('kg'));

  const handleProceedFromPayment = () => {
    if (accountTypePath === 'wholesale_net30') {
      // Wholesale Net-30 directly completes order without retail pre-authorization hold
      handleCompleteOrder('net30');
    } else {
      // Retail payment path: if cart has weight-variable fresh items, show weight pre-auth disclosure screen
      if (hasWeightVariableItems) {
        setCurrentStep('weight_preauth');
      } else {
        handleCompleteOrder(retailPayMethod);
      }
    }
  };

  const handleCompleteOrder = (methodUsed: string) => {
    const orderSummary = {
      orderId: `CHX-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      name,
      email,
      phone,
      buyerType: accountTypePath === 'wholesale_net30' ? 'wholesale' : 'retail',
      items: cartItems,
      deliverySlots,
      subtotal,
      logisticsTotal,
      grandTotal,
      maxPreAuthTotal: hasWeightVariableItems ? maxPreAuthTotal : grandTotal,
      paymentMethod: methodUsed === 'net30' ? 'net30' : retailPayMethod,
      poNumber: methodUsed === 'net30' ? poNumber : null,
      batchIds: Array.from(new Set(cartItems.map(i => i.product.liveData?.batchId || i.product.freshData?.batchId || i.product.processedData?.batchId).filter(Boolean)))
    };

    onOrderCompleted(orderSummary);
  };

  return (
    <div className="min-h-screen bg-[#0b2217] text-amber-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-[#123524] rounded-3xl max-w-3xl w-full border border-emerald-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Progress Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-800 pb-4 gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              ChickMagnet Checkout Ritual
            </span>
            <h1 className="font-serif text-2xl font-black text-amber-300 mt-0.5">
              {currentStep === 'fulfillment' && '1. Logistics & Fulfillment Selection'}
              {currentStep === 'payment' && '2. Payment Method by Account Type'}
              {currentStep === 'weight_preauth' && '3. Scale Weight Pre-Authorization'}
            </h1>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-emerald-300 hover:text-white underline cursor-pointer self-start sm:self-auto"
          >
            Cancel & Return to Cart
          </button>
        </div>

        {/* STEP 1: LOGISTICS & MULTI-FULFILLMENT SLOT SELECTION */}
        {currentStep === 'fulfillment' && (
          <div className="space-y-6">
            
            {/* Delivery Contact & Zone */}
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 space-y-3">
              <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Delivery Location & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-emerald-300 font-mono mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#123524] border border-emerald-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-emerald-300 font-mono mb-1">Phone Number (Dispatch Contact)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#123524] border border-emerald-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-emerald-300 font-mono mb-1">Delivery Zone</label>
                  <select
                    value={deliveryZone}
                    onChange={(e) => setDeliveryZone(e.target.value)}
                    className="w-full bg-[#123524] border border-emerald-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Nairobi Metro">Nairobi Metro Area</option>
                    <option value="Naivasha & Rift Valley">Naivasha & Rift Valley Poultry Corridor</option>
                    <option value="Nyeri & Central Kenya">Nyeri & Central High Country</option>
                    <option value="Coastal Region">Mombasa & Coastal Express</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-emerald-300 font-mono mb-1">Farm / Address Location</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#123524] border border-emerald-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Multi-Fulfillment Group Alert if mixed items exist */}
            {groupKeys.length > 1 && (
              <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-2xl text-xs space-y-1 text-amber-200">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Multi-Vehicle Fulfillment Split ({groupKeys.length} Packages)
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your cart contains products with different storage requirements (e.g. live chicks vs chilled meat). They ship in separate specialized vehicles with individual delivery slots and logistics fees (Ksh 450 per vehicle).
                </p>
              </div>
            )}

            {/* Per-Fulfillment Group Slot Pickers */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Select Dispatch Slots per Fulfillment Group
              </h3>

              {groupKeys.map(group => {
                const groupTitle = group === 'live-climate' 
                  ? '🐥 Live Bird Climate Transit' 
                  : group === 'chilled-express' 
                  ? '❄️ Chilled Cold-Chain Van (0-4°C)' 
                  : group === 'frozen-deep'
                  ? '🧊 Frozen Deep Freeze Express (-18°C)'
                  : '📦 Dry Farm Supplies';

                const groupOptions = group === 'live-climate' ? [
                  'Tue Morning (06:00 AM - 09:00 AM Climate Transit)',
                  'Thu Morning (06:00 AM - 09:00 AM Climate Transit)',
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
                  <div key={group} className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-amber-300 font-mono">{groupTitle}</div>
                      <span className="text-[10px] bg-emerald-900 text-amber-300 px-2 py-0.5 rounded font-mono">
                        Vehicle Fee: Ksh 450
                      </span>
                    </div>
                    <select
                      value={deliverySlots[group]}
                      onChange={(e) => setDeliverySlots({ ...deliverySlots, [group]: e.target.value })}
                      className="w-full bg-[#123524] border border-emerald-700 rounded-xl px-3 py-2 text-amber-50 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {groupOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentStep('payment')}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Payment Method</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT METHOD BRANCHING BY ACCOUNT TYPE */}
        {currentStep === 'payment' && (
          <div className="space-y-6">
            
            {/* Account Path Switcher (Retail Upfront vs Wholesale Net-30) */}
            <div className="bg-[#0b2217] p-2 rounded-2xl border border-emerald-800 flex gap-2">
              <button
                onClick={() => setAccountTypePath('retail')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  accountTypePath === 'retail'
                    ? 'bg-amber-400 text-emerald-950 shadow-md'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Retail & Homestead (Upfront Payment)</span>
              </button>

              <button
                onClick={() => setAccountTypePath('wholesale_net30')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  accountTypePath === 'wholesale_net30'
                    ? 'bg-amber-400 text-emerald-950 shadow-md'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Commercial Wholesale (Net-30 Invoice)</span>
              </button>
            </div>

            {/* SCREEN 3A: RETAIL UPFRONT PAYMENT SCREEN */}
            {accountTypePath === 'retail' && (
              <div className="bg-[#0b2217] p-5 rounded-2xl border border-emerald-800 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Retail Upfront Payment Method
                    </h3>
                    <p className="text-[11px] text-emerald-300 font-mono mt-0.5">
                      Select M-Pesa Mobile Money or Credit/Debit Card
                    </p>
                  </div>
                </div>

                {/* Sub-method toggle: M-Pesa vs Card */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRetailPayMethod('mpesa')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      retailPayMethod === 'mpesa'
                        ? 'bg-emerald-900/80 border-amber-400 text-amber-300'
                        : 'bg-[#123524] border-emerald-800 text-emerald-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400 mb-1" />
                    <div className="font-bold text-xs">M-Pesa Mobile Money</div>
                    <div className="text-[10px] text-emerald-400">Instant STK Push prompt</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRetailPayMethod('card')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      retailPayMethod === 'card'
                        ? 'bg-emerald-900/80 border-amber-400 text-amber-300'
                        : 'bg-[#123524] border-emerald-800 text-emerald-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="font-bold text-xs">Credit / Debit Card</div>
                    <div className="text-[10px] text-emerald-400">Visa / Mastercard / Amex</div>
                  </button>
                </div>

                {/* M-Pesa Input Form */}
                {retailPayMethod === 'mpesa' && (
                  <div className="bg-[#123524] p-4 rounded-xl border border-emerald-700 space-y-3 text-xs">
                    <div>
                      <label className="block text-emerald-300 font-mono mb-1">M-Pesa Phone Number</label>
                      <input
                        type="text"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="w-full bg-[#0b2217] border border-emerald-600 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                    <div className="text-[10px] text-emerald-300 bg-emerald-950 p-2 rounded-lg border border-emerald-800">
                      📲 An M-Pesa STK PIN prompt will be sent to your handset upon clicking continue.
                    </div>
                  </div>
                )}

                {/* Credit Card Input Form */}
                {retailPayMethod === 'card' && (
                  <div className="bg-[#123524] p-4 rounded-xl border border-emerald-700 space-y-3 text-xs">
                    <div>
                      <label className="block text-emerald-300 font-mono mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#0b2217] border border-emerald-600 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-emerald-300 font-mono mb-1">Expiration</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#0b2217] border border-emerald-600 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-emerald-300 font-mono mb-1">CVV Security Code</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-[#0b2217] border border-emerald-600 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SCREEN 3B: WHOLESALE COMMERCIAL NET-30 SCREEN (DISTINCT B2B SCREEN) */}
            {accountTypePath === 'wholesale_net30' && (
              <div className="bg-[#0b2217] p-5 rounded-2xl border border-amber-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-emerald-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                        B2B Account Verified
                      </span>
                      <h3 className="font-serif font-black text-base text-amber-300">
                        Wholesale Net-30 Invoiced Account
                      </h3>
                    </div>
                    <p className="text-[11px] text-emerald-300 font-mono mt-0.5">
                      No upfront card charge required • Billed under Master Supply Agreement #MSA-891
                    </p>
                  </div>
                </div>

                {/* Credit Limit & Balance Summary Card */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold">Approved Credit Limit</div>
                    <div className="text-amber-300 font-bold text-sm mt-0.5">Ksh 500,000</div>
                  </div>
                  <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold">Available Credit</div>
                    <div className="text-emerald-300 font-bold text-sm mt-0.5">Ksh 380,000</div>
                  </div>
                  <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold">Payment Terms</div>
                    <div className="text-amber-300 font-bold text-xs mt-0.5">Net-30 Days</div>
                  </div>
                </div>

                {/* Purchase Order (PO) Number Field */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 font-mono mb-1">
                    Purchase Order (PO) Number / Reference <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-[#123524] border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                    placeholder="e.g. PO-2026-NVR-9912"
                    required
                  />
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">
                    This PO number will appear on your dispatch advice and monthly consolidated invoice.
                  </div>
                </div>

                {/* Commercial Terms Checkbox */}
                <label className="flex items-start gap-2.5 text-xs text-emerald-200 cursor-pointer pt-2 border-t border-emerald-800">
                  <input
                    type="checkbox"
                    checked={net30Agreed}
                    onChange={(e) => setNet30Agreed(e.target.checked)}
                    className="mt-0.5 accent-amber-500 rounded"
                  />
                  <span className="leading-snug">
                    I confirm that I am authorized to place orders on behalf of <strong>Oakwood Poultry Farms Ltd.</strong> and that this order will be invoiced under 30-day payment terms.
                  </span>
                </label>
              </div>
            )}

            {/* Order Cost Breakdown */}
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-emerald-300">
                <span>Items Subtotal</span>
                <span>Ksh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Multi-Vehicle Logistics ({groupKeys.length} vehicles)</span>
                <span>Ksh {logisticsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-300 font-bold text-sm pt-2 border-t border-emerald-800 font-serif">
                <span>Total Payable / Invoiced</span>
                <span>Ksh {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('fulfillment')}
                className="w-1/3 bg-[#0b2217] hover:bg-emerald-900 border border-emerald-700 font-bold py-3.5 rounded-xl text-xs text-emerald-300 cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={accountTypePath === 'wholesale_net30' && (!poNumber || !net30Agreed)}
                onClick={handleProceedFromPayment}
                className={`w-2/3 py-3.5 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  accountTypePath === 'wholesale_net30' && (!poNumber || !net30Agreed)
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {accountTypePath === 'wholesale_net30'
                    ? 'Submit Wholesale Net-30 Order'
                    : hasWeightVariableItems
                    ? 'Continue to Pre-Authorization'
                    : 'Confirm & Place Retail Order'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RETAIL SCALE WEIGHT PRE-AUTHORIZATION SCREEN */}
        {currentStep === 'weight_preauth' && (
          <div className="space-y-6">
            
            <div className="bg-amber-950/80 border border-amber-500/60 p-5 rounded-2xl space-y-4 text-xs text-amber-200 shadow-xl">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm border-b border-amber-500/40 pb-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <span>Scale Weight Pre-Authorization Disclosure</span>
              </div>

              <p className="leading-relaxed">
                Because fresh dressed poultry cuts and whole birds naturally vary in weight during packing, retail card / mobile payments require a temporary pre-authorization hold:
              </p>

              <div className="bg-[#0b2217] p-4 rounded-xl border border-emerald-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-emerald-300">
                  <span>Estimated Base Total</span>
                  <span>Ksh {grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-300 font-bold text-sm pt-2 border-t border-emerald-800">
                  <span>Pre-Authorization Hold Limit (+10% Weight Cushion)</span>
                  <span className="text-amber-400 font-serif text-base">Ksh {maxPreAuthTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-amber-300/90 leading-relaxed bg-amber-900/40 p-3 rounded-xl border border-amber-500/30">
                🔒 <strong>Compliance Guarantee:</strong> Your final card charge will be automatically adjusted downwards to match actual scale-weighed packed poultry at dispatch. You will never be billed for more than the exact scale weight delivered.
              </div>

              <label className="flex items-start gap-2.5 text-xs text-amber-100 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={preAuthAgreed}
                  onChange={(e) => setPreAuthAgreed(e.target.checked)}
                  className="mt-0.5 accent-amber-500 rounded"
                />
                <span className="leading-snug">
                  I authorize a pre-authorization hold of up to <strong>Ksh {maxPreAuthTotal.toLocaleString()}</strong> for actual scale-weighed packed poultry.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('payment')}
                className="w-1/3 bg-[#0b2217] hover:bg-emerald-900 border border-emerald-700 font-bold py-3.5 rounded-xl text-xs text-emerald-300 cursor-pointer"
              >
                Back to Payment
              </button>
              <button
                disabled={!preAuthAgreed}
                onClick={() => handleCompleteOrder(retailPayMethod)}
                className={`w-2/3 py-3.5 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  !preAuthAgreed
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Authorize Hold & Complete Order</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
