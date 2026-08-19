import React, { useState } from 'react';
import { ShieldCheck, Truck, CheckCircle2, Clock, FileText, CreditCard, AlertTriangle, ArrowRight, Lock, Calendar, Scale, Building2, Smartphone, Check, Search, MapPin } from 'lucide-react';
import { CartItem, BuyerType, FulfillmentType } from '../types';

interface CheckoutRitualProps {
  cartItems: CartItem[];
  buyerType: BuyerType;
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

export default function CheckoutRitual({
  cartItems,
  buyerType,
  onOrderCompleted,
  onCancel
}: CheckoutRitualProps) {
  // Step flow: fulfillment -> payment -> (weight_preauth if retail card/mpesa with fresh items)
  const [currentStep, setCurrentStep] = useState<'fulfillment' | 'payment' | 'weight_preauth'>('fulfillment');

  // Customer Contact Info
  const [name, setName] = useState('Agina');
  const [email, setEmail] = useState('uxagina@gmail.com');
  const [phone, setPhone] = useState('+254 712 345 678');
  const [deliveryZone, setDeliveryZone] = useState('Nairobi Metro - Dagoretti & Naivasha Rd');
  const [isZoneOpen, setIsZoneOpen] = useState(false);
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

  // M-Pesa STK Push Async Flow State
  const [mpesaProcessing, setMpesaProcessing] = useState(false);
  const [mpesaCheckoutRequestId, setMpesaCheckoutRequestId] = useState<string | null>(null);
  const [mpesaStatusText, setMpesaStatusText] = useState('Sending STK Push prompt to your handset...');
  const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
  const [mpesaError, setMpesaError] = useState<string | null>(null);

  // Wholesale Net-30 Specific Fields
  const [poNumber, setPoNumber] = useState('PO-2026-NVR-8821');
  const [net30Agreed, setNet30Agreed] = useState(true);

  // Weight Pre-Auth Agreement
  const [preAuthAgreed, setPreAuthAgreed] = useState(false);

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

  const hasWeightVariableItems = cartItems.some(i => i.product.category === 'fresh-poultry' || i.product.unit?.includes('kg'));

  const filteredLocations = KENYA_DELIVERY_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(deliveryZone.toLowerCase())
  );

  const handleProceedFromPayment = () => {
    if (accountTypePath === 'wholesale_net30') {
      handleCompleteOrder('net30');
    } else {
      if (hasWeightVariableItems) {
        setCurrentStep('weight_preauth');
      } else {
        handleCompleteOrder(retailPayMethod);
      }
    }
  };

