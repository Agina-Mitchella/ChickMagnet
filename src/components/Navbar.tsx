import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, User as UserIcon, LogIn, ChevronDown, Feather, Utensils, Package, Egg, Layers, HelpCircle, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, BuyerType, MainCategory } from '../types';

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
  onOpenClaims
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const categoriesList: { id: MainCategory | 'all'; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'all', label: 'All Catalog', icon: <ShoppingBag className="w-4 h-4" />, description: 'Browse all poultry, eggs & farm inputs' },
    { id: 'live-birds', label: 'Live Birds', icon: <Feather className="w-4 h-4" />, description: 'Day-old chicks, pullets & roosters' },
    { id: 'fresh-poultry', label: 'Fresh & Whole Poultry', icon: <Utensils className="w-4 h-4" />, description: 'Dressed whole birds & fresh cuts' },
    { id: 'processed', label: 'Processed & Value-Added', icon: <Package className="w-4 h-4" />, description: 'Marinated wings, sausages & meals' },
    { id: 'eggs', label: 'Eggs', icon: <Egg className="w-4 h-4" />, description: 'Table eggs & hatching eggs' },
    { id: 'farm-supplies', label: 'Farm Supplies', icon: <Layers className="w-4 h-4" />, description: 'Feed, vaccines & incubators' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#123524] text-amber-50 shadow-md">
      
      {/* Main Header Bar (Row 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Logo & Brand Name */}
        <div 
          onClick={() => {
            setActiveTab('shop');
            setSelectedCategory('all');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0 select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
            🐔
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl font-black text-amber-400 tracking-tight leading-none">
                ChickMagnet
              </span>
            </div>
            <p className="text-[10px] text-emerald-300/90 font-mono tracking-wider uppercase mt-0.5 font-medium">
              Poultry & Hatchery Marketplace
            </p>
          </div>
        </div>

        {/* Search Bar - Shortened placeholder & widened container so text never truncates */}
        <div className="flex-1 max-w-xl hidden sm:block relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search breeds, fresh cuts, hatching eggs..."
              className="w-full pl-10 pr-4 py-2 bg-[#0b2217] border border-emerald-800/80 rounded-xl text-xs text-amber-50 placeholder-emerald-400/70 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-amber-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* User Account Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-[#0b2217] border border-emerald-800/80 px-3 py-1.5 rounded-xl hover:border-amber-400/60 transition-colors text-xs font-bold text-amber-300 cursor-pointer"
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
                    className="absolute right-0 mt-2 w-64 bg-[#0b2217] border border-emerald-800 rounded-xl shadow-xl z-50 p-3 text-xs text-emerald-100"
                  >
                    <div className="pb-2 mb-2 border-b border-emerald-800">
                      <div className="font-bold text-amber-300">{currentUser.name}</div>
                      <div className="text-[11px] text-emerald-400 truncate">{currentUser.email}</div>
                      <div className="mt-1 text-[10px] uppercase font-mono bg-emerald-900/60 text-amber-300 px-2 py-0.5 rounded inline-block font-bold">
                        Account: {currentUser.buyerType || buyerType}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left py-1.5 px-2 hover:bg-emerald-900/40 rounded flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>My Account & Orders</span>
                    </button>
                    
                    {/* Conditional: Only show Wholesale Portal to logged-in wholesale/commercial accounts */}
                    {(currentUser.buyerType === 'wholesale' || buyerType === 'wholesale') && (
                      <button
                        onClick={() => {
                          onOpenWholesale();
                          setProfileOpen(false);
                        }}
                        className="w-full text-left py-1.5 px-2 hover:bg-emerald-900/40 rounded flex items-center gap-2 font-medium cursor-pointer"
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
                        className="w-full text-left py-1.5 px-2 text-rose-300 hover:bg-rose-950/40 rounded font-medium cursor-pointer"
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
              className="flex items-center gap-1.5 bg-[#0b2217] border border-emerald-800/80 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:border-amber-400/80 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-transform hover:scale-102 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
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
