import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Scale, 
  Check, 
  Search, 
  MapPin, 
  Copy, 
  MessageSquare
} from 'lucide-react';
import { CartItem, BuyerType, FulfillmentType, User } from '../types';
import { findMinimumOrderViolations, getUnitPrice } from '../utils/orderRules';
import mpesaLogo from '../assets/images/mpesa-logo.svg';

interface CheckoutRitualProps {
  cartItems: CartItem[];
  buyerType: BuyerType;
  currentUser?: User | null;
  onOrderCompleted: (orderSummary: any) => Promise<void>;
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

const MPESA_PAYMENT_NUMBER = '0724300781';

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
  const [phone, setPhone] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('');
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [deliveryDetailsError, setDeliveryDetailsError] = useState<string | null>(null);

  const [orderId] = useState(() => {
    const timePart = Date.now().toString(36).slice(-5).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `CHX-${timePart}-${randomPart}`;
  });
  const [paymentNumberCopied, setPaymentNumberCopied] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fulfillment group delivery slot choices
  const groupKeys = Array.from(new Set(cartItems.map(i => i.fulfillmentGroup))) as FulfillmentType[];

  const [deliverySlots] = useState<Record<FulfillmentType, string>>({
    'live-climate': 'Live chicken delivery — timing confirmed after order review',
    'chilled-express': 'Chilled delivery — timing confirmed after order review',
    'frozen-deep': 'Frozen delivery — timing confirmed after order review',
    'dry-ambient': 'Egg delivery — timing confirmed after order review'
  });

  const subtotal = cartItems.reduce((acc, item) => {
    const price = getUnitPrice(item.product, buyerType);
    return acc + (price * item.quantity);
  }, 0);

  // Delivery depends on destination, order size and handling requirements.
  // It is quoted after the product order is reviewed, so checkout collects products only.
  const logisticsTotal = 0;
  const grandTotal = subtotal;
  const hasWeightVariableItems = cartItems.some(i => 
    i.product.category === 'fresh-poultry' || i.product.unit?.includes('kg')
  );
  const minimumOrderViolations = findMinimumOrderViolations(cartItems, buyerType);
  const hasMinimumOrderViolation = minimumOrderViolations.length > 0;

