import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Egg,
  Feather,
  FileText,
  LayoutDashboard,
  LogIn,
  Monitor,
  Moon,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sun,
  User as UserIcon,
  Utensils,
  X,
} from 'lucide-react';
import { Link } from 'react-router';
import { BuyerType, MainCategory, Product, User } from '../types';
import { productMatchesSearch } from '../utils/storefrontProducts';
import { getCategoryPath, getProductPath } from '../utils/productSeo';
import { useBrandLogo } from '../utils/cms';
import { ColorSchemePreference } from '../utils/colorScheme';

type StorefrontTab = 'shop' | 'about' | 'profile';
type StorefrontCategory = MainCategory | 'all';

const CATEGORY_ARTWORK: Record<StorefrontCategory, { src: string; position: string }> = {
  all: { src: '/images/navigation/all-products.webp', position: '50% 50%' },
  'live-birds': { src: '/images/navigation/live-chicken.webp', position: '50% 50%' },
  'fresh-poultry': { src: '/images/navigation/fresh-chicken.webp', position: '50% 50%' },
  eggs: { src: '/images/navigation/eggs.webp', position: '50% 50%' },
  processed: { src: '/images/navigation/fresh-chicken.webp', position: '50% 50%' },
  'farm-supplies': { src: '/images/navigation/all-products.webp', position: '50% 50%' },
};

const CATEGORY_OPTIONS = [
  { id: 'all' as const, label: 'All Products', description: 'Chicken and eggs' },
  { id: 'live-birds' as const, label: 'Live Chicken', description: 'Chicks and mature chicken' },
  { id: 'fresh-poultry' as const, label: 'Fresh Chicken', description: 'Whole chicken and cuts' },
  { id: 'eggs' as const, label: 'Eggs', description: 'Fresh eggs by the tray' },
];

