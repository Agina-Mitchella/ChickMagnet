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
      className="bg-white border border-emerald-200/90 rounded-xl overflow-hidden hover:shadow-lg hover:border-emerald-400 transition-all duration-200 flex flex-col group relative"
    >
      {/* Top Image & Badges */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative h-32 sm:h-36 w-full bg-emerald-50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-2xs ${categoryMeta.bg}`}>
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
            className="absolute top-2 right-2 bg-[#0b2217]/90 text-amber-300 hover:text-white border border-emerald-700 text-[9px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10 transition-colors cursor-pointer"
            title="Click to view full vaccination & farm traceability report"
          >
            <Activity className="w-2.5 h-2.5 text-emerald-400" />
            <span>{product.liveData?.batchId || product.freshData?.batchId || product.processedData?.batchId}</span>
          </button>
        )}

        {/* Live Fertile Egg Hatchability Window Overlay */}
        {product.eggData?.eggType === 'fertile' && product.eggData?.daysSinceLaid !== undefined && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-[#0b2217]/90 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-md text-[9px] flex items-center justify-between z-10 font-mono">
            <span className="flex items-center gap-0.5 font-bold">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              Laid {product.eggData.daysSinceLaid}d ago
            </span>
            <span className="text-emerald-300">
              Viability: {product.eggData.hatchViabilityPercent || 90}%
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Rating & Badge */}
          <div className="flex items-center justify-between text-[10px] text-emerald-800 font-medium mb-0.5">
            {product.badge ? (
              <span className="text-emerald-800 font-semibold truncate bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 text-[9px]">{product.badge}</span>
            ) : <span />}
            <span className="text-amber-700 font-mono font-bold shrink-0">
              ★ {product.rating.toFixed(1)} ({product.reviewsCount})
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-serif font-bold text-xs sm:text-sm text-emerald-950 group-hover:text-amber-700 transition-colors line-clamp-2 cursor-pointer leading-tight"
          >
            {product.name}
          </h3>

          {/* Specific Data Snippets per category */}
          <div className="mt-1 text-[10px] text-emerald-900">
            {/* Live Birds Specs */}
            {product.liveData && (
              <div className="bg-emerald-50 px-2 py-1 rounded text-[10px] border border-emerald-200/80 font-mono flex justify-between items-center">
                <span>Breed: <strong className="font-sans font-bold">{product.liveData.breed}</strong></span>
                <span className="uppercase text-amber-900 font-bold">{product.liveData.sex}</span>
              </div>
            )}

            {/* Fresh Dressed Whole Chicken Specs */}
            {product.freshData && (
              <div className="bg-amber-50/80 px-2 py-1 rounded text-[10px] flex justify-between items-center border border-amber-200/80 font-mono">
                <span>Est: <strong>{product.freshData.weightEstKg} kg</strong></span>
                <span className="text-emerald-800 text-[9px]">{product.freshData.cutType}</span>
              </div>
            )}

            {/* Eggs Specs */}
            {product.eggData && product.eggData.eggType !== 'fertile' && (
              <div className="bg-amber-50/80 px-2 py-1 rounded text-[10px] flex justify-between font-mono text-amber-950 border border-amber-200/80">
                <span>Grade: <strong>{product.eggData.gradeSize.toUpperCase()}</strong></span>
                <span>{product.eggData.countPerPack} Eggs/Pack</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] font-mono font-bold text-emerald-900">Ksh</span>
              <span className="font-serif text-base font-black text-emerald-950">
                {displayPrice.toLocaleString()}
              </span>
              {product.liveData?.pricePerBird && (
                <span className="text-[9px] text-emerald-800 font-mono">/bird</span>
              )}
            </div>

            {isWholesaleMode && product.wholesalePrice && (
              <div className="text-[9px] text-amber-700 font-mono font-bold">
                Bulk ({product.wholesaleMinQty}+)
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 text-amber-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-transform hover:scale-105 cursor-pointer shadow-2xs shrink-0"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
