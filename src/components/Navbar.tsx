import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, LogIn, ChevronDown, Feather, Utensils, Egg, FileText, LayoutDashboard, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, BuyerType, MainCategory } from '../types';
import { useBrandLogo } from '../utils/cms';
import poultryChicksImage from '../assets/images/hero_poultry_chicks_1785408878635.jpg';
import roosterHenImage from '../assets/images/live_rooster_hen_1785409332530.jpg';
import freshChickenImage from '../assets/images/category-fresh-chicken.jpg';
import eggsImage from '../assets/images/category-eggs.jpg';

const CATEGORY_ARTWORK: Record<MainCategory | 'all', { src: string; position: string }> = {
  all: { src: poultryChicksImage, position: '50% 67%' },
  'live-birds': { src: roosterHenImage, position: '52% 43%' },
  'fresh-poultry': { src: freshChickenImage, position: '50% 48%' },
  eggs: { src: eggsImage, position: '50% 50%' },
  processed: { src: freshChickenImage, position: '50% 48%' },
  'farm-supplies': { src: poultryChicksImage, position: '50% 67%' },
};

function CategoryArtwork({
  category,
  icon,
  compact = false,
}: {
  category: MainCategory | 'all';
  icon?: React.ReactNode;
  compact?: boolean;
}) {
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
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        style={{ objectPosition: artwork.position }}
      />
      {icon && (
        <span className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-emerald-950 shadow-sm [&>svg]:h-3 [&>svg]:w-3">
          {icon}
        </span>
      )}
    </span>
  );
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'signin' | 'register') => void;
  onSignOut: () => void;
  buyerType: BuyerType;
  setBuyerType: (type: BuyerType) => void;
  selectedCategory: MainCategory | 'all';
  setSelectedCategory: (category: MainCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  onOpenTraceability,
  onOpenClaims,
  onOpenAdmin,
  onOpenBusinessPlan
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const brand = useBrandLogo();

  const isAdmin = Boolean(
    currentUser?.customClaims?.admin === true || currentUser?.customClaims?.role === 'ADMIN'
  );

  const categoriesList: { id: MainCategory | 'all'; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'all', label: 'All Products', icon: <ShoppingBag />, description: 'Chicken and eggs' },
    { id: 'live-birds', label: 'Live Chicken', icon: <Feather />, description: 'Chicks and mature chicken' },
    { id: 'fresh-poultry', label: 'Fresh Chicken', icon: <Utensils />, description: 'Whole chicken and cuts' },
    { id: 'eggs', label: 'Eggs', icon: <Egg />, description: 'Fresh eggs by the tray' },
  ];
  const visibleCategories = categoriesList.filter(
    category => buyerType !== 'wholesale' || category.id !== 'fresh-poultry'
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-[#fffdfa]/95 text-[#173b2a] shadow-[0_10px_35px_rgba(18,53,36,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:gap-5 lg:px-8">
        <button
          type="button"
          onClick={() => {
            setActiveTab('shop');
            setSelectedCategory('all');
            setSearchQuery('');
          }}
          className="group flex h-12 shrink-0 items-center rounded-2xl bg-[#123524] px-2.5 shadow-[0_6px_18px_rgba(18,53,36,0.18)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 sm:h-14 sm:px-3"
          aria-label="Go to all products"
        >
          {brand.logoImageUrl ? (
            <span className="flex items-center gap-2.5">
              <img
                src={brand.logoImageUrl}
                alt={brand.brandName || 'ChickMagnet'}
                className="h-9 w-auto max-w-[112px] object-contain transition-transform group-hover:scale-[1.03] sm:h-11 sm:max-w-[176px]"
              />
              {brand.logoDisplayMode === 'image_with_text' && (
                <span className="hidden text-lg font-extrabold tracking-[-0.03em] text-amber-300 xl:inline">
                  {brand.brandName || 'ChickMagnet'}
                </span>
              )}
            </span>
          ) : (
            <span className="px-1 text-lg font-extrabold tracking-[-0.03em] text-amber-300 sm:text-xl">
              {brand.brandName || 'ChickMagnet'}
            </span>
          )}
        </button>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex" aria-label="Product categories">
          {visibleCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (activeTab !== 'shop') setActiveTab('shop');
                }}
                className={`group flex min-w-0 items-center gap-2.5 rounded-[1.35rem] border px-2.5 py-2 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-900 bg-emerald-950 text-white shadow-[0_8px_18px_rgba(6,46,31,0.2)]'
                    : 'border-transparent bg-white text-[#173b2a] hover:border-stone-200 hover:bg-[#fff8e8] hover:shadow-sm'
                }`}
              >
                <CategoryArtwork category={cat.id} icon={cat.icon} />
                <span className="min-w-0 pr-1">
                  <span className="block whitespace-nowrap text-[13px] font-bold tracking-[-0.01em]">{cat.label}</span>
                  <span className={`hidden whitespace-nowrap text-[10px] xl:block ${isSelected ? 'text-emerald-100/75' : 'text-stone-500'}`}>
                    {cat.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-2 shadow-sm transition-all hover:border-stone-300 hover:shadow-md sm:pr-3"
                aria-expanded={profileOpen}
                aria-label="Open account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 text-sm font-extrabold text-amber-300">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </span>
                <span className="hidden max-w-[120px] truncate text-xs font-bold md:inline">
                  {currentUser.name} {isAdmin && '(Admin)'}
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-stone-500 sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-32px)] rounded-2xl border border-stone-200 bg-white p-3 text-xs text-[#173b2a] shadow-[0_18px_50px_rgba(18,53,36,0.18)]"
                  >
                    <div className="mb-2 border-b border-stone-100 px-2 pb-3">
                      <div className="font-bold">{currentUser.name} {isAdmin && '(Admin)'}</div>
                      <div className="truncate pt-0.5 text-[11px] text-stone-500">{currentUser.email}</div>
                      <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800">
                        {buyerType === 'retail' ? 'Retail' : buyerType === 'wholesale' ? 'Commercial wholesale' : 'Farmer'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left font-semibold hover:bg-emerald-50"
                    >
                      <UserIcon className="h-4 w-4 text-emerald-800" />
                      <span>My Account & Orders</span>
                    </button>

                    {onOpenAdmin && isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAdmin();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left font-semibold hover:bg-amber-50"
                      >
                        <LayoutDashboard className="h-4 w-4 text-amber-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {onOpenBusinessPlan && isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenBusinessPlan();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left font-semibold hover:bg-emerald-50"
                      >
                        <FileText className="h-4 w-4 text-emerald-800" />
                        <span>Farm Plan</span>
                      </button>
                    )}

                    <div className="mt-2 border-t border-stone-100 pt-2">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              aria-label="Sign in"
              className="flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 text-xs font-bold text-[#173b2a] shadow-sm transition-all hover:border-stone-300 hover:shadow-md"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {onOpenAdmin && isAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden h-11 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100 xl:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin</span>
            </button>
          )}

          {onOpenBusinessPlan && isAdmin && (
            <button
              type="button"
              onClick={onOpenBusinessPlan}
              className="hidden h-11 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-900 transition-colors hover:bg-emerald-100 2xl:flex"
            >
              <FileText className="h-4 w-4" />
              <span>Farm Plan</span>
            </button>
          )}

          <button
            id="header-cart-button"
            type="button"
            onClick={onOpenCart}
            className="relative flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 text-xs font-extrabold text-emerald-950 shadow-[0_6px_16px_rgba(245,158,11,0.25)] transition-all hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400 sm:px-4"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald-950 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-300">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-3 lg:hidden" aria-label="Product categories">
        {visibleCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (activeTab !== 'shop') setActiveTab('shop');
              }}
              className={`group flex shrink-0 items-center gap-2 rounded-2xl border px-2 py-1.5 text-xs font-bold transition-all ${
                isSelected
                  ? 'border-emerald-950 bg-emerald-950 text-white shadow-sm'
                  : 'border-stone-200 bg-white text-[#173b2a]'
              }`}
            >
              <CategoryArtwork category={cat.id} icon={cat.icon} compact />
              <span className="pr-1 whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-stone-100 px-4 pb-3 pt-2 sm:px-6 lg:px-8 lg:pb-4">
        <div className="relative mx-auto max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-800" />
          <label htmlFor="storefront-search" className="sr-only">Search products</label>
          <input
            id="storefront-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              if (activeTab !== 'shop') setActiveTab('shop');
            }}
            placeholder="Search chicken or eggs"
            className="h-12 w-full rounded-full border border-stone-200 bg-white pl-12 pr-24 text-sm font-semibold text-[#173b2a] shadow-[0_5px_18px_rgba(18,53,36,0.1)] outline-none transition-all placeholder:font-medium placeholder:text-stone-400 hover:border-stone-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 sm:h-14 sm:text-base"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-950 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900"
            >
              Clear
            </button>
          ) : (
            <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-xs font-bold text-stone-500 sm:block">
              Chicken & eggs
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
