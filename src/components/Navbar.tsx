import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, User as UserIcon, LogIn, ChevronDown, Feather, Utensils, Package, Egg, Layers, HelpCircle, FileText, Activity, LayoutDashboard, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, BuyerType, MainCategory } from '../types';
import { useBrandLogo } from '../utils/cms';
import { INITIAL_BREED_DROPDOWN_OPTIONS } from '../data/products';

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
  onOpenWholesale: () => void;
  onOpenClaims: () => void;
  onOpenAdmin?: () => void;
  onOpenBusinessPlan?: () => void;
  selectedBreedFilter?: string;
  setSelectedBreedFilter?: (breed: string) => void;
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
  onOpenWholesale,
  onOpenClaims,
  onOpenAdmin,
  onOpenBusinessPlan,
  selectedBreedFilter = 'all',
  setSelectedBreedFilter
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);
  const brand = useBrandLogo();

  const isAdmin = currentUser?.role === 'ADMIN' || 
                  currentUser?.email?.toLowerCase() === 'uxagina@gmail.com' || 
                  currentUser?.email?.toLowerCase().includes('admin') ||
                  currentUser?.email?.toLowerCase() === 'manyaos7@gmail.com';

  const categoriesList: { id: MainCategory | 'all'; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'all', label: 'All Catalog', icon: <ShoppingBag className="w-4 h-4" />, description: 'Browse all live birds, fresh poultry, eggs & farm supplies' },
    { id: 'live-birds', label: 'Live Birds', icon: <Feather className="w-4 h-4" />, description: 'Day-old chicks, pullets & roosters' },
    { id: 'fresh-poultry', label: 'Fresh & Whole Poultry', icon: <Utensils className="w-4 h-4" />, description: 'Dressed whole birds & fresh cuts' },
    { id: 'eggs', label: 'Eggs', icon: <Egg className="w-4 h-4" />, description: 'Table eggs & hatching eggs' },
    { id: 'farm-supplies', label: 'Farm Supplies', icon: <Layers className="w-4 h-4" />, description: 'Feed, vaccines & equipment' }
  ];

  const handleSelectBreedOption = (optionValue: string, optionCategory?: string) => {
    if (setSelectedBreedFilter) {
      setSelectedBreedFilter(optionValue);
    }
    if (optionValue === 'all') {
      setSearchQuery('');
      if (optionCategory && optionCategory !== 'all') {
        setSelectedCategory(optionCategory as MainCategory);
      }
    } else {
      // Set breed filter and sync search query for matching
      setSearchQuery(optionValue);
      if (optionCategory && optionCategory !== 'all') {
        setSelectedCategory(optionCategory as MainCategory);
      }
    }
    if (activeTab !== 'shop') {
      setActiveTab('shop');
    }
    setIsBreedDropdownOpen(false);
  };

  const currentSelectedBreedLabel = INITIAL_BREED_DROPDOWN_OPTIONS.find(
    o => (o.breedQuery === selectedBreedFilter) || (!o.breedQuery && selectedBreedFilter === 'all') || (searchQuery && o.breedQuery && o.breedQuery.toLowerCase().includes(searchQuery.toLowerCase()))
  )?.label || 'Browse Heritage Breeds & Categories';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#123524] text-amber-50 shadow-md">
      
      {/* Main Header Bar (Row 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Logo & Brand Name (Location removed as requested) */}
        <div 
          onClick={() => {
            setActiveTab('shop');
            setSelectedCategory('all');
            setSearchQuery('');
            if (setSelectedBreedFilter) setSelectedBreedFilter('all');
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 select-none"
        >
          {brand.logoImageUrl ? (
            <div className="flex items-center gap-3">
              <img 
                src={brand.logoImageUrl} 
                alt={brand.brandName || 'Logo'} 
                style={{ height: '48px', width: 'auto', maxWidth: '280px', objectFit: 'contain' }}
                className="h-10 sm:h-12 max-w-[220px] sm:max-w-[280px] w-auto object-contain shrink-0 group-hover:scale-105 transition-transform drop-shadow-md" 
              />
              {brand.logoDisplayMode === 'image_with_text' && (
                <span className="font-serif text-xl sm:text-2xl font-black text-amber-400 tracking-tight leading-none">
                  {brand.brandName || 'ChickMagnet'}
                </span>
              )}
            </div>
          ) : (
            <div>
              <span className="font-serif text-xl sm:text-2xl font-black text-amber-400 tracking-tight leading-none">
                {brand.brandName || 'ChickMagnet'}
              </span>
            </div>
          )}
        </div>

        {/* BREED DROPDOWN SELECTOR (Replaces Search Bar) */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative">
            <button
              id="breed-dropdown-trigger"
              type="button"
              onClick={() => setIsBreedDropdownOpen(!isBreedDropdownOpen)}
              className="w-full flex items-center justify-between pl-4 pr-3.5 py-2.5 bg-[#0b2217] border border-emerald-700/80 hover:border-amber-400/80 rounded-xl text-xs text-amber-50 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span className="font-bold text-amber-300 font-mono uppercase tracking-wider text-[10px] shrink-0">Select Breed:</span>
                <span className="truncate text-slate-100 font-medium">{currentSelectedBreedLabel}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform shrink-0 ml-2 ${isBreedDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isBreedDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 mt-2 bg-[#0b2217] border-2 border-emerald-700 rounded-2xl shadow-2xl z-50 p-2 text-xs text-emerald-100 max-h-80 overflow-y-auto"
                >
                  <div className="px-2 py-1.5 text-[10px] font-mono uppercase text-emerald-400 font-bold border-b border-emerald-900 flex items-center justify-between">
                    <span>Verified Breeds & Categories</span>
                    <span>Hatchery Verified</span>
                  </div>

                  <div className="pt-1.5 space-y-1">
                    {INITIAL_BREED_DROPDOWN_OPTIONS.map((opt) => {
                      const optionVal = opt.breedQuery || 'all';
                      const isSelected = selectedBreedFilter === optionVal || (!selectedBreedFilter && optionVal === 'all');
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectBreedOption(optionVal, opt.category)}
                          className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-400 text-emerald-950 font-black shadow-xs' 
                              : 'hover:bg-emerald-900/60 text-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm">
                              {opt.category === 'live-birds' ? '🐥' : opt.category === 'fresh-poultry' ? '🍗' : opt.category === 'eggs' ? '🥚' : opt.category === 'farm-supplies' ? '📦' : '🌟'}
                            </span>
                            <div>
                              <div className="font-bold">{opt.label}</div>
                              {opt.description && (
                                <div className={`text-[10px] ${isSelected ? 'text-emerald-900 font-medium' : 'text-emerald-300/80 font-normal'}`}>
                                  {opt.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {opt.category !== 'all' && (
                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-emerald-950 text-amber-300' : 'bg-emerald-800 text-amber-300'
                            }`}>
                              {opt.category}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* User Account Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#0b2217] border border-emerald-800/80 px-2.5 sm:px-3 py-2 rounded-xl hover:border-amber-400/60 transition-colors text-xs font-bold text-amber-300 cursor-pointer min-h-[40px]"
              >
                <span className="w-6 h-6 rounded-full bg-amber-500 text-emerald-950 flex items-center justify-center font-mono text-xs font-black">
                  {currentUser.name.charAt(0)}
                </span>
                <span className="hidden md:inline max-w-[140px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-64 bg-[#0b2217] border border-emerald-800 rounded-xl shadow-xl z-50 p-3 text-xs text-emerald-100 max-w-[calc(100vw-32px)]"
                  >
                    <div className="pb-2 mb-2 border-b border-emerald-800">
                      <div className="font-bold text-amber-300">{currentUser.name}</div>
                      <div className="text-[11px] text-emerald-400 truncate">{currentUser.email}</div>
                      <div className="mt-1 text-[10px] uppercase font-mono bg-emerald-900/60 text-amber-300 px-2 py-0.5 rounded inline-block font-bold">
                        Account: {buyerType === 'retail' ? 'Homesteader' : buyerType === 'wholesale' ? 'Commercial Wholesale' : 'Farmer'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left py-2 px-2 hover:bg-emerald-900/40 rounded flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>My Account & Orders</span>
                    </button>
                    
                    {onOpenAdmin && isAdmin && (
                      <button
                        onClick={() => {
                          onOpenAdmin();
                          setProfileOpen(false);
                        }}
                        className="w-full text-left py-2 px-2 hover:bg-amber-500/20 text-amber-300 font-bold rounded flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Dashboard Control</span>
                      </button>
                    )}

                    {(currentUser.buyerType === 'wholesale' || buyerType === 'wholesale') && (
                      <button
                        onClick={() => {
                          onOpenWholesale();
                          setProfileOpen(false);
                        }}
                        className="w-full text-left py-2 px-2 hover:bg-emerald-900/40 rounded flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Wholesale Standing Orders</span>
                      </button>
                    )}

                    <div className="pt-2 mt-2 border-t border-emerald-800">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left py-2 px-2 text-rose-300 hover:bg-rose-950/40 rounded font-medium cursor-pointer"
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
              onClick={() => onOpenAuth('signin')}
              className="flex items-center gap-1.5 bg-[#0b2217] border border-emerald-800/80 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:border-amber-400/80 transition-all cursor-pointer min-h-[40px]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Admin Dashboard Quick Button */}
          {onOpenAdmin && isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 bg-[#0b2217] hover:bg-emerald-900/60 border border-amber-500/50 text-amber-300 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px]"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Farm Business Plan Quick Button */}
          {onOpenBusinessPlan && isAdmin && (
            <button
              onClick={onOpenBusinessPlan}
              className="flex items-center gap-1.5 bg-[#0b2217] hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px]"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Farm Plan</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            id="header-cart-button"
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-transform hover:scale-102 cursor-pointer min-h-[40px]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-emerald-950 text-amber-300 text-[11px] font-mono px-1.5 py-0.5 rounded-full font-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Dropdown Navigation Bar (Row 2) */}
      <div className="bg-[#0b2217] border-t border-emerald-900/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-1 text-xs">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (activeTab !== 'shop') setActiveTab('shop');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60 font-medium'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
