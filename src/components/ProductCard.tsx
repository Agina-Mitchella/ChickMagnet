import React, { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { Product, BuyerType } from '../types';
import { getUnitPrice } from '../utils/orderRules';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  buyerType: BuyerType;
}

const STAR_COUNT = 5;
const STARS = Array.from({ length: STAR_COUNT });

function formatRating(rating: number) {
  if (rating === 5) return '5.0';
  return rating.toFixed(2).replace(/0$/, '');
}

export default function ProductCard({
  product,
  onSelectProduct,
  buyerType
}: ProductCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const displayPrice = getUnitPrice(product, buyerType);
  const ratingPercentage = Math.min(STAR_COUNT, Math.max(0, product.rating)) / STAR_COUNT * 100;

  return (
    <article className="group min-w-0">
      <div className="relative">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          aria-label={`View ${product.name}`}
          className="block aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 text-left cursor-pointer sm:aspect-[1.16/1]"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          />
        </button>

        <button
          type="button"
          onClick={() => setIsSaved((saved) => !saved)}
          aria-label={`${isSaved ? 'Remove' : 'Save'} ${product.name}`}
          aria-pressed={isSaved}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-md transition-colors cursor-pointer ${
            isSaved ? 'text-rose-600' : 'text-emerald-950 hover:text-rose-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="px-0.5 pt-2.5">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:gap-2">
          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="min-w-0 text-left text-xs sm:text-sm font-bold leading-tight text-emerald-950 line-clamp-2 cursor-pointer hover:underline underline-offset-2"
          >
            {product.name}
          </button>

          <div
            className="flex shrink-0 items-center gap-1"
            aria-label={`${formatRating(product.rating)} out of 5 stars`}
          >
            <span className="relative inline-flex" aria-hidden="true">
              <span className="flex gap-0.5">
                {STARS.map((_, index) => (
                  <Star key={`empty-${index}`} className="h-3 w-3 fill-slate-200 text-slate-200" />
                ))}
              </span>
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${ratingPercentage}%` }}
              >
                <span className="flex w-max gap-0.5">
                  {STARS.map((_, index) => (
                    <Star key={`filled-${index}`} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </span>
              </span>
            </span>
            <span className="text-[10px] font-bold text-slate-700">
              {formatRating(product.rating)}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1 text-emerald-950">
          <span className="text-xs font-extrabold sm:text-sm">
            Ksh {displayPrice.toLocaleString()}
          </span>
          {product.liveData?.pricePerBird ? (
            <span className="text-[10px] text-slate-600">/ bird</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
