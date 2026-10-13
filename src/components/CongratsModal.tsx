import React from 'react';
import { Calendar, HelpCircle, Scale } from 'lucide-react';

interface CongratsModalProps {
  orderSummary: any;
  onClose: () => void;
  onOpenClaims?: () => void;
}

export default function CongratsModal({
  orderSummary,
  onClose,
  onOpenClaims
}: CongratsModalProps) {
  if (!orderSummary) return null;

  const hasWeightVariable = orderSummary.items?.some((i: any) => 
    i.product?.category === 'fresh-poultry' || i.product?.unit?.includes('kg')
  );

  const hasLiveBirds = orderSummary.items?.some((i: any) => 
    i.fulfillmentGroup === 'live-climate' || i.product?.category === 'live-birds'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#123524] text-amber-50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-800 shadow-2xl relative p-5 sm:p-8 space-y-6">
        
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl animate-bounce">
            🐣
          </div>
          <h2 className="font-serif font-black text-2xl text-amber-300">
            Order received
          </h2>
          <p className="text-xs text-emerald-300 font-mono">
            Order ID: <strong>{orderSummary.orderId}</strong>
          </p>
          <p className="mx-auto max-w-md text-sm text-emerald-100">
            Your product payment will be checked manually within 2 to 24 hours. ChickMagnet will then confirm availability, the exact delivery date and the separate delivery fee.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#0b2217] p-5 rounded-2xl border border-emerald-800 space-y-3.5 text-xs font-mono">
          <div className="flex justify-between border-b border-emerald-800 pb-2 text-emerald-300">
            <span>Customer</span>
            <span className="font-bold text-amber-300">{orderSummary.name} ({orderSummary.email})</span>
          </div>

          <div className="flex justify-between border-b border-emerald-800 pb-2 text-emerald-300">
            <span>Payment method</span>
            <span className="font-bold text-amber-300 uppercase">
              {orderSummary.paymentMethod.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between border-b border-emerald-800 pb-2 text-emerald-300">
            <span>Payment status</span>
            <span className="font-bold text-amber-300">Pending confirmation</span>
          </div>

          {/* Weight Variable Pricing Note */}
          {hasWeightVariable && (
            <div className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-xl text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
              <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                Fresh chicken is priced by packed weight. The final amount may change by up to 10%.
              </div>
            </div>
          )}

          {/* Logistics Delivery Windows per Fulfillment Group */}
          <div className="space-y-1.5 py-1">
            <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Delivery window
            </div>
            {Object.entries(orderSummary.deliverySlots || {}).map(([grp, slot]: any) => (
              <div key={grp} className="bg-[#123524] p-2.5 rounded-xl border border-emerald-800 flex flex-col sm:flex-row justify-between sm:items-center text-[11px] gap-1.5">
                <span className="text-amber-300 font-bold uppercase shrink-0">
                  {grp === 'live-climate' ? '🐥 Live chicken delivery' : grp === 'chilled-express' ? '❄️ Chilled delivery' : grp === 'frozen-deep' ? '🧊 Frozen delivery' : '🥚 Standard delivery'}
                </span>
                <span className="text-amber-200 font-mono font-bold bg-[#0b2217] px-2.5 py-1 rounded-lg border border-emerald-700/60 shadow-xs">{slot}</span>
              </div>
            ))}
          </div>

          {/* Live bird delivery support */}
          {hasLiveBirds && (
            <div className="bg-emerald-950/80 border border-emerald-700/60 p-3 rounded-xl flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Report weak, injured or dead chicks to ChickMagnet immediately after delivery.</span>
              </div>
              {onOpenClaims && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenClaims();
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer shrink-0"
                >
                  Report a problem
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-emerald-800 text-sm font-serif">
            <span className="text-amber-300">Product payment</span>
            <span className="font-bold text-amber-400 text-base">Ksh {orderSummary.grandTotal.toLocaleString()}</span>
          </div>
          <p className="text-right text-[10px] leading-relaxed text-emerald-300">Delivery is not included and will be quoted separately.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-bold py-3.5 rounded-xl text-sm shadow-md transition-transform hover:scale-[1.01] cursor-pointer"
        >
          Return to products
        </button>

      </div>
    </div>
  );
}
