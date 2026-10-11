import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_BATCH_TRACE_RECORDS } from './data/products';
import { STOREFRONT_PRODUCTS } from './data/storefrontCatalog';
import { Product, CartItem, BuyerType, MainCategory, User } from './types';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartDrawer from './components/CartDrawer';
import CheckoutRitual from './components/CheckoutRitual';
import BatchTraceabilityPortal from './components/BatchTraceabilityPortal';
import MortalityClaimRitual from './components/MortalityClaimRitual';
import CongratsModal from './components/CongratsModal';
import AboutLore from './components/AboutLore';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import AccountDashboard from './components/AccountDashboard';
import AdminDashboard from './components/AdminDashboard';
import BusinessPlanHub from './components/BusinessPlanHub';
import heroChickenImage from './assets/images/hero_poultry_chicks_1785408878635.jpg';
import { ArrowRight } from 'lucide-react';
import {
  subscribeProducts,
  filterCachedStorefrontProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeUserOrders,
  saveOrderToFirestore,
  subscribeCMSBlocks
} from './services/firestoreSync';
import { getFirebaseAuthorization, logoutUser, subscribeAuthUser } from './config/firebase';
import {
  applyStorefrontCopy,
  isCurrentStorefrontProduct,
  isProductAvailableForBuyer,
  productMatchesSearch,
} from './utils/storefrontProducts';

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
    let rawProducts = STOREFRONT_PRODUCTS;
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        const visibleCachedProducts = filterCachedStorefrontProducts(parsed);
        if (visibleCachedProducts.length > 0) rawProducts = visibleCachedProducts;
      } catch {
        rawProducts = STOREFRONT_PRODUCTS;
      }
    }
    const validCategories = ['live-birds', 'fresh-poultry', 'eggs'];
    const initialMap = new Map(STOREFRONT_PRODUCTS.map(ip => [ip.id, ip]));
    return rawProducts
      .filter(p => validCategories.includes(p.category) && isCurrentStorefrontProduct(p))
      .map(p => {
        const initP = initialMap.get(p.id);
        return {
          ...p,
          image: initP?.image || p.image,
          description: initP?.description || p.description,
          tags: initP?.tags || p.tags,
          variantsConfig: initP?.variantsConfig || p.variantsConfig,
          badge: initP?.badge || p.badge,
          salesChannels: initP?.salesChannels || p.salesChannels,
          searchTerms: initP?.searchTerms || p.searchTerms,
          displayOrder: initP?.displayOrder ?? p.displayOrder,
          imagePosition: initP?.imagePosition || p.imagePosition,
        };
      });
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
  const [isClaimsOpen, setIsClaimsOpen] = useState<boolean>(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [resumeCheckoutAfterAuth, setResumeCheckoutAfterAuth] = useState(false);
  // Default to null until Firebase Auth initializes
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const isCurrentUserAdmin = Boolean(
    currentUser?.customClaims?.admin === true || currentUser?.customClaims?.role === 'ADMIN'
  );

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('chickmagnet_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Real-time Firebase Auth session and profile sync
  useEffect(() => {
    const unsubAuth = subscribeAuthUser(async (firebaseUser, profileData) => {
      if (firebaseUser) {
        let customClaims: any = {};
        let isAdmin = false;
        try {
          const authorization = await getFirebaseAuthorization(firebaseUser);
          customClaims = authorization.claims;
          isAdmin = authorization.isAdmin;
        } catch (e) {
          console.warn('Could not read id token result:', e);
        }

        const userEmail = firebaseUser.email || '';

        const userObj: User = {
          uid: firebaseUser.uid,
          email: userEmail,
          name: profileData?.displayName || firebaseUser.displayName || userEmail.split('@')[0] || 'Poultry Member',
          role: isAdmin ? 'ADMIN' : 'BUYER',
          buyerType: profileData?.buyerType === 'wholesale' ? 'wholesale' : 'retail',
          avatarEmoji: profileData?.avatarEmoji || (isAdmin ? '👑' : '🐣'),
          photoURL: firebaseUser.photoURL || undefined,
          customClaims: customClaims
        };
        setCurrentUser(userObj);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // Public products and CMS content are independent of the signed-in account.
  useEffect(() => {
    const unsubProducts = subscribeProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });
    const unsubCMS = subscribeCMSBlocks();

    return () => {
      unsubProducts();
      unsubCMS();
    };
  }, []);

  // Handle Cart Operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
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
      setCartItems([...cartItems, { product, quantity, fulfillmentGroup }]);
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

  const [userOrders, setUserOrders] = useState<any[]>([]);

  // A buyer only subscribes to documents whose buyerId matches their Firebase UID.
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserOrders([]);
      return;
    }

    return subscribeUserOrders(currentUser.uid, setUserOrders);
  }, [currentUser?.uid]);

  const handleOrderCompleted = async (summary: any) => {
    const firstSlot = summary.deliverySlots ? (Object.values(summary.deliverySlots)[0] as string) : 'Scheduled Dispatch Slot';
    const newOrderRecord = {
      id: summary.orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: summary.items.map((i: any) => `${i.quantity}x ${i.product.name}`).join(', '),
      itemCount: summary.items.reduce((count: number, item: any) => count + Number(item.quantity || 0), 0),
      status: 'Payment confirmation pending',
      statusColor: 'bg-amber-500/20 text-amber-900 border-amber-500/40',
      total: summary.grandTotal,
      batchId: summary.batchIds?.[0] || '',
      fulfillment: summary.items?.[0]?.fulfillmentGroup === 'live-climate' ? 'Live Express Transport' : 'Express Delivery',
      eta: firstSlot,
      deliverySlots: summary.deliverySlots,
      buyerType: summary.buyerType,
      paymentMethod: summary.paymentMethod,
      paymentNumber: summary.paymentNumber,
      paymentConfirmationStatus: summary.paymentConfirmationStatus
    };

    await saveOrderToFirestore(newOrderRecord);
    setCompletedOrderSummary(summary);
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  // Product CRUD Handlers (Writing to Firestore)
  const handleUpdateProduct = async (updatedProduct: Product) => {
    await saveProductToFirestore(updatedProduct);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleAddProduct = async (newProduct: Product) => {
    await saveProductToFirestore(newProduct);
    setProducts(prev => [newProduct, ...prev.filter(p => p.id !== newProduct.id)]);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProductFromFirestore(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Filter Products
  const VALID_CATEGORIES = ['live-birds', 'fresh-poultry', 'eggs', 'farm-supplies', 'processed'];
  const storefrontProducts = products
    .filter(isCurrentStorefrontProduct)
    .map(applyStorefrontCopy)
    .filter(product => isProductAvailableForBuyer(product, buyerType))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const filteredProducts = storefrontProducts.filter(p => {
    if (!VALID_CATEGORIES.includes(p.category)) return false;
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = productMatchesSearch(p, searchQuery);

    return matchesCategory && matchesSearch;
  });

  const handleBuyerTypeChange = (type: BuyerType) => {
    setBuyerType(type);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  // If Admin Dashboard mode is active, render full-screen Admin View
  if (isAdminOpen && isCurrentUserAdmin) {
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
        onSignOut={async () => {
          try {
            await logoutUser();
          } catch (e) {
            console.warn('Logout note:', e);
          }
          setCurrentUser(null);
          localStorage.removeItem('chickmagnet_user');
        }}
        buyerType={buyerType}
        setBuyerType={handleBuyerTypeChange}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenTraceability={() => setIsTraceabilityOpen(true)}
        onOpenClaims={() => setIsClaimsOpen(true)}
        onOpenAdmin={isCurrentUserAdmin ? () => setIsAdminOpen(true) : undefined}
        onOpenBusinessPlan={() => setIsBusinessPlanOpen(true)}
      />

      {/* Admin Dashboard Command Overlay View */}
      {isAdminOpen && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
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
            currentUser={currentUser}
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
            onOpenClaims={() => setIsClaimsOpen(true)}
            onNavigateToShop={() => setActiveTab('shop')}
            onOpenAdmin={isCurrentUserAdmin ? () => setIsAdminOpen(true) : undefined}
            onOpenBusinessPlan={isCurrentUserAdmin ? () => setIsBusinessPlanOpen(true) : undefined}
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
                      Quality and Affordable Poultry Products For Wholesale and Retail
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
                        <span>Explore Products</span>
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
                            alt="ChickMagnet poultry products"
                            referrerPolicy="no-referrer"
                            className="w-full h-52 sm:h-60 lg:h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
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
                      onClick={() => handleBuyerTypeChange('retail')}
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        buyerType === 'retail'
                          ? 'bg-emerald-950 text-amber-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Retail</span>
                    </button>
                    <button
                      onClick={() => handleBuyerTypeChange('wholesale')}
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        buyerType === 'wholesale'
                          ? 'bg-emerald-950 text-amber-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Commercial Wholesale</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Catalog Header & Count */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 pt-2">
                <div>
                  <h2 className="font-serif font-black text-2xl text-emerald-950">
                    {selectedCategory === 'all'
                      ? (buyerType === 'wholesale' ? 'Commercial Wholesale' : 'Retail Products')
                      : selectedCategory.toUpperCase()}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="bg-amber-500 text-emerald-950 px-2.5 py-1 rounded-lg font-bold uppercase">
                    {buyerType}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Grid - Fits 4 cards in a row on medium/large screens */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  buyerType={buyerType}
                  onSelectProduct={(p) => setSelectedProduct(p)}
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
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={storefrontProducts.find(p => p.id === selectedProduct.id) || selectedProduct}
          buyerType={buyerType}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        buyerType={buyerType}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setSelectedProduct(null);
          if (!currentUser) {
            setAuthMode('signin');
            setResumeCheckoutAfterAuth(true);
            setAuthModalOpen(true);
            return;
          }
          setIsCheckoutOpen(true);
        }}
      />

      {/* Batch Traceability Portal */}
      <BatchTraceabilityPortal
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
        initialBatchId={traceBatchId}
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
        onClose={() => {
          setAuthModalOpen(false);
          setResumeCheckoutAfterAuth(false);
        }}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalOpen(false);
          if (resumeCheckoutAfterAuth) {
            setResumeCheckoutAfterAuth(false);
            setIsCheckoutOpen(true);
          }
        }}
      />

    </div>
  );
}
