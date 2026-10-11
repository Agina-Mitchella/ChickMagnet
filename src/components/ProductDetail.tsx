import { useState } from 'react';
import { Check, Heart, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { BuyerType, Product } from '../types';
import { getMinimumOrderQuantity, getUnitPrice } from '../utils/orderRules';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  buyerType: BuyerType;
}

interface OptionGroupProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const STAR_COUNT = 5;
const STARS = Array.from({ length: STAR_COUNT });

function formatRating(rating: number) {
  if (rating === 5) return '5.0';
  return rating.toFixed(2).replace(/0$/, '');
}

function StarRating({ rating }: { rating: number }) {
  const ratingPercentage = Math.min(STAR_COUNT, Math.max(0, rating)) / STAR_COUNT * 100;

  return (
    <div className="flex items-center gap-2" aria-label={`${formatRating(rating)} out of 5 stars`}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-0.5">
          {STARS.map((_, index) => (
            <Star key={`empty-${index}`} className="h-4 w-4 fill-slate-200 text-slate-200" />
          ))}
        </span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${ratingPercentage}%` }}
        >
          <span className="flex w-max gap-0.5">
            {STARS.map((_, index) => (
              <Star key={`filled-${index}`} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </span>
        </span>
      </span>
      <span className="text-sm font-bold text-slate-700">{formatRating(rating)}</span>
    </div>
  );
}

function OptionGroup({ label, options, selected, onSelect }: OptionGroupProps) {
  if (options.length === 0) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-bold text-slate-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option === selected;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={isSelected}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                isSelected
                  ? 'border-emerald-900 bg-emerald-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ProductDetail({
  product,
  onClose,
  onAddToCart,
  buyerType
}: ProductDetailProps) {
  const images = product.images?.length ? product.images : [product.image];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [wasAdded, setWasAdded] = useState(false);

  const boneOptions = product.variantsConfig?.boneOptions || [];
  const skinOptions = product.variantsConfig?.skinOptions || [];
  const weightOptions = product.variantsConfig?.weightBands || [];
  const eggGradeOptions = product.variantsConfig?.eggGrades || [];
  const packOptions = product.variantsConfig?.packCounts || [];
  const supplyOptions = product.variantsConfig?.supplySizes || [];
  const ageOptions = product.variantsConfig?.ageOptions || [];

  const [selectedBone, setSelectedBone] = useState(boneOptions[0] || '');
  const [selectedSkin, setSelectedSkin] = useState(skinOptions[0] || '');
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
  const [selectedEggGrade, setSelectedEggGrade] = useState(eggGradeOptions[0] || '');
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [selectedSupplyIndex, setSelectedSupplyIndex] = useState(0);
  const [selectedAgeIndex, setSelectedAgeIndex] = useState(0);

  const minimumQuantity = getMinimumOrderQuantity(product, buyerType);
  const [quantity, setQuantity] = useState(minimumQuantity);

  const selectedWeight = weightOptions[selectedWeightIndex];
  const selectedPack = packOptions[selectedPackIndex];
  const selectedSupply = supplyOptions[selectedSupplyIndex];
  const selectedAge = ageOptions[selectedAgeIndex];
  const basePrice = getUnitPrice(product, buyerType);
  const unitPrice = selectedAge?.price
    ?? selectedPack?.price
    ?? selectedSupply?.price
    ?? (basePrice + (selectedWeight?.priceDiff || 0));
  const totalPrice = unitPrice * quantity;
  const isAvailable = product.stock > 0;

  const addToCart = () => {
    if (!isAvailable) return;
    const selectedOptions = [
      selectedBone,
      selectedSkin,
      selectedWeight?.label,
      selectedEggGrade,
      selectedPack?.label,
      selectedSupply?.label,
      selectedAge?.label,
    ].filter(Boolean) as string[];
    const optionKey = selectedOptions.join('|');
    const cartProduct: Product = selectedOptions.length > 0
      ? {
          ...product,
          id: `${product.id}::${optionKey}`,
          name: `${product.name} (${selectedOptions.join(', ')})`,
          price: buyerType === 'retail' ? unitPrice : product.price,
          wholesalePrice: buyerType === 'wholesale' ? unitPrice : product.wholesalePrice
        }
      : product;

    onAddToCart(cartProduct, quantity);
    setWasAdded(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 p-2 backdrop-blur-sm sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className="mx-auto my-2 w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-5"
      >
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <span className="text-sm font-bold text-emerald-950">Product details</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSaved((saved) => !saved)}
              aria-label={`${isSaved ? 'Remove' : 'Save'} ${product.name}`}
              aria-pressed={isSaved}
              className={`grid h-9 w-9 place-items-center rounded-full transition-colors cursor-pointer ${
                isSaved ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-emerald-950 hover:bg-slate-200'
              }`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              id="close-product-detail-btn"
              type="button"
              onClick={onClose}
              aria-label="Close product details"
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid gap-7 p-4 sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8">
          <section className="space-y-3" aria-label="Product images">
            <div className="aspect-[1.08/1] overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={images[selectedImageIndex] || product.image}
                alt={product.name}
                decoding="async"
                className="h-full w-full object-cover"
                style={{ objectPosition: product.imagePosition || '50% 50%' }}
              />
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View image ${index + 1} of ${images.length}`}
                    aria-pressed={selectedImageIndex === index}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 cursor-pointer ${
                      selectedImageIndex === index ? 'border-emerald-900' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: product.imagePosition || '50% 50%' }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="flex min-w-0 flex-col">
            <div className="space-y-3">
              <h1 id="product-detail-title" className="font-serif text-2xl font-black leading-tight text-emerald-950 sm:text-3xl">
                {product.name}
              </h1>
              <StarRating rating={product.rating} />
              <p className="text-sm leading-6 text-slate-600">{product.description}</p>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5 border-y border-slate-100 py-5 text-emerald-950">
              <span className="text-2xl font-black">Ksh {unitPrice.toLocaleString()}</span>
              {product.unit ? <span className="text-sm text-slate-500">/{product.unit}</span> : null}
            </div>

            <div className="mt-6 space-y-5">
              <OptionGroup label="Bone" options={boneOptions} selected={selectedBone} onSelect={setSelectedBone} />
              <OptionGroup label="Skin" options={skinOptions} selected={selectedSkin} onSelect={setSelectedSkin} />
              <OptionGroup label="Egg size" options={eggGradeOptions} selected={selectedEggGrade} onSelect={setSelectedEggGrade} />

              {ageOptions.length > 0 ? (
                <OptionGroup
                  label="Age"
                  options={ageOptions.map((option) => option.label)}
                  selected={selectedAge?.label || ''}
                  onSelect={(option) => setSelectedAgeIndex(ageOptions.findIndex((item) => item.label === option))}
                />
              ) : null}

              {weightOptions.length > 0 ? (
                <OptionGroup
                  label="Weight"
                  options={weightOptions.map((option) => option.label)}
                  selected={selectedWeight?.label || ''}
                  onSelect={(option) => setSelectedWeightIndex(weightOptions.findIndex((item) => item.label === option))}
                />
              ) : null}

              {packOptions.length > 0 ? (
                <OptionGroup
                  label="Pack"
                  options={packOptions.map((option) => option.label)}
                  selected={selectedPack?.label || ''}
                  onSelect={(option) => setSelectedPackIndex(packOptions.findIndex((item) => item.label === option))}
                />
              ) : null}

              {supplyOptions.length > 0 ? (
                <OptionGroup
                  label="Size"
                  options={supplyOptions.map((option) => option.label)}
                  selected={selectedSupply?.label || ''}
                  onSelect={(option) => setSelectedSupplyIndex(supplyOptions.findIndex((item) => item.label === option))}
                />
              ) : null}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 items-center justify-between rounded-xl border border-slate-200 px-2 sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(minimumQuantity, current - 1))}
                  disabled={quantity <= minimumQuantity}
                  aria-label="Decrease quantity"
                  className="grid h-8 w-8 place-items-center rounded-full text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-black text-slate-900" aria-label={`Quantity ${quantity}`}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  aria-label="Increase quantity"
                  className="grid h-8 w-8 place-items-center rounded-full text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={!isAvailable}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition-colors disabled:cursor-not-allowed cursor-pointer ${
                  wasAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-400 text-emerald-950 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-500'
                }`}
              >
                {wasAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                <span>{isAvailable ? (wasAdded ? 'Added to cart' : `Add to cart · Ksh ${totalPrice.toLocaleString()}`) : 'Out of stock'}</span>
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500 sm:text-left">
              Sold directly by ChickMagnet. {buyerType === 'wholesale' ? `Wholesale minimum: ${minimumQuantity}. ` : ''}Delivery is calculated at checkout.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