  const handleCompleteOrder = async (methodUsed: string) => {
    const orderDeliverySlots: Record<string, string> = {};
    groupKeys.forEach(group => {
      orderDeliverySlots[group] = deliverySlots[group] || 'Standard Dispatch Slot';
    });

    const generatedOrderId = `CHX-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderSummaryBase = {
      orderId: generatedOrderId,
      date: new Date().toISOString(),
      name,
      email,
      phone,
      deliveryZone,
      address,
      buyerType: accountTypePath === 'wholesale_net30' ? 'wholesale' : 'retail',
      items: cartItems,
      deliverySlots: orderDeliverySlots,
      subtotal,
      logisticsTotal,
      grandTotal,
      maxPreAuthTotal: hasWeightVariableItems ? maxPreAuthTotal : grandTotal,
      paymentMethod: methodUsed === 'net30' ? 'net30' : retailPayMethod,
      poNumber: methodUsed === 'net30' ? poNumber : null,
      batchIds: Array.from(new Set(cartItems.map(i => i.product.liveData?.batchId || i.product.freshData?.batchId || i.product.processedData?.batchId).filter(Boolean)))
    };

    if (methodUsed === 'mpesa') {
      setMpesaProcessing(true);
      setMpesaError(null);
      setMpesaReceipt(null);
      setMpesaStatusText(`Sending M-Pesa STK Push prompt to ${mpesaPhone}...`);

      try {
        const res = await fetch('/api/v1/payments/mpesa/stkpush', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: mpesaPhone,
            amount: hasWeightVariableItems ? maxPreAuthTotal : grandTotal,
            accountReference: generatedOrderId,
            transactionDesc: 'ChickMagnet Order'
          })
        });

        const data = await res.json();

        if (data.success && data.data?.checkoutRequestId) {
          const checkoutReqId = data.data.checkoutRequestId;
          setMpesaCheckoutRequestId(checkoutReqId);
          setMpesaStatusText(`📲 STK Push prompt sent to ${mpesaPhone}. Please check your phone handset and enter your M-Pesa PIN...`);

          // Poll for transaction confirmation status
          const intervalId = setInterval(async () => {
            try {
              const statusRes = await fetch(`/api/v1/payments/mpesa/status/${checkoutReqId}`);
              const statusData = await statusRes.json();

              if (statusData.success && statusData.data) {
                const tx = statusData.data;
                if (tx.status === 'COMPLETED') {
                  clearInterval(intervalId);
                  setMpesaReceipt(tx.mpesaReceiptNumber || 'M-PESA-VERIFIED');
                  setMpesaStatusText(`✅ M-Pesa payment received! Receipt: ${tx.mpesaReceiptNumber || 'QK8812920'}`);
                  
                  setTimeout(() => {
                    setMpesaProcessing(false);
                    onOrderCompleted({
                      ...orderSummaryBase,
                      mpesaReceiptNumber: tx.mpesaReceiptNumber,
                      mpesaPhoneNumber: tx.phoneNumber
                    });
                  }, 1200);
                } else if (tx.status === 'FAILED' || tx.status === 'CANCELLED') {
                  clearInterval(intervalId);
                  setMpesaError(tx.resultDesc || 'M-Pesa transaction failed or was cancelled on handset.');
                }
              }
            } catch (err) {
              // Ignore transient polling network glitches
            }
          }, 2000);

          // Timeout polling safety net (60s)
          setTimeout(() => {
            clearInterval(intervalId);
          }, 60000);

        } else {
          setMpesaError(data.error?.message || 'Failed to trigger M-Pesa STK Push prompt.');
        }
      } catch (err: any) {
        setMpesaError(err.message || 'Unable to connect to M-Pesa payment server.');
      }
      return;
    }

    onOrderCompleted(orderSummaryBase);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b2217]/85 backdrop-blur-md text-emerald-950 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-y-auto">
      
      {/* M-Pesa STK Push Interactive Handset Prompt Modal */}
      {mpesaProcessing && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border-4 border-emerald-600 p-6 shadow-2xl space-y-5 text-emerald-950 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl border-2 border-emerald-500 mx-auto flex items-center justify-center shadow-inner">
              <Smartphone className="w-9 h-9 text-emerald-700 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px] uppercase px-2.5 py-1 rounded-full border border-emerald-300">
                Safaricom Lipa Na M-Pesa
              </span>
              <h2 className="font-serif text-2xl font-black text-emerald-950 pt-2">
                Check Your Phone
              </h2>
              <p className="text-xs text-emerald-800 font-mono">
                STK Push sent to <strong className="text-emerald-950">{mpesaPhone}</strong>
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200 space-y-2 text-xs font-mono text-left">
              <div className="flex justify-between text-emerald-900 border-b border-emerald-200 pb-2">
                <span>Business / Till</span>
                <span className="font-bold text-emerald-950">ChickMagnet Stores</span>
              </div>
              <div className="flex justify-between text-emerald-900 border-b border-emerald-200 pb-2">
                <span>Amount Payable</span>
                <span className="font-bold text-amber-700 font-serif text-sm">
                  Ksh {(hasWeightVariableItems ? maxPreAuthTotal : grandTotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-900">
                <span>Status</span>
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  {mpesaReceipt ? '✅ VERIFIED' : '⏳ Waiting for M-Pesa PIN'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-medium leading-relaxed">
              {mpesaStatusText}
            </div>

            {mpesaError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold">
                ⚠️ {mpesaError}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setMpesaProcessing(false);
                  setMpesaError(null);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs cursor-pointer border border-slate-300"
              >
                {mpesaError ? 'Close & Try Again' : 'Cancel STK Push'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pure White Container for Checkout & Payment Screens */}
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border-2 border-emerald-800 p-6 sm:p-8 shadow-2xl space-y-6 text-emerald-950 my-auto">
        
        {/* Progress Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-100 pb-4 gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ChickMagnet Secure Checkout
            </span>
            <h1 className="font-serif text-2xl font-black text-emerald-950 mt-0.5">
              {currentStep === 'fulfillment' && '1. Logistics & Delivery Selection'}
              {currentStep === 'payment' && '2. Payment Method by Account Type'}
              {currentStep === 'weight_preauth' && '3. Scale Weight Authorization'}
            </h1>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer self-start sm:self-auto"
          >
            Cancel & Return to Cart
          </button>
        </div>

        {/* STEP 1: LOGISTICS & MULTI-FULFILLMENT SLOT SELECTION */}
        {currentStep === 'fulfillment' && (
          <div className="space-y-6">
            
            {/* Delivery Contact & Typed/Searchable Kenya Delivery Zone */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2 border-b border-emerald-100 pb-2">
                <Truck className="w-4.5 h-4.5 text-emerald-700" />
                Delivery Location & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3.5 py-2 text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Phone Number (Dispatch Contact)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3.5 py-2 text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  />
                </div>

                {/* Typed & Searchable Delivery Zone for ALL Places in Kenya */}
                <div className="relative sm:col-span-2">
                  <label className="block text-[11px] text-emerald-900 font-mono font-bold mb-1 flex items-center justify-between">
                    <span>Delivery Zone (Type & Search Any Place in Kenya)</span>
                    <span className="text-[10px] text-emerald-700 font-bold">📍 Kenya-Wide Coverage</span>
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
                      placeholder="Type county, city, town or area in Kenya..."
                      className="w-full bg-white border-2 border-emerald-300 rounded-xl pl-9 pr-8 py-2.5 text-emerald-950 font-semibold focus:outline-none focus:border-emerald-700"
                    />
                    <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 top-3 pointer-events-none" />
                    <Search className="w-4 h-4 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
                  </div>

                  {/* Suggestions Dropdown */}
                  {isZoneOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border-2 border-emerald-600 rounded-xl shadow-2xl divide-y divide-emerald-100 text-xs">
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
                          Using custom location in Kenya: <strong>"{deliveryZone}"</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Specific Farm / Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3.5 py-2 text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* Multi-Fulfillment Group Alert if mixed items exist */}
            {groupKeys.length > 1 && (
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl text-xs space-y-1 text-amber-950 shadow-xs">
                <div className="font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Multi-Vehicle Fulfillment Split ({groupKeys.length} Packages)
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Your cart contains products with different storage requirements (e.g. live chicks vs chilled meat). They ship in separate specialized vehicles with individual delivery slots and logistics fees (Ksh 450 per vehicle).
                </p>
              </div>
            )}

            {/* Per-Fulfillment Group Slot Pickers */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Select Dispatch Slots per Fulfillment Group
              </h3>

              {groupKeys.map(group => {
                const groupTitle = group === 'live-climate' 
                  ? '🐥 Live Bird Express Transport' 
                  : group === 'chilled-express' 
                  ? '❄️ Chilled Cold-Chain Van (0-4°C)' 
                  : group === 'frozen-deep'
                  ? '🧊 Frozen Deep Freeze Express (-18°C)'
                  : '📦 Dry Farm Supplies';

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
                        Vehicle Fee: Ksh 450
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

            <button
              onClick={() => setCurrentStep('payment')}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Continue to Payment Method</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT METHOD BRANCHING BY ACCOUNT TYPE */}
        {currentStep === 'payment' && (
          <div className="space-y-6">
            
            {/* Account Path Switcher (Retail Upfront vs Wholesale Net-30) */}
            <div className="bg-emerald-50 p-2 rounded-2xl border-2 border-emerald-200 flex gap-2 shadow-xs">
              <button
                onClick={() => setAccountTypePath('retail')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  accountTypePath === 'retail'
                    ? 'bg-emerald-800 text-amber-300 shadow-sm'
                    : 'bg-white text-emerald-950 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Retail & Homestead (Upfront Payment)</span>
              </button>

              <button
                onClick={() => setAccountTypePath('wholesale_net30')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  accountTypePath === 'wholesale_net30'
                    ? 'bg-emerald-800 text-amber-300 shadow-sm'
                    : 'bg-white text-emerald-950 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Commercial Wholesale (Net-30 Invoice)</span>
              </button>
            </div>

            {/* SCREEN 3A: RETAIL UPFRONT PAYMENT SCREEN */}
            {accountTypePath === 'retail' && (
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      Retail Upfront Payment Method
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                      Select M-Pesa Mobile Money or Credit/Debit Card
                    </p>
                  </div>
                </div>

                {/* Sub-method toggle: M-Pesa vs Card */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRetailPayMethod('mpesa')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      retailPayMethod === 'mpesa'
                        ? 'bg-emerald-100/90 border-emerald-700 text-emerald-950'
                        : 'bg-white border-emerald-200 text-emerald-900 hover:border-emerald-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-700 mb-1" />
                    <div className="font-bold text-xs text-emerald-950">M-Pesa Mobile Money</div>
                    <div className="text-[10px] text-emerald-700">Instant STK Push prompt</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRetailPayMethod('card')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      retailPayMethod === 'card'
                        ? 'bg-emerald-100/90 border-emerald-700 text-emerald-950'
                        : 'bg-white border-emerald-200 text-emerald-900 hover:border-emerald-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-700 mb-1" />
                    <div className="font-bold text-xs text-emerald-950">Credit / Debit Card</div>
                    <div className="text-[10px] text-emerald-700">Visa / Mastercard / Amex</div>
                  </button>
                </div>

                {/* M-Pesa Input Form */}
                {retailPayMethod === 'mpesa' && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-emerald-950 font-mono font-bold mb-1">M-Pesa Phone Number</label>
                      <input
                        type="text"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3.5 py-2 text-emerald-950 font-mono focus:outline-none focus:border-emerald-700"
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                    <div className="text-[10px] text-emerald-950 bg-white p-2.5 rounded-lg border border-emerald-200 font-medium">
                      📲 An M-Pesa STK PIN prompt will be sent to your handset upon clicking continue.
                    </div>
                  </div>
                )}

                {/* Credit Card Input Form */}
                {retailPayMethod === 'card' && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-emerald-950 font-mono font-bold mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3.5 py-2 text-emerald-950 font-mono focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-emerald-950 font-mono font-bold mb-1">Expiration</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3.5 py-2 text-emerald-950 font-mono focus:outline-none focus:border-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="block text-emerald-950 font-mono font-bold mb-1">CVV Security Code</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3.5 py-2 text-emerald-950 font-mono focus:outline-none focus:border-emerald-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SCREEN 3B: WHOLESALE COMMERCIAL NET-30 SCREEN */}
            {accountTypePath === 'wholesale_net30' && (
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400 text-emerald-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                        B2B Account Verified
                      </span>
                      <h3 className="font-serif font-black text-base text-emerald-950">
                        Wholesale Net-30 Invoiced Account
                      </h3>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                      No upfront card charge required • Billed under Master Supply Agreement #MSA-891
                    </p>
                  </div>
                </div>

                {/* Credit Limit & Balance Summary Card */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 uppercase font-bold">Approved Credit Limit</div>
                    <div className="text-emerald-950 font-bold text-sm mt-0.5">Ksh 500,000</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 uppercase font-bold">Available Credit</div>
                    <div className="text-emerald-900 font-bold text-sm mt-0.5">Ksh 380,000</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-emerald-800 uppercase font-bold">Payment Terms</div>
                    <div className="text-amber-800 font-bold text-xs mt-0.5">Net-30 Days</div>
                  </div>
                </div>

                {/* Purchase Order (PO) Number Field */}
                <div>
                  <label className="block text-xs font-bold text-emerald-950 font-mono mb-1">
                    Purchase Order (PO) Number / Reference <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3.5 py-2.5 text-emerald-950 font-mono text-xs focus:outline-none focus:border-emerald-700"
                    placeholder="e.g. PO-2026-NVR-9912"
                    required
                  />
                  <div className="text-[10px] text-emerald-700 font-mono mt-1">
                    This PO number will appear on your dispatch advice and monthly consolidated invoice.
                  </div>
                </div>

                {/* Commercial Terms Checkbox */}
                <label className="flex items-start gap-2.5 text-xs text-emerald-950 cursor-pointer pt-2 border-t border-emerald-100">
                  <input
                    type="checkbox"
                    checked={net30Agreed}
                    onChange={(e) => setNet30Agreed(e.target.checked)}
                    className="mt-0.5 accent-emerald-800 rounded"
                  />
                  <span className="leading-snug">
                    I confirm that I am authorized to place orders on behalf of <strong>Oakwood Poultry Farms Ltd.</strong> and that this order will be invoiced under 30-day payment terms.
                  </span>
                </label>
              </div>
            )}

            {/* Order Cost Breakdown */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-200 space-y-2 text-xs font-mono shadow-xs">
              <div className="flex justify-between text-emerald-900">
                <span>Items Subtotal</span>
                <span className="text-emerald-950 font-bold">Ksh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-900">
                <span>Multi-Vehicle Logistics ({groupKeys.length} vehicles)</span>
                <span className="text-emerald-950 font-bold">Ksh {logisticsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-950 font-bold text-sm pt-2 border-t border-emerald-200 font-serif">
                <span>Total Payable / Invoiced</span>
                <span className="text-base text-amber-700 font-bold">Ksh {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('fulfillment')}
                className="w-1/3 bg-white hover:bg-emerald-50 border-2 border-emerald-300 font-bold py-3.5 rounded-xl text-xs text-emerald-950 cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                disabled={accountTypePath === 'wholesale_net30' && (!poNumber || !net30Agreed)}
                onClick={handleProceedFromPayment}
                className={`w-2/3 py-3.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  accountTypePath === 'wholesale_net30' && (!poNumber || !net30Agreed)
                    ? 'bg-emerald-100 text-emerald-500 border border-emerald-200 cursor-not-allowed shadow-none'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-300" />
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
            
            <div className="bg-white border-2 border-emerald-200 p-5 rounded-2xl space-y-4 text-xs text-emerald-950 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm border-b border-emerald-100 pb-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>Scale Weight Pre-Authorization Disclosure</span>
              </div>

              <p className="leading-relaxed text-emerald-900">
                Because fresh dressed poultry cuts and whole birds naturally vary in weight during packing, retail card / mobile payments require a temporary pre-authorization hold:
              </p>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-emerald-900">
                  <span>Estimated Base Total</span>
                  <span className="text-emerald-950 font-bold">Ksh {grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-950 font-bold text-sm pt-2 border-t border-emerald-200">
                  <span>Pre-Authorization Hold Limit (+10% Weight Cushion)</span>
                  <span className="text-amber-700 font-serif text-base font-bold">Ksh {maxPreAuthTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-950 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
                🔒 <strong>Compliance Guarantee:</strong> Your final card charge will be automatically adjusted downwards to match actual scale-weighed packed poultry at dispatch. You will never be billed for more than the exact scale weight delivered.
              </div>

              <label className="flex items-start gap-2.5 text-xs text-emerald-950 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={preAuthAgreed}
                  onChange={(e) => setPreAuthAgreed(e.target.checked)}
                  className="mt-0.5 accent-emerald-800 rounded"
                />
                <span className="leading-snug">
                  I authorize a pre-authorization hold of up to <strong>Ksh {maxPreAuthTotal.toLocaleString()}</strong> for actual scale-weighed packed poultry.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('payment')}
                className="w-1/3 bg-white hover:bg-emerald-50 border-2 border-emerald-300 font-bold py-3.5 rounded-xl text-xs text-emerald-950 cursor-pointer transition-colors"
              >
                Back to Payment
              </button>
              <button
                disabled={!preAuthAgreed}
                onClick={() => handleCompleteOrder(retailPayMethod)}
                className={`w-2/3 py-3.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  !preAuthAgreed
                    ? 'bg-emerald-100 text-emerald-500 border border-emerald-200 cursor-not-allowed shadow-none'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Authorize Hold & Complete Order</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
