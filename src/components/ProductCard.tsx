import React from 'react';
import { ShoppingBag, ShieldCheck, Clock, Award, Activity, Truck, FileCheck } from 'lucide-react';
import { Product, BuyerType } from '../types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  buyerType: BuyerType;
  onOpenTraceabilityWithBatch?: (batchId: string) => void;
}

export default function ProductCard({
  product,
  onSelectProduct,
  onAddToCart,
  buyerType,
  onOpenTraceabilityWithBatch
}: ProductCardProps) {
  const isWholesaleMode = buyerType === 'wholesale';
  const displayPrice = isWholesaleMode && product.wholesalePrice ? product.wholesalePrice : product.price;

  // Category Badge Colors & Emoji
  const getCategoryMeta = () => {
    switch (product.category) {
      case 'live-birds':
        return { label: 'Live Birds', emoji: '🐥', bg: 'bg-[#0b2217]/90 text-emerald-300 border-emerald-800' };
      case 'fresh-poultry':
        return { label: 'Fresh & Dressed', emoji: '🍗', bg: 'bg-[#0b2217]/90 text-amber-300 border-amber-800' };
      case 'processed':
        return { label: 'Processed', emoji: '🌶️', bg: 'bg-[#0b2217]/90 text-rose-300 border-rose-800' };
      case 'eggs':
        return { label: 'Eggs', emoji: '🥚', bg: 'bg-[#0b2217]/90 text-amber-300 border-amber-800' };
      case 'farm-supplies':
        return { label: 'Farm Supplies', emoji: '🚜', bg: 'bg-[#0b2217]/90 text-emerald-200 border-emerald-800' };
      default:
        return { label: 'Poultry', emoji: '🐔', bg: 'bg-[#0b2217]/90 text-amber-300 border-emerald-800' };
    }
  };

  const categoryMeta = getCategoryMeta();

  return (
    <div 
      className="bg-white border-2 border-emerald-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col group relative"
    >
      {/* Top Image & Badges */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative h-48 sm:h-52 w-full bg-emerald-50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-xs ${categoryMeta.bg}`}>
            <span>{categoryMeta.emoji}</span>
            <span>{categoryMeta.label}</span>
          </span>
        </div>

        {/* Batch ID Quick Trace Button */}
        {(product.liveData?.batchId || product.freshData?.batchId || product.processedData?.batchId) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const batchId = product.liveData?.batchId || product.freshData?.batchId || product.processedData?.batchId;
              if (batchId && onOpenTraceabilityWithBatch) {
                onOpenTraceabilityWithBatch(batchId);
              }
            }}
            className="absolute top-2.5 right-2.5 bg-[#0b2217]/90 text-amber-300 hover:text-white border border-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 z-10 transition-colors cursor-pointer"
            title="Click to view full vaccination & farm traceability report"
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>{product.liveData?.batchId || product.freshData?.batchId || product.processedData?.batchId}</span>
          </button>
        )}

        {/* Live Fertile Egg Hatchability Window Overlay */}
        {product.eggData?.eggType === 'fertile' && product.eggData?.daysSinceLaid !== undefined && (
          <div className="absolute bottom-2 left-2 right-2 bg-[#0b2217]/90 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-lg text-[10px] flex items-center justify-between z-10 font-mono">
            <span className="flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3 text-amber-400" />
              Laid {product.eggData.daysSinceLaid}d ago
            </span>
            <span className="text-emerald-300">
              Viability: {product.eggData.hatchViabilityPercent || 90}%
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Rating */}
          <div className="flex items-center justify-end text-[11px] text-emerald-800 font-medium mb-1">
            <span className="text-amber-700 font-mono font-bold">
              ★ {product.rating.toFixed(1)} ({product.reviewsCount})
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-serif font-bold text-base text-emerald-950 group-hover:text-amber-700 transition-colors line-clamp-2 cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Specific Data Snippets per category */}
          <div className="mt-2 text-xs text-emerald-900 space-y-1">
            {/* Live Birds Specs */}
            {product.liveData && (
              <div className="bg-emerald-50 p-2.5 rounded-lg text-[11px] border border-emerald-200 font-mono">
                <div className="flex justify-between items-center text-emerald-950">
                  <span>Breed: <strong className="font-sans font-bold">{product.liveData.breed}</strong></span>
                  <span>Sex: <strong className="uppercase text-amber-900 font-bold">{product.liveData.sex}</strong></span>
                </div>
              </div>
            )}

            {/* Fresh Dressed Whole Chicken Specs */}
            {product.freshData && (
              <div className="bg-amber-50/80 p-2 rounded-lg text-[11px] space-y-0.5 border border-amber-200 font-mono">
                <div className="flex justify-between text-amber-950">
                  <span>Weight Est: <strong>{product.freshData.weightEstKg} kg</strong></span>
                </div>
                <div className="text-[10px] text-emerald-800">
                  Slaughtered: {product.freshData.slaughterDate}
                </div>
              </div>
            )}

            {/* Eggs Specs */}
            {product.eggData && product.eggData.eggType !== 'fertile' && (
              <div className="bg-amber-50/80 p-2 rounded-lg text-[11px] flex justify-between font-mono text-amber-950 border border-amber-200">
                <span>Grade: <strong>{product.eggData.gradeSize.toUpperCase()}</strong></span>
                <span>{product.eggData.countPerPack} Eggs/Pack</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-mono font-bold text-emerald-900">Ksh</span>
              <span className="font-serif text-xl font-black text-emerald-950">
                {displayPrice.toLocaleString()}
              </span>
              {product.liveData?.pricePerBird && (
                <span className="text-[10px] text-emerald-800 font-mono">/bird</span>
              )}
              {product.freshData?.pricePerKg && (
                <span className="text-[10px] text-emerald-800 font-mono">/est pack</span>
              )}
            </div>

            {isWholesaleMode && product.wholesalePrice && (
              <div className="text-[10px] text-amber-700 font-mono font-bold">
                Wholesale Tier ({product.wholesaleMinQty}+ units)
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-transform hover:scale-105 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
