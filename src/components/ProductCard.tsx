import React, { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router';
import { Product, BuyerType } from '../types';
import { getUnitPrice } from '../utils/orderRules';
import { getProductPath } from '../utils/productSeo';
import ResponsiveProductImage from './ResponsiveProductImage';

interface ProductCardProps {
  product: Product;
  buyerType: BuyerType;
}

function formatRating(rating: number) {
  if (rating === 5) return '5.0';
  return rating.toFixed(2).replace(/0$/, '');
}

export default function ProductCard({
  product,
  buyerType
}: ProductCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const displayPrice = getUnitPrice(product, buyerType);
  const hasAgeOptions = Boolean(product.variantsConfig?.ageOptions?.length);
  const productPath = getProductPath(product);

  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link
          to={productPath}
          prefetch="intent"
          aria-label={`View ${product.name}`}
          className="block aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 text-left dark:bg-white/10 sm:aspect-[1.16/1]"
        >
          <ResponsiveProductImage
            src={product.image}
            alt={product.imageAlt || product.name}
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
            style={{ objectPosition: product.imagePosition || '50% 50%' }}
          />
        </Link>

        <button
          type="button"
          onClick={() => setIsSaved((saved) => !saved)}
          aria-label={`${isSaved ? 'Remove' : 'Save'} ${product.name}`}
          aria-pressed={isSaved}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute right-2.5 top-2.5 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-md transition-colors cursor-pointer dark:bg-emerald-950/90 ${
            isSaved ? 'text-rose-600' : 'text-emerald-950 hover:text-rose-600 dark:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="px-0.5 pt-2.5">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:gap-2">
          <Link
            to={productPath}
            prefetch="intent"
            className="min-w-0 text-left text-xs sm:text-sm font-bold leading-tight text-emerald-950 dark:text-white line-clamp-2 hover:underline underline-offset-2"
          >
            {product.name}
          </Link>

          <div
            className="flex shrink-0 items-center gap-1"
            aria-label={`${formatRating(product.rating)} out of 5 stars`}
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-[10px] font-bold text-slate-700 dark:text-emerald-100/70">
              {formatRating(product.rating)}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1 text-emerald-950 dark:text-emerald-50">
          <span className="text-xs font-extrabold sm:text-sm">
            {hasAgeOptions ? 'From ' : ''}Ksh {displayPrice.toLocaleString()}
          </span>
          {product.unit ? (
            <span className="text-[10px] text-slate-600 dark:text-emerald-100/65">/{product.unit}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
