import React, { useState, useEffect } from 'react';
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
import StorefrontHero from './components/StorefrontHero';
import FAQSection from './components/FAQSection';
import { useColorScheme } from './utils/colorScheme';
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
  const { preference: colorScheme, setPreference: setColorScheme } = useColorScheme();
  const [activeTab, setActiveTab] = useState<'shop' | 'about' | 'profile'>(() => (
    window.location.pathname.replace(/\/+$/, '') === '/about' ? 'about' : 'shop'
  ));
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
          name: initP?.name || p.name,
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

  useEffect(() => {
    const syncPageFromLocation = () => {
      const isAboutPage = window.location.pathname.replace(/\/+$/, '') === '/about';
      setActiveTab(isAboutPage ? 'about' : 'shop');
      if (isAboutPage && window.location.hash) {
        window.setTimeout(() => {
          document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
        }, 0);
      }
    };

    window.addEventListener('popstate', syncPageFromLocation);
    syncPageFromLocation();
    return () => window.removeEventListener('popstate', syncPageFromLocation);
  }, []);

  const navigateToTab = (tab: 'shop' | 'about' | 'profile', sectionId?: string) => {
    setActiveTab(tab);
    const nextUrl = tab === 'about'
      ? `/about${sectionId ? `#${sectionId}` : ''}`
      : `/${sectionId ? `#${sectionId}` : ''}`;
    const currentUrl = `${window.location.pathname}${window.location.hash}`;
    if (currentUrl !== nextUrl) window.history.pushState({}, '', nextUrl);

    window.setTimeout(() => {
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  };

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
      paymentConfirmationStatus: summary.paymentConfirmationStatus,
      deliveryFeeStatus: summary.deliveryFeeStatus,
      paymentCovers: summary.paymentCovers,
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

  const scrollToCatalog = () => {
    window.setTimeout(() => {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleFooterCategorySelect = (category: MainCategory | 'all') => {
    navigateToTab('shop');
    if (category === 'fresh-poultry' && buyerType === 'wholesale') {
      setBuyerType('retail');
    }
    setSelectedCategory(category);
    setSearchQuery('');
    scrollToCatalog();
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
    <div className="flex min-h-screen flex-col justify-between bg-[#fffdf9] font-sans text-emerald-950 selection:bg-amber-400 selection:text-emerald-950 dark:bg-[#07130e] dark:text-emerald-50 dark:selection:bg-amber-300">
      
      {/* Sticky Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => navigateToTab(tab)}
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
        searchableProducts={storefrontProducts}
        onSelectProduct={setSelectedProduct}
        onApplySearch={scrollToCatalog}
        colorScheme={colorScheme}
        onColorSchemeChange={setColorScheme}
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
            onNavigateToShop={() => navigateToTab('shop')}
            onOpenAdmin={isCurrentUserAdmin ? () => setIsAdminOpen(true) : undefined}
            onOpenBusinessPlan={isCurrentUserAdmin ? () => setIsBusinessPlanOpen(true) : undefined}
          />
        ) : (
          /* MARKETPLACE SHOP VIEW */
          <div className="mx-auto max-w-[1440px] space-y-8 px-3 pt-4 min-[360px]:px-4 sm:space-y-9 sm:px-6 sm:pt-6 lg:px-8">
            
            {/* Premium responsive hero, shown only for the full catalogue. */}
            {selectedCategory === 'all' && (
              <StorefrontHero onExploreProducts={scrollToCatalog} />
            )}

            {/* Below-The-Fold Intent Split & Feature Trust Bar */}
            <div id="catalog-section" className="scroll-mt-48 space-y-5 sm:scroll-mt-52 sm:space-y-6 xl:scroll-mt-44">
              
              {/* Intent Split Selector */}
              <div className="flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-stone-200 bg-white p-3 shadow-[0_10px_30px_rgba(18,53,36,0.06)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_14px_34px_rgba(0,0,0,0.22)] sm:flex-row sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  <div className="flex w-full rounded-xl bg-stone-100 p-1 dark:bg-black/25 sm:w-auto">
                    <button
                      onClick={() => handleBuyerTypeChange('retail')}
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        buyerType === 'retail'
                          ? 'bg-emerald-950 text-amber-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 dark:text-emerald-100/70 dark:hover:text-white'
                      }`}
                    >
                      <span>Retail</span>
                    </button>
                    <button
                      onClick={() => handleBuyerTypeChange('wholesale')}
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        buyerType === 'wholesale'
                          ? 'bg-emerald-950 text-amber-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 dark:text-emerald-100/70 dark:hover:text-white'
                      }`}
                    >
                      <span>Commercial Wholesale</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Catalog Header & Count */}
              <div className="flex items-end justify-between gap-3 border-b border-stone-200 pb-4 pt-2 dark:border-white/10">
                <div>
                  <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.13em] text-amber-700">
                    {buyerType === 'wholesale' ? 'For commercial buyers' : 'For your table and flock'}
                  </p>
                  <h2 className="text-2xl font-black tracking-[-0.035em] text-emerald-950 dark:text-white sm:text-3xl">
                    {selectedCategory === 'all'
                      ? (buyerType === 'wholesale' ? 'Commercial Wholesale' : 'Retail Products')
                      : selectedCategory === 'live-birds'
                        ? 'Live Chicken'
                        : selectedCategory === 'fresh-poultry'
                          ? 'Fresh Chicken'
                          : 'Eggs'}
                  </h2>
                </div>

                <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-900 dark:bg-amber-300/15 dark:text-amber-200">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
              </div>
            </div>

            {/* Product Grid - Fits 4 cards in a row on medium/large screens */}
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-7 min-[360px]:gap-x-3 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 xl:grid-cols-4">
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
              <div className="space-y-3 rounded-3xl border border-stone-200 bg-white px-5 py-16 text-center dark:border-white/10 dark:bg-white/[0.06]">
                <div className="text-4xl">🐣</div>
                <h3 className="font-serif font-bold text-lg text-emerald-950 dark:text-white">No products match your filter</h3>
                <p className="text-xs text-slate-500 dark:text-emerald-100/65 font-mono max-w-sm mx-auto">
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

            <FAQSection />

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer 
        buyerType={buyerType}
        onSelectCategory={handleFooterCategorySelect}
        onNavigate={(tab, sectionId) => {
          if (tab === 'shop' || tab === 'about' || tab === 'profile') {
            navigateToTab(tab, sectionId);
          }
        }}
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
