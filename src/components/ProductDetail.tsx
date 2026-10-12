import { useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Heart, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { BuyerType, Product, ProductGuide as ProductGuideData } from '../types';
import { getMinimumOrderQuantity, getUnitPrice } from '../utils/orderRules';
import { getProductGuide } from '../utils/productGuides';
import ResponsiveProductImage from './ResponsiveProductImage';

interface ProductDetailProps {
  product: Product;
  onClose?: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  buyerType: BuyerType;
  standalone?: boolean;
  initialAgeWeeks?: number;
}

interface OptionGroupProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

function formatRating(rating: number) {
  if (rating === 5) return '5.0';
  return rating.toFixed(2).replace(/0$/, '');
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`${formatRating(rating)} out of 5 stars`}>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="text-sm font-bold text-slate-700 dark:text-emerald-100/70">{formatRating(rating)}</span>
    </div>
  );
}

function OptionGroup({ label, options, selected, onSelect }: OptionGroupProps) {
  if (options.length === 0) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-bold text-slate-700 dark:text-emerald-100/75">{label}</legend>
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
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-white/15 dark:bg-white/[0.06] dark:text-emerald-50 dark:hover:border-white/35'
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

function ProductGuidePanel({ product }: { product: Product }) {
  const guide = getProductGuide(product);

  const sectionContent = (section: ProductGuideData['sections'][number]) => (
    <>
      {section.summary ? (
        <p className="text-sm leading-6 text-slate-600 dark:text-emerald-100/70">{section.summary}</p>
      ) : null}
      {section.bullets?.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-emerald-100/70">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2.5">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700 dark:text-amber-300" aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  return (
    <section
      aria-labelledby="product-guide-title"
      className="border-t border-slate-100 bg-[#fbfaf6] px-4 py-7 dark:border-white/10 dark:bg-[#071a12] sm:px-6 lg:px-8 lg:py-9"
    >
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Product guide</p>
          <h2 id="product-guide-title" className="mt-2 font-serif text-2xl font-black tracking-tight text-emerald-950 dark:text-white sm:text-3xl">
            Know what you are buying
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-emerald-100/70 sm:text-base sm:leading-7">{guide.intro}</p>
        </div>

        {guide.highlights?.length ? (
          <dl className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4 sm:gap-3">
            {guide.highlights.map((highlight) => (
              <div key={highlight.label} className="rounded-2xl border border-emerald-900/10 bg-white px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.06] sm:px-4">
                <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-emerald-100/55">{highlight.label}</dt>
                <dd className="mt-1 text-sm font-bold leading-5 text-emerald-950 dark:text-white">{highlight.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-5 space-y-2 lg:hidden">
          {guide.sections.map((section) => (
            <details key={section.title} className="group rounded-2xl border border-emerald-900/10 bg-white dark:border-white/10 dark:bg-white/[0.06]">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left text-sm font-black text-emerald-950 marker:content-none dark:text-white">
                <span role="heading" aria-level={3}>{section.title}</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="border-t border-emerald-900/10 px-4 py-4 dark:border-white/10">
                {sectionContent(section)}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-6 hidden gap-4 lg:grid lg:grid-cols-2">
          {guide.sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-emerald-900/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.06]">
              <h3 className="text-base font-black text-emerald-950 dark:text-white">{section.title}</h3>
              <div className="mt-2">{sectionContent(section)}</div>
            </article>
          ))}
        </div>

        {guide.note ? (
          <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950 dark:bg-amber-300/10 dark:text-amber-100">
            <span className="font-black">Important: </span>{guide.note}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function ProductDetail({
  product,
  onClose,
  onAddToCart,
  buyerType,
  standalone = false,
  initialAgeWeeks,
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
  const [selectedAgeIndex, setSelectedAgeIndex] = useState(() => {
    const requestedIndex = ageOptions.findIndex(option => option.ageWeeks === initialAgeWeeks);
    return requestedIndex >= 0 ? requestedIndex : 0;
  });

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
  const isAvailable = product.stock > 0 && product.catalogStatus !== 'temporarilyUnavailable';

  const selectAge = (label: string) => {
    const nextIndex = ageOptions.findIndex(item => item.label === label);
    setSelectedAgeIndex(nextIndex);
    const ageWeeks = ageOptions[nextIndex]?.ageWeeks;
    if (standalone && ageWeeks !== undefined) {
      const url = new URL(window.location.href);
      url.searchParams.set('age', `${ageWeeks}-weeks`);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

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
    <div className={standalone ? 'w-full' : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 p-2 backdrop-blur-sm sm:p-5'}>
      <div
        role={standalone ? undefined : 'dialog'}
        aria-modal={standalone ? undefined : 'true'}
        aria-labelledby="product-detail-title"
        className={`mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white dark:bg-[#0b2117] dark:text-emerald-50 ${standalone ? 'border border-stone-200 shadow-[0_18px_55px_rgba(18,53,36,0.08)] dark:border-white/10' : 'my-2 shadow-2xl sm:my-5'}`}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0b2117]/95 sm:px-6">
          {standalone ? (
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
              <a href="/shop" className="inline-flex shrink-0 items-center gap-1 font-bold text-emerald-900 hover:underline dark:text-amber-300">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Products
              </a>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="truncate text-slate-500 dark:text-emerald-100/60">{product.name}</span>
            </nav>
          ) : (
            <span className="text-sm font-bold text-emerald-950 dark:text-white">Product details</span>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSaved((saved) => !saved)}
              aria-label={`${isSaved ? 'Remove' : 'Save'} ${product.name}`}
              aria-pressed={isSaved}
              className={`grid h-9 w-9 place-items-center rounded-full transition-colors cursor-pointer ${
                isSaved ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-emerald-950 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
              }`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            {!standalone ? (
              <button
                id="close-product-detail-btn"
                type="button"
                onClick={onClose}
                aria-label="Close product details"
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </header>

        <div className="grid gap-7 p-4 sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8">
          <section className="space-y-3" aria-label="Product images">
            <div className="aspect-[1.08/1] overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/10">
              <ResponsiveProductImage
                src={images[selectedImageIndex] || product.image}
                alt={product.imageAlt || product.name}
                sizes="(min-width: 1024px) 46vw, 100vw"
                fetchPriority="high"
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
                    <ResponsiveProductImage
                      src={image}
                      alt=""
                      sizes="64px"
                      loading="lazy"
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
              <h1 id="product-detail-title" className="font-serif text-2xl font-black leading-tight text-emerald-950 dark:text-white sm:text-3xl">
                {product.name}
              </h1>
              <StarRating rating={product.rating} />
              <p className="text-sm leading-6 text-slate-600 dark:text-emerald-100/70">{product.description}</p>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5 border-y border-slate-100 py-5 text-emerald-950 dark:border-white/10 dark:text-white">
              <span className="text-2xl font-black">Ksh {unitPrice.toLocaleString()}</span>
              {product.unit ? <span className="text-sm text-slate-500 dark:text-emerald-100/60">/{product.unit}</span> : null}
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
                  onSelect={selectAge}
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
              <div className="flex h-12 items-center justify-between rounded-xl border border-slate-200 px-2 dark:border-white/15 sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(minimumQuantity, current - 1))}
                  disabled={quantity <= minimumQuantity}
                  aria-label="Decrease quantity"
                  className="grid h-8 w-8 place-items-center rounded-full text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer dark:text-emerald-50 dark:hover:bg-white/10"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-black text-slate-900 dark:text-white" aria-label={`Quantity ${quantity}`}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  aria-label="Increase quantity"
                  className="grid h-8 w-8 place-items-center rounded-full text-slate-700 hover:bg-slate-100 cursor-pointer dark:text-emerald-50 dark:hover:bg-white/10"
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

            <p className="mt-3 text-center text-xs text-slate-500 dark:text-emerald-100/60 sm:text-left">
              Sold directly by ChickMagnet. {buyerType === 'wholesale' ? `Wholesale minimum: ${minimumQuantity} of one breed and one age. ` : ''}Delivery is quoted separately after ChickMagnet reviews the destination, order size and handling needs.
            </p>
          </section>
        </div>

        <ProductGuidePanel product={product} />
      </div>
    </div>
  );
}
