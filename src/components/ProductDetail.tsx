import React, { useState, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Truck, 
  ArrowRight, 
  Share2, 
  Heart, 
  Award, 
  Star, 
  Bell, 
  Check, 
  Copy, 
  Layers, 
  Sparkles, 
  Info, 
  Calendar, 
  Plus, 
  ShoppingBag,
  Feather,
  Scale,
  Thermometer,
  Shield,
  HelpCircle,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { Product, BuyerType, Review } from '../types';
import { INITIAL_FARMS, MOCK_BATCH_TRACE_RECORDS, INITIAL_PRODUCTS } from '../data/products';

interface ProductDetailProps {
  product: Product;
  allProducts?: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedSex?: 'male'|'female'|'unsexed', selectedVariant?: string) => void;
  buyerType: BuyerType;
  onOpenTraceabilityWithBatch: (batchId: string) => void;
}

export default function ProductDetail({
  product,
  allProducts = INITIAL_PRODUCTS,
  onClose,
  onAddToCart,
  buyerType,
  onOpenTraceabilityWithBatch
}: ProductDetailProps) {
  const isWholesale = buyerType === 'wholesale';
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Gallery State
  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant States
  const [selectedGender, setSelectedGender] = useState<string>(
    product.variantsConfig?.genders?.[0] || 
    (product.liveData?.sex ? (product.liveData.sex === 'female' ? 'Female (Pullet)' : product.liveData.sex === 'male' ? 'Male (Cockerel)' : 'Straight Run (Unsexed)') : 'Standard')
  );

  const [selectedBreedVariant, setSelectedBreedVariant] = useState<string>(
    product.variantsConfig?.breeds?.[0] || product.liveData?.breed || 'Standard'
  );

  const [selectedBone, setSelectedBone] = useState<string>(
    product.variantsConfig?.boneOptions?.[0] || (product.freshData?.boneStatus === 'boneless' ? 'Boneless' : 'Bone-In')
  );

  const [selectedSkin, setSelectedSkin] = useState<string>(
    product.variantsConfig?.skinOptions?.[0] || (product.freshData?.skinStatus === 'skinless' ? 'Skinless' : 'Skin-On')
  );

  const [selectedWeightBandIndex, setSelectedWeightBandIndex] = useState<number>(0);
  const selectedWeightBand = product.variantsConfig?.weightBands?.[selectedWeightBandIndex];

  const [selectedEggGrade, setSelectedEggGrade] = useState<string>(
    product.variantsConfig?.eggGrades?.[0] || 'Large Grade (55-60g)'
  );

  const [selectedPackIndex, setSelectedPackIndex] = useState<number>(0);
  const selectedPack = product.variantsConfig?.packCounts?.[selectedPackIndex];

  const [selectedSupplySizeIndex, setSelectedSupplySizeIndex] = useState<number>(0);
  const selectedSupplySize = product.variantsConfig?.supplySizes?.[selectedSupplySizeIndex];

  // Ship-Week State
  const shipWeeks = product.shipWeekStatus?.availableShipWeeks || [
    'Week of Sep 1, 2026',
    'Week of Sep 8, 2026',
    'Week of Sep 15, 2026'
  ];
  const [selectedShipWeek, setSelectedShipWeek] = useState<string>(shipWeeks[0]);
  const isSoldOutForSelectedWeek = product.shipWeekStatus?.isSoldOutForWeek && selectedShipWeek === product.shipWeekStatus.currentShipWeek;

  // Quantity State
  const initialQty = product.liveData?.minOrderQty || 1;
  const [quantity, setQuantity] = useState<number>(initialQty);

  // Wishlist & Share & Notify State
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(product.reviewsList || []);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewLocation, setNewReviewLocation] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Frequently Bought Together State
  const fbtConfig = product.frequentlyBoughtTogether;
  const pairingIds = fbtConfig?.productIds || [];
  const pairedProducts = pairingIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => !!p);

  const [fbtMainChecked, setFbtMainChecked] = useState(true);
  const [fbtPairedChecked, setFbtPairedChecked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    pairedProducts.forEach(p => { init[p.id] = true; });
    return init;
  });
  const [fbtAddedSuccess, setFbtAddedSuccess] = useState(false);

  // Calculate Base Unit Price dynamically based on selected variant
  let dynamicUnitPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
  if (selectedWeightBand && selectedWeightBand.priceDiff) {
    dynamicUnitPrice += selectedWeightBand.priceDiff;
  } else if (selectedPack && selectedPack.price) {
    dynamicUnitPrice = selectedPack.price;
  } else if (selectedSupplySize && selectedSupplySize.price) {
    dynamicUnitPrice = selectedSupplySize.price;
  }

  const totalPrice = dynamicUnitPrice * quantity;

  // Farm & Batch Data
  const farm = INITIAL_FARMS.find(f => f.id === product.sellerId) || INITIAL_FARMS[0];
  const batchId = product.liveData?.batchId || product.freshData?.batchId || product.processedData?.batchId;
  const traceRecord = batchId ? MOCK_BATCH_TRACE_RECORDS[batchId] : null;

  // Handler for Frequently Bought Together Bundle Price
  const discountPercent = fbtConfig?.bundleDiscountPercent || 10;
  let fbtOriginalSum = fbtMainChecked ? dynamicUnitPrice : 0;
  pairedProducts.forEach(p => {
    if (fbtPairedChecked[p.id]) {
      fbtOriginalSum += (isWholesale && p.wholesalePrice ? p.wholesalePrice : p.price);
    }
  });
  const fbtDiscountedSum = Math.round(fbtOriginalSum * (1 - discountPercent / 100));
  const fbtSavings = fbtOriginalSum - fbtDiscountedSum;

  const handleAddFbtBundleToCart = () => {
    let itemsAdded = 0;
    if (fbtMainChecked) {
      const sexPayload = selectedGender.toLowerCase().includes('female') 
        ? 'female' 
        : selectedGender.toLowerCase().includes('male') 
        ? 'male' 
        : 'unsexed';
      onAddToCart(product, 1, sexPayload, `${selectedBreedVariant} • ${selectedGender}`);
      itemsAdded++;
    }
    pairedProducts.forEach(p => {
      if (fbtPairedChecked[p.id]) {
        onAddToCart(p, 1);
        itemsAdded++;
      }
    });
    if (itemsAdded > 0) {
      setFbtAddedSuccess(true);
      setTimeout(() => setFbtAddedSuccess(false), 3000);
    }
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;
    const newRev: Review = {
      id: `rev-usr-${Date.now()}`,
      author: newReviewAuthor.trim(),
      rating: newRating,
      date: new Date().toISOString().split('T')[0],
      comment: newReviewComment.trim(),
      avatarColor: 'bg-emerald-700',
      verifiedBuyer: true,
      buyerType: 'retail',
      location: newReviewLocation.trim() || 'Kenya'
    };
    setReviews([newRev, ...reviews]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setIsWriteReviewOpen(false);
      setNewReviewAuthor('');
      setNewReviewLocation('');
      setNewReviewComment('');
    }, 1500);
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyPhone && !notifyEmail) return;
    setNotifySubmitted(true);
    setTimeout(() => {
      setNotifySubmitted(false);
      setIsNotifyModalOpen(false);
    }, 2000);
  };

  return (
    <div id="product-detail-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] overflow-y-auto border border-slate-200 shadow-2xl relative text-slate-900 flex flex-col my-auto">
        
        {/* Sticky Top Header Bar with Close and Actions */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="text-emerald-700 font-bold uppercase">{product.category.replace('-', ' ')}</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share product link"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              title="Save to wishlist"
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                isWishlisted 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
            </button>

            <button
              id="close-product-detail-btn"
              onClick={onClose}
              className="bg-slate-100 text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-10">
          
          {/* TOP SECTION: 2-COLUMN LAYOUT (Image Gallery on Left, Product Selectors & Primary CTA on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: IMAGE GALLERY & THUMBNAIL STRIP */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                
                {/* Thumbnail Strip on Side / Bottom */}
                {imagesList.length > 1 && (
                  <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[380px] shrink-0 py-1">
                    {imagesList.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          selectedImageIndex === idx 
                            ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-102' 
                            : 'border-slate-200 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Large Image */}
                <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 h-80 sm:h-96 md:h-[420px] shadow-sm group">
                  <img
                    src={imagesList[selectedImageIndex] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                    <span className="bg-emerald-900 text-amber-300 font-mono font-bold text-[11px] px-3 py-1 rounded-full shadow-xs">
                      {product.category.toUpperCase().replace('-', ' ')}
                    </span>
                    {product.badge && (
                      <span className="bg-amber-400 text-emerald-950 font-black text-[11px] px-2.5 py-1 rounded-md shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    {product.freshData?.halalCertified && (
                      <span className="bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-md shadow-xs">
                        ✓ Halal Certified
                      </span>
                    )}
                  </div>

                  {/* Stock Availability Pill */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-xs backdrop-blur-md ${
                      product.stock > 0 
                        ? 'bg-white/90 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-900/90 text-rose-200 border border-rose-700'
                    }`}>
                      {product.stock > 0 ? `● In Stock (${product.stock} units)` : '○ Out of Stock'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Sourcing Farm & Bio-Security Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-xl shadow-xs shrink-0">
                    🏡
                  </div>
                  <div>
                    <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                      <span>{farm.name}</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-950 font-mono font-black px-1.5 py-0.2 rounded">
                        {product.sellerBadge}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800 flex items-center gap-1 mt-0.5">
                      <span>{farm.location}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">{farm.biosecurityLevel}</span>
                    </div>
                  </div>
                </div>

                {batchId && (
                  <button
                    onClick={() => onOpenTraceabilityWithBatch(batchId)}
                    className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Lab Cert</span>
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: TITLE, STAR RATING, PRICING, VARIANTS & PRIMARY CTA */}
            <div className="lg:col-span-6 flex flex-col space-y-6">
              
              {/* Product Title, Category, Rating */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {product.subCategory.replace('-', ' ').toUpperCase()}
                  </span>
                  {product.fulfillmentType === 'live-climate' && (
                    <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Live Climate Transport
                    </span>
                  )}
                  {product.fulfillmentType === 'chilled-express' && (
                    <span className="text-[11px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" /> Chilled Cold-Chain
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating Anchor linking smoothly to reviews */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={scrollToReviews}
                    className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-emerald-700 transition cursor-pointer group"
                  >
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="font-black text-slate-900">{product.rating}</span>
                    <span className="text-slate-500 underline group-hover:text-emerald-700">
                      ({product.reviewsCount || reviews.length} customer reviews)
                    </span>
                  </button>
                </div>
              </div>

              {/* Price & Shipping Expectation Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-mono font-bold text-slate-600">Ksh</span>
                    <span className="font-serif text-3xl font-black text-emerald-950">
                      {dynamicUnitPrice.toLocaleString()}
                    </span>
                    {product.unit && <span className="text-xs text-slate-500 font-mono">/ {product.unit}</span>}
                  </div>

                  {isWholesale && product.wholesalePrice && (
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-300">
                      Wholesale Net Rate
                    </span>
                  )}
                </div>

                {/* Explicit shipping expectation note */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-xs text-slate-600">
                  <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Shipping calculated at checkout</strong> (Climate-controlled express transport across Kenya)
                  </span>
                </div>
              </div>

              {/* DYNAMIC VARIANT SELECTORS (ByCategory) */}
              <div className="space-y-4 pt-1">
                
                {/* 1. LIVE BIRDS VARIANTS */}
                {product.category === 'live-birds' && (
                  <div className="space-y-3">
                    {/* Gender Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 font-mono mb-1.5">
                        Select Gender / Sex Link:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(product.variantsConfig?.genders || [
                          'Female (Pullet)',
                          'Male (Cockerel)',
                          'Straight Run (Unsexed)'
                        ]).map((g, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedGender(g)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                              selectedGender === g
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Breed Selector */}
                    {product.variantsConfig?.breeds && (
                      <div>
                        <label className="block text-xs font-bold text-slate-800 font-mono mb-1.5">
                          Select Heritage Breed Line:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {product.variantsConfig.breeds.map((b, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedBreedVariant(b)}
                              className={`p-2 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                                selectedBreedVariant === b
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ship Week Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                          Hatch & Ship Week Availability:
                        </label>
                        {isSoldOutForSelectedWeek && (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            Sold Out for Selected Week
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {shipWeeks.map((week, idx) => {
                          const isWeekSoldOut = product.shipWeekStatus?.isSoldOutForWeek && idx === 0;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedShipWeek(week)}
                              className={`p-2 rounded-xl border text-xs font-bold transition text-left flex flex-col cursor-pointer ${
                                selectedShipWeek === week
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                                  : isWeekSoldOut
                                  ? 'border-slate-200 bg-slate-100 text-slate-400'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span>{week}</span>
                              <span className="text-[10px] font-normal text-slate-500">
                                {isWeekSoldOut ? 'Sold Out' : 'Available (Express Box)'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FRESH POULTRY CUTS VARIANTS */}
                {product.category === 'fresh-poultry' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Bone Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 font-mono mb-1.5">
                          Bone Specification:
                        </label>
                        <div className="flex gap-2">
                          {(product.variantsConfig?.boneOptions || ['Bone-In', 'Boneless']).map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedBone(opt)}
                              className={`flex-1 p-2 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                                selectedBone === opt
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Skin Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 font-mono mb-1.5">
                          Skin Specification:
                        </label>
                        <div className="flex gap-2">
                          {(product.variantsConfig?.skinOptions || ['Skin-On', 'Skinless']).map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedSkin(opt)}
                              className={`flex-1 p-2 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                                selectedSkin === opt
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Weight Band Selector */}
                    {product.variantsConfig?.weightBands && (
                      <div>
                        <label className="block text-xs font-bold text-slate-800 font-mono mb-1.5">
                          Select Carcass Weight Band:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {product.variantsConfig.weightBands.map((wb, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedWeightBandIndex(idx)}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex flex-col cursor-pointer ${
                                selectedWeightBandIndex === idx
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span>{wb.label}</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {wb.priceDiff ? `+Ksh ${wb.priceDiff}` : 'Standard Base'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. EGGS VARIANTS */}
                {product.category === 'eggs' && (
                  <div className="space-y-3">
                    {product.variantsConfig?.eggGrades && (
                      <div>
                        <label className="block text-xs font-bold text-slate-800 font-mono mb-1.5">
                          Select Egg Grade / Size:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {product.variantsConfig.eggGrades.map((grade, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedEggGrade(grade)}
                              className={`p-2 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                                selectedEggGrade === grade
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {grade}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.variantsConfig?.packCounts && (
                      <div>
                        <label className="block text-xs font-bold text-slate-800 font-mono mb-1.5">
                          Select Packaging Count:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {product.variantsConfig.packCounts.map((pack, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedPackIndex(idx)}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex flex-col cursor-pointer ${
                                selectedPackIndex === idx
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span>{pack.label}</span>
                              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                Ksh {pack.price.toLocaleString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. FARM SUPPLIES VARIANTS */}
                {product.category === 'farm-supplies' && product.variantsConfig?.supplySizes && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 font-mono mb-1.5">
                      Select Package Bag Size / Unit:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {product.variantsConfig.supplySizes.map((size, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSupplySizeIndex(idx)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex flex-col cursor-pointer ${
                            selectedSupplySizeIndex === idx
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span>{size.label}</span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            Ksh {size.price.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="pt-2 flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 font-mono">
                    Order Units {product.liveData?.minOrderQty ? `(Min ${product.liveData.minOrderQty} chicks)` : ''}:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(product.liveData?.minOrderQty || 1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xl px-2 text-slate-900 min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* PRIMARY CTA & SECONDARY ACTIONS */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                {isSoldOutForSelectedWeek || product.stock <= 0 ? (
                  <button
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 p-4 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-5 h-5 text-amber-400" />
                    <span>Notify Me When Available for This Ship Week</span>
                  </button>
                ) : (
                  <button
                    id="add-to-cart-primary-cta"
                    onClick={() => {
                      const sexPayload = selectedGender.toLowerCase().includes('female') 
                        ? 'female' 
                        : selectedGender.toLowerCase().includes('male') 
                        ? 'male' 
                        : 'unsexed';
                      const variantDesc = `${selectedBreedVariant} • ${selectedGender} • ${selectedShipWeek}`;
                      onAddToCart(product, quantity, sexPayload, variantDesc);
                      onClose();
                    }}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 p-4 rounded-2xl font-black text-base shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add {quantity} to Cart • Ksh {totalPrice.toLocaleString()}</span>
                  </button>
                )}

                {/* Secondary Notify Action button if in-stock but customer wants future hatch updates */}
                {product.stock > 0 && (
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                    <button
                      onClick={() => setIsNotifyModalOpen(true)}
                      className="hover:text-emerald-700 transition flex items-center gap-1.5 cursor-pointer font-semibold"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Get SMS alert for future hatch batches</span>
                    </button>

                    <div className="flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified Farm Gate Guarantee</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* EXTENSIVE PROSE DESCRIPTION SECTION */}
          <div className="pt-8 border-t border-slate-200 space-y-8">
            
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-sm">
                📖
              </div>
              <h2 className="font-serif text-2xl font-black text-slate-900">
                Detailed Product Overview & Heritage Notes
              </h2>
            </div>

            {/* 1. Breed Story & Origin in rich prose */}
            {product.story && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Feather className="w-4 h-4 text-emerald-700" />
                  Breed Heritage & Farm Origin Story
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {product.story}
                </p>
              </div>
            )}

            {/* 2. Why It Matters Explainer */}
            {product.whyItMatters && (
              <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200 space-y-3">
                <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Why It Matters to Your Flock & Table
                </h3>
                <p className="text-sm text-amber-950 leading-relaxed">
                  {product.whyItMatters}
                </p>
              </div>
            )}

            {/* 3. Production & Farm Specs Grid */}
            {product.productionSpecs && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  Production & Biological Specifications
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {Object.entries(product.productionSpecs).map(([key, val], idx) => {
                    if (!val) return null;
                    const formattedKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                        <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                          {formattedKey}
                        </span>
                        <div className="text-sm font-bold text-slate-900">{val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Temperament & Physical Description */}
            {(product.temperament || product.physicalDescription) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.temperament && (
                  <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/70 space-y-2">
                    <div className="text-xs font-bold text-emerald-950 font-mono uppercase flex items-center gap-1.5">
                      <span>🐔</span> Temperament & Flock Character
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {product.temperament}
                    </p>
                  </div>
                )}

                {product.physicalDescription && (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 font-mono uppercase flex items-center gap-1.5">
                      <span>🎨</span> Physical Description & Appearance
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {product.physicalDescription}
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* FREQUENTLY BOUGHT TOGETHER MODULE */}
          {pairedProducts.length > 0 && (
            <div className="pt-8 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div>
                    <h3 className="font-serif text-xl font-black text-slate-900">
                      Frequently Bought Together
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bundle complementary flock essentials and save {discountPercent}% on the paired items!
                    </p>
                  </div>
                </div>

                <span className="bg-amber-100 text-amber-950 font-mono font-bold text-xs px-3 py-1 rounded-full border border-amber-300">
                  Save {discountPercent}% Bundle Discount
                </span>
              </div>

              <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Product Checkboxes Strip */}
                <div className="flex flex-wrap items-center gap-4 flex-1">
                  
                  {/* Current Main Product */}
                  <label className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={fbtMainChecked}
                      onChange={(e) => setFbtMainChecked(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                    />
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 max-w-[140px] truncate">{product.name}</div>
                      <div className="text-xs font-mono text-emerald-700 font-bold">Ksh {dynamicUnitPrice.toLocaleString()}</div>
                    </div>
                  </label>

                  <span className="text-xl font-bold text-slate-400">+</span>

                  {/* Paired Products */}
                  {pairedProducts.map((p, idx) => (
                    <React.Fragment key={p.id}>
                      <label className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!fbtPairedChecked[p.id]}
                          onChange={(e) => setFbtPairedChecked({ ...fbtPairedChecked, [p.id]: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 max-w-[140px] truncate">{p.name}</div>
                          <div className="text-xs font-mono text-emerald-700 font-bold">Ksh {p.price.toLocaleString()}</div>
                        </div>
                      </label>
                      {idx < pairedProducts.length - 1 && <span className="text-xl font-bold text-slate-400">+</span>}
                    </React.Fragment>
                  ))}

                </div>

                {/* Bundle Summary & Action Button */}
                <div className="w-full md:w-auto md:min-w-[240px] flex flex-col items-center md:items-end justify-center gap-2 text-center md:text-right pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-6">
                  <div>
                    <div className="text-[11px] text-slate-500 font-bold uppercase">Bundle Total Price:</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-slate-400 line-through font-mono">Ksh {fbtOriginalSum.toLocaleString()}</span>
                      <span className="font-serif text-2xl font-black text-emerald-950">Ksh {fbtDiscountedSum.toLocaleString()}</span>
                    </div>
                    {fbtSavings > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        You save Ksh {fbtSavings.toLocaleString()} with this bundle!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddFbtBundleToCart}
                    className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      fbtAddedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-400 hover:bg-amber-300 text-emerald-950'
                    }`}
                  >
                    {fbtAddedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added Bundle to Cart!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Selected to Cart</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* REVIEWS SECTION (Linked from top star rating) */}
          <div ref={reviewsRef} id="product-reviews-section" className="pt-8 border-t border-slate-200 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-700" />
                  Customer Ratings & Verified Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  Real reviews from homesteader farmers across Kenya.
                </p>
              </div>

              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Score Summary & Progress Bars */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 pr-0 md:pr-6 text-center">
                <div className="font-serif text-5xl font-black text-slate-900">{product.rating}</div>
                <div className="flex items-center text-amber-400 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  Based on {reviews.length} verified ratings
                </div>
              </div>

              <div className="md:col-span-8 space-y-2">
                {[
                  { star: 5, pct: '88%' },
                  { star: 4, pct: '10%' },
                  { star: 3, pct: '2%' },
                  { star: 2, pct: '0%' },
                  { star: 1, pct: '0%' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                    <span className="w-12 font-bold">{item.star} Stars</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: item.pct }} />
                    </div>
                    <span className="w-8 text-right text-slate-400">{item.pct}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${rev.avatarColor || 'bg-emerald-700'} text-white font-bold text-xs flex items-center justify-center`}>
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{rev.author}</span>
                          {rev.verifiedBuyer && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-700" /> Verified Homesteader
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{rev.location || 'Kenya'} • {rev.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* NOTIFY ME MODAL */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setIsNotifyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-emerald-950">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
                <Bell className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">Hatch Alert Notification</h3>
                <p className="text-xs text-slate-500">Get notified the instant this batch releases.</p>
              </div>
            </div>

            {notifySubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm font-bold text-emerald-950">Notification Registered!</div>
                <p className="text-xs text-emerald-800">
                  We'll send an automated SMS alert for <strong>{product.name} ({selectedShipWeek})</strong> as soon as stock opens.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 font-mono">Phone Number (SMS / WhatsApp):</label>
                  <input
                    type="tel"
                    required
                    placeholder="0712 345 678"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 font-mono">Email Address (Optional):</label>
                  <input
                    type="email"
                    placeholder="farmer@example.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  Selected Target: <strong>{product.name}</strong> • {selectedShipWeek}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNotifyModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                  >
                    Subscribe Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setIsWriteReviewOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-emerald-950">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg shrink-0">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">Write a Customer Review</h3>
                <p className="text-xs text-slate-500">Share your experience with {product.name}</p>
              </div>
            </div>

            {reviewSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm font-bold text-emerald-950">Review Posted!</div>
                <p className="text-xs text-emerald-800">
                  Thank you for supporting transparency in our poultry community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 font-mono">Your Star Rating:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="font-bold font-mono ml-2 text-slate-800">{newRating} of 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 font-mono">Your Full Name / Farm Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mary Njuguna"
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 font-mono">Location / County:</label>
                  <input
                    type="text"
                    placeholder="e.g. Ruiru, Kiambu County"
                    value={newReviewLocation}
                    onChange={(e) => setNewReviewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 font-mono">Review Comments:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="How was the flock health, packaging, delivery or egg quality?"
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWriteReviewOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