  const filteredLocations = KENYA_DELIVERY_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(deliveryZone.toLowerCase())
  );

  const handleContinueToPayment = () => {
    const phoneDigits = phone.replace(/\D/g, '');
    if (!name.trim() || phoneDigits.length < 9 || !deliveryZone.trim() || !address.trim()) {
      setDeliveryDetailsError('Enter the recipient name, a valid phone number, delivery area, and full address before continuing.');
      return;
    }

    setDeliveryDetailsError(null);
    setIsZoneOpen(false);
    setCurrentStep('payment');
  };

  const handleProceedToFinalOrderConfirmation = async () => {
    if (!confirmationSent || hasMinimumOrderViolation) {
      return;
    }

    if (!currentUser) {
      setSubmitError('Sign in before submitting your order so it can be saved to your account.');
      return;
    }

    const orderDeliverySlots: Record<string, string> = {};
    groupKeys.forEach(group => {
      orderDeliverySlots[group] = deliverySlots[group] || 'Standard Dispatch Slot';
    });

    const orderSummary = {
      orderId,
      date: new Date().toISOString(),
      name,
      email,
      phone,
      deliveryZone,
      address,
      buyerType,
      items: cartItems,
      deliverySlots: orderDeliverySlots,
      subtotal,
      logisticsTotal,
      grandTotal,
      deliveryFeeStatus: 'quoted_after_order_review',
      paymentCovers: 'products_only',
      paymentMethod: 'M-Pesa Send Money',
      paymentNumber: MPESA_PAYMENT_NUMBER,
      paymentConfirmationStatus: 'pending_manual_review',
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onOrderCompleted(orderSummary);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your order could not be saved. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPaymentNumber = async () => {
    await navigator.clipboard.writeText(MPESA_PAYMENT_NUMBER);
    setPaymentNumberCopied(true);
    window.setTimeout(() => setPaymentNumberCopied(false), 2000);
  };

  const confirmationMessage = [
    `ChickMagnet order ${orderId}`,
    `Product payment: Ksh ${grandTotal.toLocaleString()}`,
    '',
    'Paste the full M-Pesa confirmation message below:'
  ].join('\n');
  const confirmationSmsHref = `sms:${MPESA_PAYMENT_NUMBER}?body=${encodeURIComponent(confirmationMessage)}`;

  return (
    <div id="checkout-ritual-container" className="fixed inset-0 z-50 bg-[#0b2217]/85 backdrop-blur-md text-emerald-950 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-y-auto">
      
      {/* Main Checkout Modal Container */}
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] overflow-y-auto border-2 border-emerald-800 p-6 sm:p-8 shadow-2xl space-y-6 text-emerald-950 my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-heading"
      >
        
        {/* Progress & Breadcrumbs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-100 pb-4 gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ChickMagnet Checkout
            </span>
            <h1 id="checkout-heading" className="font-serif text-2xl font-black text-emerald-950 mt-0.5">
              {currentStep === 'fulfillment' && '1. Delivery details'}
              {currentStep === 'payment' && '2. Pay with M-Pesa'}
            </h1>
            {currentUser?.isGuest ? (
              <p className="mt-1 text-xs text-emerald-800">
                Checking out as a guest. We will use the details below for this order.
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {hasMinimumOrderViolation && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-medium text-rose-950">
                Wholesale quantities must meet the minimum shown in your cart before payment.
              </div>
            )}

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
                Contact and delivery address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label htmlFor="checkout-recipient-name" className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Recipient Name</label>
                  <input
                    id="checkout-recipient-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setDeliveryDetailsError(null);
                    }}
                    autoComplete="name"
                    required
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3.5 py-2 text-emerald-950 font-medium focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-recipient-phone" className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Recipient Phone Number</label>
                  <input
                    id="checkout-recipient-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setDeliveryDetailsError(null);
                    }}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="e.g. 0724 300 781"
                    required
                    className="w-full bg-white border-2 border-emerald-200 rounded-xl px-3.5 py-2 text-emerald-950 font-medium focus:outline-none focus:border-emerald-700 font-mono"
                  />
                </div>

                {/* Searchable Delivery Zone for Kenya */}
                <div className="relative sm:col-span-2">
                  <label htmlFor="checkout-delivery-area" className="block text-[11px] text-emerald-900 font-mono font-bold mb-1 flex items-center justify-between">
                    <span>Delivery area</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Kenya</span>
                  </label>

                  <div className="relative">
                    <input
                      id="checkout-delivery-area"
                      type="text"
                      value={deliveryZone}
                      onChange={(e) => {
                        setDeliveryZone(e.target.value);
                        setIsZoneOpen(true);
                        setDeliveryDetailsError(null);
                      }}
                      onFocus={() => setIsZoneOpen(true)}
                      placeholder="Search county or town..."
                      required
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
                              setDeliveryDetailsError(null);
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
                  <label htmlFor="checkout-delivery-address" className="block text-[11px] text-emerald-900 font-mono font-bold mb-1">Delivery address</label>
                  <input
                    id="checkout-delivery-address"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setDeliveryDetailsError(null);
                    }}
                    autoComplete="street-address"
                    placeholder="Building, street, landmark, or farm gate directions"
                    required
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
                  This order has {groupKeys.length} delivery groups
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Chicken and eggs may need different handling. ChickMagnet will review the full order and provide one delivery quote based on the destination, quantity and delivery groups.
                </p>
              </div>
            )}

            {/* Delivery groups */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                Delivery groups
              </h3>

              {groupKeys.map(group => {
                const groupTitle = group === 'live-climate' 
                  ? 'Live chicken'
                  : group === 'chilled-express' 
                  ? 'Fresh chicken'
                  : group === 'frozen-deep'
                  ? 'Frozen chicken'
                  : 'Eggs';

                return (
                  <div key={group} className="bg-white p-4 rounded-2xl border-2 border-emerald-100 space-y-2 text-xs shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-emerald-950 font-mono">{groupTitle}</div>
                      <span className="text-[10px] bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                        Quote after review
                      </span>
                    </div>
                    <p className="text-slate-600">{deliverySlots[group]}</p>
                  </div>
                );
              })}
            </div>

            {/* Order Total Overview */}
            <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-emerald-900">
                <span>Products total</span>
                <span>Ksh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-900">
                <span>Delivery</span>
                <span>Quoted separately</span>
              </div>
              <div className="flex justify-between text-emerald-950 font-bold text-base border-t border-emerald-200 pt-2">
                <span className="font-serif">Amount due now</span>
                <span className="font-serif">Ksh {grandTotal.toLocaleString()}</span>
              </div>
              <p className="border-t border-emerald-200 pt-2 text-[11px] leading-relaxed text-emerald-800">
                This payment covers products only. ChickMagnet will confirm availability, the exact delivery date and the countrywide delivery fee after reviewing your order.
              </p>
            </div>

            {deliveryDetailsError && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
                {deliveryDetailsError}
              </div>
            )}

            <button
              disabled={hasMinimumOrderViolation}
              onClick={handleContinueToPayment}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        )}

        {/* Manual M-Pesa payment */}
        {currentStep === 'payment' && (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-32 shrink-0 items-center justify-center rounded-xl bg-white px-2 shadow-sm">
                  <img
                    src={mpesaLogo}
                    alt="M-PESA"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-black text-emerald-950">Pay with M-Pesa</h2>
                  <p className="text-xs text-emerald-800">Use M-Pesa Send Money.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Send to</p>
                  <div className="mt-1 flex items-center gap-2">
                    <a href={`tel:${MPESA_PAYMENT_NUMBER}`} className="font-mono text-2xl font-black text-emerald-950">
                      {MPESA_PAYMENT_NUMBER}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPaymentNumber}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {paymentNumberCopied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                      {paymentNumberCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Product payment</p>
                  <p className="mt-1 font-serif text-2xl font-black text-emerald-950">Ksh {grandTotal.toLocaleString()}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Delivery is quoted separately.</p>
                </div>
              </div>

              {hasWeightVariableItems ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <span>If packed weight changes the total, ChickMagnet will contact you before adjusting the order.</span>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-3"><strong className="text-emerald-950">1.</strong><span>Open M-Pesa and choose <strong>Send Money</strong>.</span></li>
                <li className="flex gap-3"><strong className="text-emerald-950">2.</strong><span>Send <strong>Ksh {grandTotal.toLocaleString()}</strong> to <strong>{MPESA_PAYMENT_NUMBER}</strong>.</span></li>
                <li className="flex gap-3"><strong className="text-emerald-950">3.</strong><span>Send the full M-Pesa confirmation message to the same number.</span></li>
                <li className="flex gap-3"><strong className="text-emerald-950">4.</strong><span>Allow 2 to 24 hours for manual confirmation. ChickMagnet will then confirm availability, the delivery date and the separate delivery fee.</span></li>
              </ol>
            </div>

            <a
              href={confirmationSmsHref}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-black text-white shadow-md hover:bg-emerald-800"
            >
              <MessageSquare className="h-4 w-4" />
              Send M-Pesa confirmation message
            </a>

            <p className="text-center text-xs leading-relaxed text-slate-500">
              Your phone will open a new SMS to {MPESA_PAYMENT_NUMBER}. Paste the full M-Pesa confirmation message, then send it.
            </p>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={confirmationSent}
                onChange={(event) => setConfirmationSent(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-emerald-700"
              />
              <span>I have sent the M-Pesa confirmation message to {MPESA_PAYMENT_NUMBER}.</span>
            </label>

            {submitError && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('fulfillment')}
                className="flex w-1/3 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-3.5 text-xs font-bold text-emerald-950 hover:bg-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                id="submit-manual-payment-order"
                disabled={!confirmationSent || hasMinimumOrderViolation || isSubmitting}
                onClick={handleProceedToFinalOrderConfirmation}
                className="flex w-2/3 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-sm font-black text-amber-200 shadow-md hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {isSubmitting ? 'Saving order…' : 'Submit order'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