function CategoryArtwork({ category, compact = false }: { category: StorefrontCategory; compact?: boolean }) {
  const artwork = CATEGORY_ARTWORK[category];

  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-2xl bg-emerald-950 shadow-sm ring-1 ring-black/5 ${
        compact ? 'h-10 w-10' : 'h-12 w-12'
      }`}
      aria-hidden="true"
    >
      <img
        src={artwork.src}
        alt=""
        width="96"
        height="96"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={{ objectPosition: artwork.position }}
      />
    </span>
  );
}

interface NavbarProps {
  activeTab: StorefrontTab;
  setActiveTab: (tab: StorefrontTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'signin' | 'register') => void;
  onSignOut: () => void;
  buyerType: BuyerType;
  setBuyerType: (type: BuyerType) => void;
  selectedCategory: StorefrontCategory;
  setSelectedCategory: (category: StorefrontCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchableProducts: Product[];
  onApplySearch: () => void;
  colorScheme: ColorSchemePreference;
  onColorSchemeChange: (preference: ColorSchemePreference) => void;
  onOpenTraceability: () => void;
  onOpenClaims: () => void;
  onOpenAdmin?: () => void;
  onOpenBusinessPlan?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onSignOut,
  buyerType,
  setBuyerType,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  searchableProducts,
  onApplySearch,
  colorScheme,
  onColorSchemeChange,
  onOpenAdmin,
  onOpenBusinessPlan,
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const brand = useBrandLogo();
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const ColorSchemeIcon = colorScheme === 'light' ? Sun : colorScheme === 'dark' ? Moon : Monitor;

  const isAdmin = Boolean(
    currentUser?.customClaims?.admin === true || currentUser?.customClaims?.role === 'ADMIN'
  );
  const visibleCategories = CATEGORY_OPTIONS.filter(
    category => buyerType !== 'wholesale' || category.id !== 'fresh-poultry'
  );
  const selectedCategoryLabel = CATEGORY_OPTIONS.find(category => category.id === selectedCategory)?.label
    ?? 'All Products';
  const selectedBuyerLabel = buyerType === 'wholesale' ? 'Commercial Wholesale' : 'Retail';

  const matchingProducts = useMemo(() => {
    return searchableProducts.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesCategory && productMatchesSearch(product, searchQuery);
    });
  }, [searchableProducts, searchQuery, selectedCategory]);
  const suggestions = matchingProducts.slice(0, 6);

  const selectCategory = (category: StorefrontCategory) => {
    setSelectedCategory(category);
    if (activeTab !== 'shop') setActiveTab('shop');
  };

  const selectBuyerType = (type: BuyerType) => {
    setBuyerType(type);
    if (activeTab !== 'shop') setActiveTab('shop');
  };

  const applySearch = () => {
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
    if (activeTab !== 'shop') setActiveTab('shop');
    onApplySearch();
  };

  useEffect(() => {
    if (!desktopSearchOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!desktopSearchRef.current?.contains(event.target as Node)) {
        setDesktopSearchOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDesktopSearchOpen(false);
        desktopSearchButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [desktopSearchOpen]);

  useEffect(() => {
    if (!mobileSearchOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      mobileSheetRef.current?.querySelector<HTMLElement>('input, button')?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileSearchOpen(false);
        mobileSearchButtonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !mobileSheetRef.current) return;

      const focusable = Array.from(
        mobileSheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileSearchOpen]);

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#fffdf9]/90 text-[#173b2a] shadow-[0_10px_35px_rgba(18,53,36,0.07)] backdrop-blur-2xl supports-[not_(backdrop-filter:blur(1px))]:bg-[#fffdf9] dark:border-white/10 dark:bg-[#071c13]/92 dark:text-emerald-50 dark:shadow-[0_10px_35px_rgba(0,0,0,0.28)] dark:supports-[not_(backdrop-filter:blur(1px))]:bg-[#071c13]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-1.5 px-3 py-2.5 min-[360px]:gap-2 min-[360px]:px-4 sm:px-6 sm:py-3 xl:gap-5 xl:px-8">
        <Link
          to={getCategoryPath('all', buyerType === 'wholesale')}
          className="group flex h-11 min-w-0 shrink items-center rounded-2xl bg-[#123524] px-2 shadow-[0_6px_18px_rgba(18,53,36,0.18)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:bg-[#123524] dark:focus-visible:ring-offset-[#071c13] sm:h-14 sm:shrink-0 sm:px-3"
          aria-label="Go to all products"
        >
          {brand.logoImageUrl ? (
            <span className="flex items-center gap-2.5">
              <img
                src={brand.logoImageUrl}
                alt={brand.brandName || 'ChickMagnet'}
                width="240"
                height="108"
                className="h-8 w-auto max-w-[84px] object-contain transition-transform group-hover:scale-[1.03] min-[360px]:max-w-[104px] sm:h-11 sm:max-w-[176px]"
              />
              {brand.logoDisplayMode === 'image_with_text' ? (
                <span className="hidden text-lg font-extrabold tracking-[-0.03em] text-amber-300 xl:inline">
                  {brand.brandName || 'ChickMagnet'}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="truncate px-1 text-base font-extrabold tracking-[-0.03em] text-amber-300 min-[360px]:text-lg sm:text-xl">
              {brand.brandName || 'ChickMagnet'}
            </span>
          )}
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex" aria-label="Product categories">
          {visibleCategories.map(category => {
            const selected = selectedCategory === category.id;
            return (
              <Link
                key={category.id}
                to={getCategoryPath(category.id, buyerType === 'wholesale')}
                aria-current={selected ? 'page' : undefined}
                className={`group flex min-w-0 items-center gap-2.5 rounded-[1.35rem] border px-2.5 py-2 text-left transition-all ${
                  selected
                    ? 'border-emerald-900 bg-emerald-950 text-white shadow-[0_8px_18px_rgba(6,46,31,0.2)]'
                    : 'border-transparent bg-white/70 text-[#173b2a] hover:border-stone-200 hover:bg-white hover:shadow-sm dark:bg-white/[0.06] dark:text-emerald-50 dark:hover:border-white/15 dark:hover:bg-white/10'
                }`}
              >
                <CategoryArtwork category={category.id} />
                <span className="min-w-0 pr-1">
                  <span className="block whitespace-nowrap text-[13px] font-bold tracking-[-0.01em]">{category.label}</span>
                  <span className={`hidden whitespace-nowrap text-[10px] 2xl:block ${selected ? 'text-emerald-100/75' : 'text-stone-500 dark:text-emerald-100/55'}`}>
                    {category.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 min-[360px]:gap-2">
          <label
            className="relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-stone-200 bg-white text-emerald-950 shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50 focus-within:ring-2 focus-within:ring-amber-400 dark:border-white/12 dark:bg-white/[0.08] dark:text-amber-200 dark:hover:bg-white/[0.13]"
            title={`Color scheme: ${colorScheme}`}
          >
            <span className="sr-only">Color scheme</span>
            <ColorSchemeIcon className="h-4 w-4" aria-hidden="true" />
            <select
              value={colorScheme}
              onChange={event => onColorSchemeChange(event.target.value as ColorSchemePreference)}
              aria-label="Color scheme"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(open => !open)}
                className="flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-2 shadow-sm transition-all hover:border-stone-300 hover:shadow-md dark:border-white/12 dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.13] sm:pr-3"
                aria-expanded={profileOpen}
                aria-label="Open account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 text-sm font-extrabold text-amber-300">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </span>
                <span className="hidden max-w-[120px] truncate text-xs font-bold md:inline">{currentUser.name}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-stone-500 sm:block" />
              </button>

              {profileOpen ? (
                  <div className="animate-popover-enter absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-24px)] rounded-2xl border border-stone-200 bg-white p-3 text-xs text-[#173b2a] shadow-[0_18px_50px_rgba(18,53,36,0.18)] dark:border-white/12 dark:bg-[#0d281c] dark:text-emerald-50 dark:shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
                    <div className="mb-2 border-b border-stone-100 px-2 pb-3 dark:border-white/10">
                      <div className="font-bold">{currentUser.name} {isAdmin ? '(Admin)' : ''}</div>
                      <div className="truncate pt-0.5 text-[11px] text-stone-500 dark:text-emerald-100/55">{currentUser.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left font-semibold hover:bg-emerald-50 dark:hover:bg-white/10"
                    >
                      <UserIcon className="h-4 w-4 text-emerald-800" />
                      My Account & Orders
                    </button>
                    {onOpenAdmin && isAdmin ? (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAdmin();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left font-semibold hover:bg-amber-50 dark:hover:bg-white/10"
                      >
                        <LayoutDashboard className="h-4 w-4 text-amber-600" />
                        Admin Dashboard
                      </button>
                    ) : null}
                    {onOpenBusinessPlan && isAdmin ? (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenBusinessPlan();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left font-semibold hover:bg-emerald-50 dark:hover:bg-white/10"
                      >
                        <FileText className="h-4 w-4 text-emerald-800" />
                        Farm Plan
                      </button>
                    ) : null}
                    <div className="mt-2 border-t border-stone-100 pt-2 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onSignOut();
                        }}
                        className="w-full rounded-xl px-2 py-2.5 text-left font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              aria-label="Sign in"
                className="flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 text-xs font-bold text-[#173b2a] shadow-sm transition-all hover:border-stone-300 hover:shadow-md dark:border-white/12 dark:bg-white/[0.08] dark:text-emerald-50 dark:hover:bg-white/[0.13]"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <button
            id="header-cart-button"
            type="button"
            onClick={onOpenCart}
            aria-label={`Open cart${cartCount > 0 ? ` with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : ''}`}
            className="relative flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 text-xs font-extrabold text-emerald-950 shadow-[0_6px_16px_rgba(245,158,11,0.25)] transition-all hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400 sm:px-4"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald-950 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-300">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <nav className="no-scrollbar flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-3 pb-2.5 min-[360px]:px-4 sm:pb-3 xl:hidden" aria-label="Product categories">
        {visibleCategories.map(category => {
          const selected = selectedCategory === category.id;
          return (
            <Link
              key={category.id}
              to={getCategoryPath(category.id, buyerType === 'wholesale')}
              aria-current={selected ? 'page' : undefined}
              className={`group flex shrink-0 snap-start items-center gap-2 rounded-2xl border px-2 py-1.5 text-xs font-bold transition-all ${
                selected ? 'border-emerald-950 bg-emerald-950 text-white shadow-sm' : 'border-stone-200 bg-white text-[#173b2a] dark:border-white/12 dark:bg-white/[0.07] dark:text-emerald-50'
              }`}
            >
              <CategoryArtwork category={category.id} compact />
              <span className="whitespace-nowrap pr-1">{category.label}</span>
            </Link>
          );
        })}
      </nav>

      <div ref={desktopSearchRef} className="relative hidden border-t border-stone-100/80 px-6 pb-4 pt-3 dark:border-white/10 xl:block">
        <div className="mx-auto flex max-w-4xl items-stretch rounded-full border border-stone-200/90 bg-white/78 p-1.5 shadow-[0_12px_36px_rgba(18,53,36,0.13)] backdrop-blur-2xl dark:border-white/12 dark:bg-white/[0.08] dark:shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
          <button
            ref={desktopSearchButtonRef}
            type="button"
            onClick={() => setDesktopSearchOpen(true)}
            aria-expanded={desktopSearchOpen}
            className="min-w-[190px] rounded-full px-6 py-3 text-left transition-colors hover:bg-stone-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:hover:bg-white/10 dark:focus-visible:ring-amber-300"
          >
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-emerald-950 dark:text-white">Order type</span>
            <span className="mt-0.5 block text-sm text-stone-500 dark:text-emerald-100/60">{selectedBuyerLabel}</span>
          </button>
          <div className="my-2 w-px bg-stone-200 dark:bg-white/10" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setDesktopSearchOpen(true)}
            aria-expanded={desktopSearchOpen}
            className="min-w-[190px] rounded-full px-6 py-3 text-left transition-colors hover:bg-stone-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:hover:bg-white/10 dark:focus-visible:ring-amber-300"
          >
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-emerald-950 dark:text-white">Products</span>
            <span className="mt-0.5 block text-sm text-stone-500 dark:text-emerald-100/60">{selectedCategoryLabel}</span>
          </button>
          <div className="my-2 w-px bg-stone-200 dark:bg-white/10" aria-hidden="true" />
          <label className="min-w-0 flex-1 rounded-full px-6 py-3 transition-colors hover:bg-stone-100/80 focus-within:bg-stone-100/80 focus-within:ring-2 focus-within:ring-emerald-700 dark:hover:bg-white/10 dark:focus-within:bg-white/10 dark:focus-within:ring-amber-300">
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-emerald-950 dark:text-white">Search</span>
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setDesktopSearchOpen(true)}
              onChange={event => {
                setSearchQuery(event.target.value);
                if (activeTab !== 'shop') setActiveTab('shop');
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') applySearch();
              }}
              placeholder="Product, breed, cut, age or unit"
              className="mt-0.5 w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400 dark:text-emerald-50 dark:placeholder:text-emerald-100/45"
            />
          </label>
          <button
            type="button"
            onClick={applySearch}
            aria-label="Show matching products"
            className="grid h-14 w-14 shrink-0 place-items-center self-center rounded-full bg-amber-400 text-emerald-950 shadow-[0_8px_20px_rgba(245,158,11,0.32)] transition-transform hover:scale-105 hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {desktopSearchOpen ? (
            <div
              role="dialog"
              aria-label="Search options"
              className="animate-popover-enter absolute left-1/2 top-[calc(100%-4px)] z-50 grid w-[min(860px,calc(100vw-48px))] -translate-x-1/2 grid-cols-[0.8fr_0.9fr_1.4fr] gap-4 rounded-[2rem] border border-white/90 bg-white/92 p-5 shadow-[0_26px_80px_rgba(18,53,36,0.2)] backdrop-blur-2xl supports-[not_(backdrop-filter:blur(1px))]:bg-white dark:border-white/12 dark:bg-[#0d281c]/95 dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)] dark:supports-[not_(backdrop-filter:blur(1px))]:bg-[#0d281c]"
            >
              <SearchOptions
                buyerType={buyerType}
                selectedCategory={selectedCategory}
                visibleCategories={visibleCategories}
                suggestions={suggestions}
                onSelectBuyer={selectBuyerType}
                onSelectCategory={selectCategory}
              />
            </div>
          ) : null}
      </div>

      <div className="border-t border-stone-100/80 px-3 pb-3 pt-2 dark:border-white/10 min-[360px]:px-4 xl:hidden">
        <button
          ref={mobileSearchButtonRef}
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="flex w-full items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3 text-left shadow-[0_7px_22px_rgba(18,53,36,0.11)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:border-white/12 dark:bg-white/[0.08] dark:shadow-[0_8px_26px_rgba(0,0,0,0.26)] dark:focus-visible:ring-amber-300"
          aria-haspopup="dialog"
        >
          <Search className="h-5 w-5 shrink-0 text-emerald-900 dark:text-amber-300" />
          <span className="min-w-0 flex-1">
            <strong className="block text-sm text-emerald-950 dark:text-white">Search ChickMagnet</strong>
            <span className="block truncate text-xs text-stone-500 dark:text-emerald-100/60">
              {selectedBuyerLabel} · {selectedCategoryLabel}{searchQuery ? ` · ${searchQuery}` : ''}
            </span>
          </span>
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-stone-500 dark:text-emerald-100/60" />
        </button>
      </div>
    </header>

      {mobileSearchOpen ? (
          <div
            className="animate-fade-enter fixed inset-0 z-[70] flex items-end bg-emerald-950/45 p-0 backdrop-blur-sm xl:hidden"
            onMouseDown={event => {
              if (event.target === event.currentTarget) setMobileSearchOpen(false);
            }}
          >
            <div
              ref={mobileSheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-search-title"
              className="animate-sheet-enter flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-[#fffdf9] shadow-[0_-20px_60px_rgba(18,53,36,0.25)] dark:bg-[#0b2117] dark:text-emerald-50 dark:shadow-[0_-20px_60px_rgba(0,0,0,0.5)] sm:mx-auto sm:mb-4 sm:max-w-2xl sm:rounded-[2rem]"
            >
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-white/10">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-amber-700">ChickMagnet</p>
                  <h2 id="mobile-search-title" className="text-xl font-extrabold tracking-[-0.03em] text-emerald-950 dark:text-white">Find your products</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    mobileSearchButtonRef.current?.focus();
                  }}
                  aria-label="Close search"
                  className="grid h-11 w-11 place-items-center rounded-full border border-stone-200 bg-white text-emerald-950 dark:border-white/12 dark:bg-white/[0.08] dark:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <section aria-labelledby="mobile-buyer-heading">
                  <h3 id="mobile-buyer-heading" className="mb-3 text-xs font-extrabold uppercase tracking-[0.1em] text-stone-500 dark:text-emerald-100/60">Order type</h3>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1 dark:bg-black/25">
                    {(['retail', 'wholesale'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={buyerType === type}
                        onClick={() => selectBuyerType(type)}
                        className={`rounded-xl px-3 py-3 text-xs font-extrabold transition-all ${
                          buyerType === type ? 'bg-emerald-950 text-amber-300 shadow-sm' : 'text-stone-600 dark:text-emerald-100/70'
                        }`}
                      >
                        {type === 'retail' ? 'Retail' : 'Commercial Wholesale'}
                      </button>
                    ))}
                  </div>
                </section>

                <section aria-labelledby="mobile-products-heading">
                  <h3 id="mobile-products-heading" className="mb-3 text-xs font-extrabold uppercase tracking-[0.1em] text-stone-500 dark:text-emerald-100/60">Products</h3>
                  <div className="flex flex-wrap gap-2">
                    {visibleCategories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={selectedCategory === category.id}
                        onClick={() => selectCategory(category.id)}
                        className={`rounded-full border px-3.5 py-2 text-xs font-bold ${
                          selectedCategory === category.id
                            ? 'border-emerald-950 bg-emerald-950 text-white'
                            : 'border-stone-200 bg-white text-emerald-950 dark:border-white/12 dark:bg-white/[0.07] dark:text-emerald-50'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section aria-labelledby="mobile-query-heading">
                  <h3 id="mobile-query-heading" className="mb-3 text-xs font-extrabold uppercase tracking-[0.1em] text-stone-500 dark:text-emerald-100/60">Search</h3>
                  <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15 dark:border-white/12 dark:bg-white/[0.07] dark:focus-within:border-amber-300 dark:focus-within:ring-amber-300/15">
                    <Search className="h-5 w-5 shrink-0 text-emerald-900 dark:text-amber-300" />
                    <input
                      type="search"
                      aria-label="Search"
                      value={searchQuery}
                      onChange={event => setSearchQuery(event.target.value)}
                      placeholder="Breed, cut, age or unit"
                      className="min-w-0 flex-1 bg-transparent text-sm text-emerald-950 outline-none placeholder:text-stone-400 dark:text-white dark:placeholder:text-emerald-100/45"
                    />
                  </label>
                  <SuggestionList products={suggestions} />
                </section>
              </div>

              <div className="border-t border-stone-200 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 dark:border-white/10 dark:bg-[#0b2117]/95">
                <button
                  type="button"
                  onClick={applySearch}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-4 text-sm font-extrabold text-emerald-950 shadow-[0_10px_24px_rgba(245,158,11,0.28)]"
                >
                  Show {matchingProducts.length} {matchingProducts.length === 1 ? 'product' : 'products'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
    </>
  );
}

function SearchOptions({
  buyerType,
  selectedCategory,
  visibleCategories,
  suggestions,
  onSelectBuyer,
  onSelectCategory,
}: {
  buyerType: BuyerType;
  selectedCategory: StorefrontCategory;
  visibleCategories: Array<(typeof CATEGORY_OPTIONS)[number]>;
  suggestions: Product[];
  onSelectBuyer: (buyer: BuyerType) => void;
  onSelectCategory: (category: StorefrontCategory) => void;
}) {
  return (
    <>
      <section aria-labelledby="desktop-buyer-heading">
        <h2 id="desktop-buyer-heading" className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-stone-500 dark:text-emerald-100/60">Order type</h2>
        <div className="space-y-1">
          {(['retail', 'wholesale'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => onSelectBuyer(type)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold ${
                buyerType === type ? 'bg-emerald-50 text-emerald-950 dark:bg-white/12 dark:text-white' : 'text-stone-600 hover:bg-stone-50 dark:text-emerald-100/70 dark:hover:bg-white/[0.07]'
              }`}
            >
              {type === 'retail' ? 'Retail' : 'Commercial Wholesale'}
              {buyerType === type ? <Check className="h-4 w-4 text-emerald-800" /> : null}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="desktop-category-heading">
        <h2 id="desktop-category-heading" className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-stone-500 dark:text-emerald-100/60">Products</h2>
        <div className="space-y-1">
          {visibleCategories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold ${
                selectedCategory === category.id ? 'bg-emerald-50 text-emerald-950 dark:bg-white/12 dark:text-white' : 'text-stone-600 hover:bg-stone-50 dark:text-emerald-100/70 dark:hover:bg-white/[0.07]'
              }`}
            >
              {category.label}
              {selectedCategory === category.id ? <Check className="h-4 w-4 text-emerald-800" /> : null}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="desktop-suggestions-heading">
        <h2 id="desktop-suggestions-heading" className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-stone-500 dark:text-emerald-100/60">Products in this selection</h2>
        <SuggestionList products={suggestions} />
      </section>
    </>
  );
}

function SuggestionList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="rounded-xl bg-stone-50 px-3 py-4 text-sm text-stone-500 dark:bg-white/[0.06] dark:text-emerald-100/60">No products match this search.</p>;
  }

  return (
    <div className="mt-2 space-y-1">
      {products.map(product => (
        <Link
          key={product.id}
          to={getProductPath(product)}
          prefetch="intent"
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:hover:bg-white/[0.07] dark:focus-visible:ring-amber-300"
        >
          <img
            src={product.image}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl object-cover"
            style={{ objectPosition: product.imagePosition || '50% 50%' }}
          />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm text-emerald-950 dark:text-white">{product.name}</strong>
            <span className="block text-xs text-stone-500 dark:text-emerald-100/60">Ksh {product.price.toLocaleString()}{product.unit ? ` /${product.unit}` : ''}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
