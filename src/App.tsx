import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_PRODUCTS, MOCK_BATCH_TRACE_RECORDS } from './data/products';
import { Product, CartItem, BuyerType, MainCategory, User } from './types';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartDrawer from './components/CartDrawer';
import CheckoutRitual from './components/CheckoutRitual';
import BatchTraceabilityPortal from './components/BatchTraceabilityPortal';
import WholesalePortal from './components/WholesalePortal';
import MortalityClaimRitual from './components/MortalityClaimRitual';
import CongratsModal from './components/CongratsModal';
import AboutLore from './components/AboutLore';
import AuthModal from './components/AuthModal';
import ChatbotHelp from './components/ChatbotHelp';
import Footer from './components/Footer';
import AccountDashboard from './components/AccountDashboard';
import AdminDashboard from './components/AdminDashboard';
import BusinessPlanHub from './components/BusinessPlanHub';
import heroChickenImage from './assets/images/hero_poultry_chicks_1785408878635.jpg';
import { ShieldCheck, Activity, Truck, Sparkles, HelpCircle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  subscribeProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeOrders,
  saveOrderToFirestore
} from './services/firestoreSync';

export default function App() {
  const [activeTab, setActiveTab] = useState<'shop' | 'about' | 'profile'>('shop');
  const [buyerType, setBuyerType] = useState<BuyerType>('retail');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected product modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('chickmagnet_products');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed: Product[] = JSON.parse(saved);
      // Ensure product images match the updated high-accuracy image URLs from INITIAL_PRODUCTS
      return parsed.map(p => {
        const initialMatch = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
        if (initialMatch) {
          return { ...p, image: initialMatch.image };
        }
        return p;
      });
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Admin Dashboard Mode
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isBusinessPlanOpen, setIsBusinessPlanOpen] = useState<boolean>(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chickmagnet_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Checkout ritual state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedOrderSummary, setCompletedOrderSummary] = useState<any>(null);

  // Portals & Modals
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState<boolean>(false);
  const [traceBatchId, setTraceBatchId] = useState<string>('BATCH-2026-CHX9');
  const [isWholesaleOpen, setIsWholesaleOpen] = useState<boolean>(false);
  const [isClaimsOpen, setIsClaimsOpen] = useState<boolean>(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('chickmagnet_user');
    return saved ? JSON.parse(saved) : {
      name: 'Agina',
      email: 'uxagina@gmail.com',
      role: 'BUYER',
      buyerType: 'retail'
    };
  });

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('chickmagnet_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Real-time Firestore sync for Products and Orders
  useEffect(() => {
    const unsubProducts = subscribeProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });
    const unsubOrders = subscribeOrders((updatedOrders) => {
      setUserOrders(updatedOrders);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  // Handle Cart Operations
  const handleAddToCart = (product: Product, quantity: number = 1, selectedSex?: 'male' | 'female' | 'unsexed') => {
    const fulfillmentGroup = product.category === 'live-birds' 
      ? 'live-climate' 
      : product.category === 'fresh-poultry' 
      ? 'chilled-express' 
      : product.category === 'processed' 
      ? 'frozen-deep' 
      : 'dry-ambient';

    const existingIndex = cartItems.findIndex(i => i.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { product, quantity, fulfillmentGroup, selectedSex }]);
    }

    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(i => i.product.id !== productId));
    } else {
      setCartItems(cartItems.map(i => i.product.id === productId ? { ...i, quantity } : i));
    }
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(cartItems.filter(i => i.product.id !== productId));
  };

  const handleOpenTraceabilityWithBatch = (batchId: string) => {
    setTraceBatchId(batchId);
    setIsTraceabilityOpen(true);
  };

  const [userOrders, setUserOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('chickmagnet_user_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const handleOrderCompleted = (summary: any) => {
    setCompletedOrderSummary(summary);
    setCartItems([]);
    setIsCheckoutOpen(false);

    const firstSlot = summary.deliverySlots ? (Object.values(summary.deliverySlots)[0] as string) : 'Scheduled Dispatch Slot';
    const newOrderRecord = {
      id: summary.orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: summary.items.map((i: any) => `${i.quantity}x ${i.product.name}`).join(', '),
      status: 'Confirmed & Scheduled',
      statusColor: 'bg-emerald-500/20 text-emerald-800 border-emerald-500/40',
      total: summary.grandTotal,
      batchId: summary.batchIds?.[0] || 'BATCH-2026-CHX9',
      fulfillment: summary.items?.[0]?.fulfillmentGroup === 'live-climate' ? 'Live Express Transport' : 'Express Delivery',
      eta: firstSlot,
      deliverySlots: summary.deliverySlots
    };

    saveOrderToFirestore(newOrderRecord);
  };

  // Product CRUD Handlers (Writing to Firestore)
  const handleUpdateProduct = (updatedProduct: Product) => {
    saveProductToFirestore(updatedProduct);
  };

  const handleAddProduct = (newProduct: Product) => {
    saveProductToFirestore(newProduct);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProductFromFirestore(productId);
  };

  // Filter Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by buyer mode if applicable
    let matchesBuyerType = true;
    if (buyerType === 'farmer') {
      matchesBuyerType = p.category === 'live-birds' || p.category === 'farm-supplies' || p.category === 'eggs';
    } else if (buyerType === 'retail') {
      matchesBuyerType = p.category !== 'farm-supplies' || p.price < 5000;
    }

    return matchesCategory && matchesSearch && matchesBuyerType;
  });

  // If Admin Dashboard mode is active, render full-screen Admin View
  if (isAdminOpen) {
    return (
      <AdminDashboard
        products={products}
        onUpdateProduct={handleUpdateProduct}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        userOrders={userOrders}
        onOpenStorefrontPreview={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        onCloseAdmin={() => setIsAdminOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-emerald-950 font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-emerald-950">
      
      {/* Sticky Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onSignOut={() => {
          setCurrentUser(null);
          localStorage.removeItem('chickmagnet_user');
        }}
        buyerType={buyerType}
        setBuyerType={setBuyerType}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenTraceability={() => setIsTraceabilityOpen(true)}
        onOpenWholesale={() => setIsWholesaleOpen(true)}
        onOpenClaims={() => setIsClaimsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenBusinessPlan={() => setIsBusinessPlanOpen(true)}
      />

      {/* Admin Dashboard Command Overlay View */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
          <AdminDashboard
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            userOrders={userOrders}
            onUpdateOrderStatus={(orderId, newStatus) => {
              const updated = userOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
              setUserOrders(updated);
              localStorage.setItem('chickmagnet_user_orders', JSON.stringify(updated));
              window.dispatchEvent(new Event('chickmagnet_user_orders_updated'));
            }}
            onOpenStorefrontPreview={() => setIsAdminOpen(false)}
            currentUser={currentUser}
            onCloseAdmin={() => setIsAdminOpen(false)}
          />
        </div>
      )}

      {/* Business Plan Command Hub Overlay View */}
      {isBusinessPlanOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
          <BusinessPlanHub onClose={() => setIsBusinessPlanOpen(false)} />
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        
        {/* CHECKOUT RITUAL SCREEN */}
        {isCheckoutOpen ? (
          <CheckoutRitual
            cartItems={cartItems}
            buyerType={buyerType}
            onOrderCompleted={handleOrderCompleted}
            onCancel={() => setIsCheckoutOpen(false)}
          />
        ) : activeTab === 'about' ? (
          <AboutLore />
        ) : activeTab === 'profile' ? (
          <AccountDashboard
            currentUser={currentUser}
            buyerType={buyerType}
            userOrders={userOrders}
            onOpenTraceability={(batchId) => {
              handleOpenTraceabilityWithBatch(batchId || 'BATCH-2026-CHX9');
            }}
            onOpenWholesale={() => setIsWholesaleOpen(true)}
            onOpenClaims={() => setIsClaimsOpen(true)}
            onNavigateToShop={() => setActiveTab('shop')}
          />
        ) : (
          /* MARKETPLACE SHOP VIEW */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
            
            {/* Clean Hero Value Banner (Only shown in 'all' catalog category) */}
            {selectedCategory === 'all' && (
              <div className="bg-gradient-to-br from-[#123524] via-[#0b2217] to-[#17442f] text-amber-50 rounded-3xl p-6 sm:p-10 lg:p-12 border border-emerald-800/80 shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  
                  {/* Left Column: Headline, Copy, CTA & Trust Badges */}
                  <div className="lg:col-span-7 space-y-5">
                    
                    {/* Single Primary Headline */}
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-amber-300 tracking-tight leading-tight">
                      Your Favorite Marketplace for Premium Poultry & Hatchery Supplies
                    </h1>

                    {/* Single Primary CTA */}
                    <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <button
                        onClick={() => {
                          const el = document.getElementById('catalog-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg hover:shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Explore Verified Catalog</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Embedded Sticker Image */}
                  <div className="lg:col-span-5 block">
                    <div className="relative group max-w-md mx-auto lg:max-w-none">
                      <div className="p-2 sm:p-2.5 bg-[#0b2217]/60 backdrop-blur-md rounded-3xl border-2 border-amber-400/40 shadow-2xl hover:border-amber-400/70 transition-all duration-300 transform sm:-rotate-1 hover:rotate-0">
                        <div className="relative rounded-2xl overflow-hidden">
                          <img
                            src={heroChickenImage}
                            alt="Verified Golden Chicks and Heritage Poultry Stock"
                            referrerPolicy="no-referrer"
                            className="w-full h-52 sm:h-60 lg:h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0b2217]/85 via-transparent to-transparent flex items-end p-3">
                            <div className="bg-amber-400 text-emerald-950 px-3 py-1 rounded-full text-[11px] font-extrabold font-mono shadow-md flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse"></span>
                              <span>100% NPIP Bio-Secure Verified Stock</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Below-The-Fold Intent Split & Feature Trust Bar */}
            <div id="catalog-section" className="scroll-mt-6 space-y-6">
              
              {/* Intent Split Selector */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  <div className="bg-slate-100 p-1 rounded-xl flex w-full sm:w-auto">
                    <button
                      onClick={() => setBuyerType('retail')}
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        buyerType === 'retail'
                          ? 'bg-emerald-950 text-amber-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Retail & Homesteaders</span>
                    </button>
                    <button
                      onClick={() => setBuyerType('wholesale')}
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        buyerType === 'wholesale'
                          ? 'bg-emerald-950 text-amber-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Commercial Wholesale (Net-30)</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Wholesale Portal Access when Commercial Wholesale intent is selected */}
                {buyerType === 'wholesale' && (
                  <button
                    onClick={() => setIsWholesaleOpen(true)}
                    className="text-emerald-950 hover:text-emerald-900 font-bold text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer self-end sm:self-auto"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Open Wholesale Portal</span>
                  </button>
                )}
              </div>

              {/* Catalog Header & Count */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 pt-2">
                <div>
                  <h2 className="font-serif font-black text-2xl text-emerald-950">
                    {selectedCategory === 'all' ? 'All Poultry & Farm Listings' : selectedCategory.toUpperCase()}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="bg-amber-500 text-emerald-950 px-2.5 py-1 rounded-lg font-bold uppercase">
                    {buyerType}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  buyerType={buyerType}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onOpenTraceabilityWithBatch={handleOpenTraceabilityWithBatch}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
                <div className="text-4xl">🐣</div>
                <h3 className="font-serif font-bold text-lg text-emerald-950">No products match your filter</h3>
                <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
                  Try clearing your search query or switching categories in the navigation header.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="bg-emerald-900 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold font-mono"
                >
                  Reset Catalog Filters
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer 
        onNavigate={(tab, sectionId) => {
          if (tab === 'shop' || tab === 'about' || tab === 'profile') {
            setActiveTab(tab as any);
            if (sectionId) {
              setTimeout(() => {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          }
        }} 
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          buyerType={buyerType}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p, qty, sex) => handleAddToCart(p, qty, sex)}
          onOpenTraceabilityWithBatch={handleOpenTraceabilityWithBatch}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Batch Traceability Portal */}
      <BatchTraceabilityPortal
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
        initialBatchId={traceBatchId}
      />

      {/* Wholesale & Standing Orders Portal */}
      <WholesalePortal
        isOpen={isWholesaleOpen}
        onClose={() => setIsWholesaleOpen(false)}
      />

      {/* 24h Mortality Claim Ritual */}
      <MortalityClaimRitual
        isOpen={isClaimsOpen}
        onClose={() => setIsClaimsOpen(false)}
      />

      {/* Congrats Order Confirmation Modal */}
      <CongratsModal
        orderSummary={completedOrderSummary}
        onClose={() => setCompletedOrderSummary(null)}
        onOpenTraceability={handleOpenTraceabilityWithBatch}
        onOpenClaims={() => setIsClaimsOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('chickmagnet_user', JSON.stringify(user));
          setAuthModalOpen(false);
        }}
      />

      {/* Floating Chatbot & Hatchery Support Assistant */}
      <ChatbotHelp
        onOpenClaims={() => setIsClaimsOpen(true)}
        onOpenTraceability={(batchId) => handleOpenTraceabilityWithBatch(batchId || 'BATCH-2026-CHX9')}
        onOpenWholesale={() => setIsWholesaleOpen(true)}
      />

    </div>
  );
}
