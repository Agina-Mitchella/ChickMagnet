import React, { useState } from 'react';
import { X, ShieldCheck, Clock, CheckCircle, Activity, AlertTriangle, FileText, Truck, ArrowRight, Share2, Heart, Award } from 'lucide-react';
import { Product, BuyerType, FarmSeller } from '../types';
import { INITIAL_FARMS, MOCK_BATCH_TRACE_RECORDS } from '../data/products';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedSex?: 'male'|'female'|'unsexed') => void;
  buyerType: BuyerType;
  onOpenTraceabilityWithBatch: (batchId: string) => void;
}

export default function ProductDetail({
  product,
  onClose,
  onAddToCart,
  buyerType,
  onOpenTraceabilityWithBatch
}: ProductDetailProps) {
  const isWholesale = buyerType === 'wholesale';
  const unitPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;

  const initialQty = product.liveData?.minOrderQty || 1;
  const [quantity, setQuantity] = useState<number>(initialQty);
  const [selectedSex, setSelectedSex] = useState<'male' | 'female' | 'unsexed'>(
    product.liveData?.sex || 'unsexed'
  );

  // Farm Info
  const farm = INITIAL_FARMS.find(f => f.id === product.sellerId) || INITIAL_FARMS[0];
  const batchId = product.liveData?.batchId || product.freshData?.batchId || product.processedData?.batchId;
  const traceRecord = batchId ? MOCK_BATCH_TRACE_RECORDS[batchId] : null;

  const totalPrice = unitPrice * quantity;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b2217]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border-2 border-emerald-800 shadow-2xl relative text-emerald-950 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-emerald-950 text-white p-2 rounded-full hover:bg-emerald-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image & Traceability Column */}
        <div className="md:w-1/2 p-6 bg-emerald-50/50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-emerald-200">
          <div>
            <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 shadow-md">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="bg-[#0b2217] text-amber-300 font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                  {product.category.toUpperCase()}
                </span>
                {product.badge && (
                  <span className="bg-amber-400 text-emerald-950 font-extrabold text-xs px-2.5 py-0.5 rounded-md shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Traceability Spotlight */}
            {batchId && (
              <div className="mt-4 bg-[#0b2217] text-amber-50 p-4 rounded-2xl border border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-300 font-bold flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Verified Batch ID: {batchId}
                  </span>
                  <button
                    onClick={() => onOpenTraceabilityWithBatch(batchId)}
                    className="text-[11px] bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    View Health Cert
                  </button>
                </div>
                {traceRecord && (
                  <div className="text-[11px] text-emerald-200 font-mono space-y-1 pt-1 border-t border-emerald-800">
                    <div>Origin: {traceRecord.farmName} ({traceRecord.location})</div>
                    <div>Hatch/Slaughter: {traceRecord.hatchOrSlaughterDate}</div>
                    <div className="text-amber-300 font-bold">{traceRecord.labTestStatus}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sourcing Farm Card */}
          <div className="mt-4 p-4 rounded-2xl bg-white border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm">
                  🏡
                </div>
                <div>
                  <div className="font-bold text-xs text-emerald-950">{farm.name}</div>
                  <div className="text-[10px] text-emerald-800">{farm.location}</div>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                {farm.biosecurityLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Product Specs & Checkout Config */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* Title & Sourcing info */}
            <div>
              <div className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider">
                {product.sellerBadge}
              </div>
              <h1 className="font-serif text-2xl font-black text-emerald-950 mt-1">
                {product.name}
              </h1>
              <p className="text-xs text-emerald-900 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specific Specs according to product category */}

            {/* LIVE BIRDS SPECIFICATION */}
            {product.liveData && (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3 text-xs font-mono">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Breed & Sex Specifications
                </div>
                <div className="grid grid-cols-2 gap-3 text-emerald-900 text-xs font-mono">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-emerald-800 block text-[10px] uppercase font-bold">Breed</span>
                    <strong className="text-emerald-950 text-sm font-sans font-bold">{product.liveData.breed}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-emerald-800 block text-[10px] uppercase font-bold">Sex</span>
                    <strong className="text-amber-900 text-sm uppercase font-sans font-bold">{product.liveData.sex}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* FRESH POULTRY SPECIFICATION WITH WEIGHT ADJUSTMENT */}
            {product.freshData && (
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Scale Weight & Freshness Locking
                </div>
                <p className="text-[11px] text-amber-950 leading-relaxed">
                  Whole dressed chicken weight is estimated at <strong>{product.freshData.weightEstKg} kg</strong>. Final invoice is automatically adjusted to actual scale weight upon cold-chain packing!
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-amber-950 pt-1 border-t border-amber-200">
                  <div>Slaughter: {product.freshData.slaughterDate}</div>
                  <div>Storage: <span className="uppercase font-bold">{product.freshData.storageTemp}</span></div>
                  <div>Halal: <span className="text-emerald-700 font-bold">✓ Certified</span></div>
                  <div>Best Before: {product.freshData.bestBeforeDate}</div>
                </div>
              </div>
            )}

            {/* FERTILE EGGS HATCHABILITY COUNTDOWN */}
            {product.eggData?.eggType === 'fertile' && (
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 space-y-2 text-xs">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Hatch Viability Window Countdown
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span>Lay Date: <strong>{product.eggData.layDate}</strong></span>
                  <span className="bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-black">
                    {product.eggData.daysSinceLaid} Days Elapsed
                  </span>
                </div>
                <p className="text-[11px] text-amber-950">
                  Fertile eggs maintain maximum hatchability when incubated within 7 days of laying. Viability rating for this batch: <strong>{product.eggData.hatchViabilityPercent}%</strong>.
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="pt-2 border-t border-emerald-200 space-y-2">
              <label className="block text-xs font-bold text-emerald-950 font-mono">
                Order Quantity {product.liveData?.minOrderQty ? `(Min ${product.liveData.minOrderQty})` : ''}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(product.liveData?.minOrderQty || 1, quantity - 1))}
                  className="w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-black text-base flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono font-black text-lg px-3 text-emerald-950">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-black text-base flex items-center justify-center cursor-pointer"
                >
                  +
                </button>

                {/* Wholesale discount indicator */}
                {isWholesale && product.wholesaleMinQty && quantity >= product.wholesaleMinQty && (
                  <span className="text-xs bg-emerald-100 text-emerald-950 font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-300">
                    ✓ Wholesale Tier Active
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Pricing & Add to Cart Footer */}
          <div className="pt-4 border-t border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-800 font-mono font-bold">Total Amount</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-mono font-bold text-emerald-900">Ksh</span>
                <span className="font-serif text-2xl font-black text-emerald-950">
                  {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onAddToCart(product, quantity, selectedSex);
                onClose();
              }}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-transform hover:scale-105 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
