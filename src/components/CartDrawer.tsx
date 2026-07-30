import React from 'react';
import { X, ShoppingBag, ShieldCheck, Truck, AlertTriangle, ArrowRight, Trash2, Scale } from 'lucide-react';
import { CartItem, FulfillmentType } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Split Cart Items by Fulfillment Group
  const fulfillmentGroups: Record<FulfillmentType, CartItem[]> = {
    'live-climate': [],
    'chilled-express': [],
    'frozen-deep': [],
    'dry-ambient': []
  };

  cartItems.forEach(item => {
    fulfillmentGroups[item.fulfillmentGroup].push(item);
  });

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const isWholesale = item.product.wholesalePrice && item.quantity >= (item.product.wholesaleMinQty || 1);
      const price = isWholesale ? item.product.wholesalePrice! : item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Check if any live bird item is under minimum order requirement (min 10 chicks for thermal transport)
  const invalidLiveBirdItems = cartItems.filter(item => 
    item.fulfillmentGroup === 'live-climate' && item.quantity < (item.product.minOrderQty || 10)
  );
  const hasMinOrderViolation = invalidLiveBirdItems.length > 0;

  const groupMeta: Record<FulfillmentType, { title: string; icon: string; bg: string; border: string; desc: string }> = {
    'live-climate': {
      title: 'Live Bird Climate Transit',
      icon: '🐥',
      bg: 'bg-emerald-950 text-amber-300',
      border: 'border-emerald-800',
      desc: 'Ventilated & temperature-stabilized vehicle (Runs Tue/Thu/Sat)'
    },
    'chilled-express': {
      title: 'Chilled Cold-Chain (0°C - 4°C)',
      icon: '❄️',
      bg: 'bg-blue-950 text-blue-200',
      border: 'border-blue-800',
      desc: 'Air-chilled fresh poultry insulated boxes (Runs Mon-Sat)'
    },
    'frozen-deep': {
      title: 'Frozen Express (-18°C Deep Freeze)',
      icon: '🧊',
      bg: 'bg-cyan-950 text-cyan-200',
      border: 'border-cyan-800',
      desc: 'Sub-zero frozen value-added products (Runs Mon/Wed/Fri)'
    },
    'dry-ambient': {
      title: 'Dry Farm Goods (Ambient Parcel)',
      icon: '📦',
      bg: 'bg-slate-900 text-slate-200',
      border: 'border-slate-700',
      desc: 'Feed, incubators, biosecurity & supplies (Ships Daily)'
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-lg h-full flex flex-col justify-between shadow-2xl relative text-emerald-950">
        
        {/* Header */}
        <div className="p-4 bg-[#123524] text-amber-50 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif font-black text-lg">Your Poultry Cart</h2>
            <span className="bg-amber-500 text-emerald-950 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
              {cartItems.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split by Fulfillment Group */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">🐔</div>
              <h3 className="font-serif font-bold text-lg text-emerald-950">Your cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore day-old chicks, dressed chicken cuts, hatching eggs, and farm supplies.
              </p>
            </div>
          ) : (
            (Object.keys(fulfillmentGroups) as FulfillmentType[]).map(groupKey => {
              const items = fulfillmentGroups[groupKey];
              if (items.length === 0) return null;

              const meta = groupMeta[groupKey];

              return (
                <div key={groupKey} className="rounded-2xl border overflow-hidden shadow-xs border-slate-200">
                  {/* Fulfillment Group Header */}
                  <div className={`p-3 border-b flex items-center justify-between ${meta.bg} ${meta.border}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta.icon}</span>
                      <div>
                        <div className="font-bold text-xs">{meta.title}</div>
                        <div className="text-[10px] opacity-80">{meta.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-black/30 px-2 py-0.5 rounded">
                      {items.length} item(s)
                    </span>
                  </div>

                  {/* Items in Group */}
                  <div className="p-3 divide-y divide-slate-100 bg-white">
                    {items.map(item => {
                      const isWholesale = item.product.wholesalePrice && item.quantity >= (item.product.wholesaleMinQty || 1);
                      const unitPrice = isWholesale ? item.product.wholesalePrice! : item.product.price;
                      const isWeightVariable = item.product.category === 'fresh-poultry' || item.product.unit?.includes('kg');
                      const minRequired = item.product.minOrderQty || (item.fulfillmentGroup === 'live-climate' ? 10 : 1);
                      const isBelowMin = item.quantity < minRequired;

                      return (
                        <div key={item.product.id} className="py-3 first:pt-0 last:pb-0 flex flex-col gap-2">
                          <div className="flex gap-3">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                            />

                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between">
                                  <h4 className="font-bold text-xs text-emerald-950 line-clamp-1">
                                    {item.product.name}
                                  </h4>
                                  <button
                                    onClick={() => onRemoveItem(item.product.id)}
                                    className="text-slate-400 hover:text-rose-500 text-xs ml-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 font-mono mt-0.5">
                                  <span>Ksh {unitPrice.toLocaleString()} / {item.product.unit || 'unit'}</span>
                                  {isWholesale && <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Wholesale</span>}
                                  {isWeightVariable && (
                                    <span className="text-blue-700 font-bold bg-blue-50 px-1 rounded border border-blue-200 flex items-center gap-0.5">
                                      <Scale className="w-2.5 h-2.5" /> Estimated Price
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Control & Line Total */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-0.5">
                                  <button
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                    className="w-6 h-6 rounded bg-white font-bold text-xs text-emerald-950 shadow-xs flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-xs font-bold px-1">{item.quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-6 h-6 rounded bg-white font-bold text-xs text-emerald-950 shadow-xs flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="text-right">
                                  <span className="font-serif font-black text-xs text-emerald-950">
                                    Ksh {(unitPrice * item.quantity).toLocaleString()}
                                  </span>
                                  {isWeightVariable && (
                                    <div className="text-[9px] text-slate-400 font-mono">
                                      (Final weight ±10%)
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Live Bird Minimum Order Enforcement Warning */}
                          {isBelowMin && (
                            <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl text-[11px] text-amber-900 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Min order: <strong>{minRequired} chicks</strong> required for heat preservation.</span>
                              </div>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, minRequired)}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] shrink-0 cursor-pointer"
                              >
                                Set to {minRequired}
                              </button>
                            </div>
                          )}

                          {/* Weight Variable Packed Note */}
                          {isWeightVariable && !isBelowMin && (
                            <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                              ℹ️ <strong>Weight Note:</strong> Final price adjusted to actual scale-packed weight (±10% tolerance cushion).
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            {/* Warning banner if live bird min order violation exists */}
            {hasMinOrderViolation && (
              <div className="bg-rose-50 border border-rose-300 p-2.5 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Min Order Violation:</strong> Please increase live bird quantities to at least 10 chicks per breed to ensure safe climate transport.
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-mono">
                <span>Subtotal (Estimated)</span>
                <span className="font-bold text-emerald-950">Ksh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-mono">
                <span>Fulfillment Packages</span>
                <span className="text-emerald-800 font-bold">
                  {Object.values(fulfillmentGroups).filter(g => g.length > 0).length} Separate Vehicle Slot(s)
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-950 pt-1.5 border-t border-slate-200 font-serif">
                <span>Estimated Total</span>
                <span className="text-base text-amber-600">Ksh {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              disabled={hasMinOrderViolation}
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ${
                hasMinOrderViolation
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 hover:scale-[1.01]'
              }`}
            >
              <span>Proceed to Delivery & Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
