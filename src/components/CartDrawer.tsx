import React from 'react';
import { X, ShoppingBag, AlertTriangle, ArrowRight, Trash2, Scale } from 'lucide-react';
import { BuyerType, CartItem, FulfillmentType } from '../types';
import { findMinimumOrderViolations, getMinimumOrderQuantity, getUnitPrice } from '../utils/orderRules';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  buyerType: BuyerType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  buyerType,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}: CartDrawerProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!isOpen) return undefined;

    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusableSelector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const focusPanel = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(element => !element.hasAttribute('hidden'));
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusPanel);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [isOpen]);

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
      const price = getUnitPrice(item.product, buyerType);
      return acc + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();

  const hasMinOrderViolation = findMinimumOrderViolations(cartItems, buyerType).length > 0;

  const groupMeta: Record<FulfillmentType, { title: string; icon: string; bg: string; border: string; desc: string }> = {
    'live-climate': {
      title: 'Live chicken',
      icon: '🐥',
      bg: 'bg-[#123524] text-amber-300',
      border: 'border-emerald-800',
      desc: 'Live chicken delivery'
    },
    'chilled-express': {
      title: 'Fresh chicken',
      icon: '❄️',
      bg: 'bg-[#123524] text-emerald-200',
      border: 'border-emerald-800',
      desc: 'Chilled delivery'
    },
    'frozen-deep': {
      title: 'Frozen chicken',
      icon: '🧊',
      bg: 'bg-[#123524] text-emerald-200',
      border: 'border-emerald-800',
      desc: 'Frozen delivery'
    },
    'dry-ambient': {
      title: 'Eggs & Standard Delivery',
      icon: '🥚',
      bg: 'bg-[#123524] text-emerald-200',
      border: 'border-emerald-800',
      desc: 'Packed for standard delivery'
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0b2217]/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div ref={panelRef} className="bg-white w-full max-w-lg h-full flex flex-col justify-between shadow-2xl relative text-emerald-950 dark:bg-[#0b2117] dark:text-emerald-50">
        
        {/* Header */}
        <div className="p-4 bg-[#123524] text-amber-50 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 id="cart-drawer-title" className="font-serif font-black text-lg">Your cart</h2>
            <span className="bg-amber-400 text-emerald-950 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
              {cartItems.length} items
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split by Fulfillment Group */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-[#0b2117]">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">🐔</div>
              <h3 className="font-serif font-bold text-lg text-emerald-950 dark:text-white">Your cart is empty</h3>
              <p className="text-xs text-emerald-800 max-w-xs mx-auto dark:text-emerald-100/70">
                Browse chicken and eggs for retail or wholesale orders.
              </p>
            </div>
          ) : (
            (Object.keys(fulfillmentGroups) as FulfillmentType[]).map(groupKey => {
              const items = fulfillmentGroups[groupKey];
              if (items.length === 0) return null;

              const meta = groupMeta[groupKey];

              return (
                <div key={groupKey} className="rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-xs dark:border-white/12">
                  {/* Fulfillment Group Header */}
                  <div className={`p-3 border-b flex items-center justify-between ${meta.bg} ${meta.border}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta.icon}</span>
                      <div>
                        <div className="font-bold text-xs">{meta.title}</div>
                        <div className="text-[10px] opacity-80">{meta.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded text-emerald-200">
                      {items.length} item(s)
                    </span>
                  </div>

                  {/* Items in Group */}
                  <div className="p-3 divide-y divide-emerald-100 bg-white dark:divide-white/10 dark:bg-white/[0.04]">
                    {items.map(item => {
                      const isWholesale = buyerType === 'wholesale';
                      const unitPrice = getUnitPrice(item.product, buyerType);
                      const isWeightVariable = item.product.category === 'fresh-poultry' || item.product.unit?.includes('kg');
                      const minRequired = getMinimumOrderQuantity(item.product, buyerType);
                      const isBelowMin = item.quantity < minRequired;

                      return (
                        <div key={item.product.id} className="py-3 first:pt-0 last:pb-0 flex flex-col gap-2">
                          <div className="flex gap-3">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-xl border-2 border-emerald-200 shrink-0"
                            />

                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between">
                                  <h4 className="font-bold text-xs text-emerald-950 line-clamp-1 dark:text-white">
                                    {item.product.name}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.product.id)}
                                    aria-label={`Remove ${item.product.name} from cart`}
                                    className="text-emerald-600 hover:text-rose-600 text-xs ml-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-emerald-800 font-mono mt-0.5 dark:text-emerald-100/65">
                                  <span>Ksh {unitPrice.toLocaleString()} / {item.product.unit || 'unit'}</span>
                                  {isWholesale && <span className="text-amber-900 font-bold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">Wholesale</span>}
                                  {isWeightVariable && (
                                    <span className="text-emerald-900 font-bold bg-emerald-100 px-1 rounded border border-emerald-300 flex items-center gap-0.5">
                                      <Scale className="w-2.5 h-2.5" /> Estimated Price
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Control & Line Total */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-0.5 border border-emerald-200 dark:border-white/12 dark:bg-black/25">
                                  <button
                                    onClick={() => onUpdateQuantity(item.product.id, Math.max(minRequired, item.quantity - 1))}
                                    disabled={item.quantity <= minRequired}
                                    className="w-6 h-6 rounded bg-white font-bold text-xs text-emerald-950 border border-emerald-200 flex items-center justify-center cursor-pointer shadow-xs dark:border-white/12 dark:bg-white/10 dark:text-white"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-xs font-bold px-1 text-emerald-950 dark:text-white">{item.quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-6 h-6 rounded bg-white font-bold text-xs text-emerald-950 border border-emerald-200 flex items-center justify-center cursor-pointer shadow-xs dark:border-white/12 dark:bg-white/10 dark:text-white"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="text-right">
                                  <span className="font-serif font-black text-xs text-emerald-950 dark:text-white">
                                    Ksh {(unitPrice * item.quantity).toLocaleString()}
                                  </span>
                                  {isWeightVariable && (
                                    <div className="text-[9px] text-emerald-700 font-mono dark:text-emerald-100/60">
                                      Final total may vary by packed weight
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Live Bird Minimum Order Enforcement Warning */}
                          {isBelowMin && (
                            <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl text-[11px] text-amber-950 flex items-center justify-between gap-2 font-medium">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Minimum order: <strong>{minRequired}</strong>.</span>
                              </div>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, minRequired)}
                                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-2 py-0.5 rounded text-[10px] shrink-0 cursor-pointer shadow-xs"
                              >
                                Set to {minRequired}
                              </button>
                            </div>
                          )}

                          {/* Weight Variable Packed Note */}
                          {isWeightVariable && !isBelowMin && (
                            <div className="text-[10px] text-emerald-900 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 dark:border-white/12 dark:bg-white/[0.06] dark:text-emerald-100/75">
                              Final price is confirmed from the packed weight.
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
          <div className="p-4 bg-emerald-50/80 border-t-2 border-emerald-200 space-y-3 dark:border-white/12 dark:bg-[#102c1f]">
            {/* Warning banner if live bird min order violation exists */}
            {hasMinOrderViolation && (
              <div className="bg-rose-50 border border-rose-300 p-2.5 rounded-xl text-xs text-rose-950 flex items-start gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Minimum order not met.</strong> Update the highlighted quantities before checkout.
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-emerald-900 dark:text-emerald-100/70">
                <span>Subtotal (Estimated)</span>
                <span className="font-bold text-emerald-950 dark:text-white">Ksh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-900 dark:text-emerald-100/70">
                <span>Delivery groups</span>
                <span className="text-emerald-900 font-bold dark:text-emerald-100/80">
                  {Object.values(fulfillmentGroups).filter(g => g.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-950 pt-1.5 border-t border-emerald-200 font-serif dark:border-white/12 dark:text-white">
                <span>Products total</span>
                <span className="text-base text-amber-700 font-black">Ksh {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-100/70">
              Delivery is quoted separately after ChickMagnet reviews your destination, order size and handling needs.
            </p>

            <button
              disabled={hasMinOrderViolation}
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ${
                hasMinOrderViolation
                  ? 'bg-emerald-200 text-emerald-600 cursor-not-allowed shadow-none'
                  : 'bg-amber-400 hover:bg-amber-300 text-emerald-950 hover:scale-[1.01]'
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
