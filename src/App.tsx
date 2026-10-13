import React, { lazy, Suspense, useEffect, useState } from 'react';
import { STOREFRONT_PRODUCTS } from './data/storefrontCatalog';
import { Product, CartItem, BuyerType, MainCategory, User } from './types';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Footer from './components/Footer';
import StorefrontHero from './components/StorefrontHero';
import FAQSection from './components/FAQSection';
import { useColorScheme } from './utils/colorScheme';
import {
  applyStorefrontCopy,
  isCurrentStorefrontProduct,
  isProductAvailableForBuyer,
  productMatchesSearch,
} from './utils/storefrontProducts';
import { getCategoryPath, normalizeProductSeo } from './utils/productSeo';

const AccountDashboard = lazy(() => import('./components/AccountDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const CheckoutRitual = lazy(() => import('./components/CheckoutRitual'));
const CongratsModal = lazy(() => import('./components/CongratsModal'));
const MortalityClaimRitual = lazy(() => import('./components/MortalityClaimRitual'));

type AppPage = 'shop' | 'profile' | 'product';

interface AppProps {
  initialProducts?: Product[];
  initialPage?: AppPage;
  initialBuyerType?: BuyerType;
  initialCategory?: MainCategory | 'all';
  initialSearchQuery?: string;
  initialProduct?: Product;
  initialAgeWeeks?: number;
}

function LoadingSurface() {
  return <div className="min-h-[45vh] bg-[#fffdf9]" aria-hidden="true" />;
}

export default function App({
  initialProducts = STOREFRONT_PRODUCTS,
  initialPage = 'shop',
  initialBuyerType = 'retail',
  initialCategory = 'all',
  initialSearchQuery = '',
  initialProduct,
  initialAgeWeeks,
}: AppProps) {
  const { preference: colorScheme, setPreference: setColorScheme } = useColorScheme();
  const [activeTab, setActiveTab] = useState<AppPage>(initialPage);
  const [buyerType, setBuyerType] = useState<BuyerType>(initialBuyerType);
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  
  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const rawProducts = initialProducts;
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
      })
      .map(normalizeProductSeo);
  });

  // Admin Dashboard Mode
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Checkout ritual state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedOrderSummary, setCompletedOrderSummary] = useState<any>(null);

  // Customer support modal
  const [isClaimsOpen, setIsClaimsOpen] = useState<boolean>(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [resumeCheckoutAfterAuth, setResumeCheckoutAfterAuth] = useState(false);
  // Default to null until Firebase Auth initializes
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [, setAuthLoading] = useState<boolean>(true);
  const isCurrentUserAdmin = Boolean(
    currentUser?.customClaims?.admin === true || currentUser?.customClaims?.role === 'ADMIN'
  );

  useEffect(() => {
    try {
      [
        'chickmagnet_admin_claims',
        'chickmagnet_admin_wholesale',
        'chickmagnet_admin_badges',
        'chickmagnet_admin_batches',
        'chickmagnet_admin_audit_logs',
      ].forEach(key => window.localStorage.removeItem(key));

      const saved = window.localStorage.getItem('chickmagnet_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch {
      // A blocked storage API should not stop shopping.
    } finally {
      setCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      window.localStorage.setItem('chickmagnet_cart', JSON.stringify(cartItems));
    } catch {
      // The cart remains usable for the current session.
    }
  }, [cartHydrated, cartItems]);

  const navigateToTab = (tab: 'shop' | 'about' | 'profile', sectionId?: string) => {
    if (tab === 'profile') {
      setActiveTab('profile');
      window.history.replaceState({}, '', '/#account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const nextUrl = tab === 'about' ? '/about' : '/shop';
    window.location.assign(`${nextUrl}${sectionId ? `#${sectionId}` : ''}`);
  };

  // Real-time Firebase Auth session and profile sync
  useEffect(() => {
    let disposed = false;
    let unsubscribe = () => {};
    let authSyncStarted = false;

    const startAuthSync = () => {
      if (authSyncStarted || disposed) return;
      authSyncStarted = true;
      window.clearTimeout(authTimer);
      window.removeEventListener('pointerdown', startAuthSync);
      window.removeEventListener('keydown', startAuthSync);

      void import('./config/firebaseAuth').then(({ getFirebaseAuthorization, subscribeAuthUser }) => {
        if (disposed) return;
        unsubscribe = subscribeAuthUser(async (firebaseUser, profileData) => {
          if (firebaseUser) {
            const isGuest = firebaseUser.isAnonymous;
            let customClaims: Record<string, unknown> = {};
            let isAdmin = false;
            if (!isGuest) {
              try {
                const authorization = await getFirebaseAuthorization(firebaseUser);
                customClaims = authorization.claims;
                isAdmin = authorization.isAdmin;
              } catch (error) {
                console.warn('Could not read account permissions:', error);
              }
            }

            const userEmail = firebaseUser.email || '';
            const userObj: User = {
              uid: firebaseUser.uid,
              email: userEmail,
              name: isGuest
                ? 'Guest shopper'
                : profileData?.displayName || firebaseUser.displayName || userEmail.split('@')[0] || 'Poultry Member',
              role: isAdmin ? 'ADMIN' : 'BUYER',
              buyerType: profileData?.buyerType === 'wholesale' ? 'wholesale' : 'retail',
              avatarEmoji: profileData?.avatarEmoji || (isAdmin ? '👑' : '🐣'),
              photoURL: firebaseUser.photoURL || undefined,
              customClaims,
              isGuest,
            };
            setCurrentUser(userObj);
          } else {
            setCurrentUser(null);
          }
          setAuthLoading(false);
        });
      }).catch(error => {
        console.error('Account services could not start.', error);
        setAuthLoading(false);
      });
    };

    // Authentication is essential once a shopper interacts, but it should not
    // compete with the hero image during the first render. Existing sessions
    // still restore automatically after this short handoff.
    const authTimer = window.setTimeout(startAuthSync, 1600);
    window.addEventListener('pointerdown', startAuthSync, { once: true, passive: true });
    window.addEventListener('keydown', startAuthSync, { once: true });

    return () => {
      disposed = true;
      window.clearTimeout(authTimer);
      window.removeEventListener('pointerdown', startAuthSync);
      window.removeEventListener('keydown', startAuthSync);
      unsubscribe();
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

  const [userOrders, setUserOrders] = useState<any[]>([]);

  // A buyer only subscribes to documents whose buyerId matches their Firebase UID.
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserOrders([]);
      return;
    }

    let disposed = false;
    let unsubscribe = () => {};
    void import('./services/firestoreSync').then(({ subscribeUserOrders }) => {
      if (!disposed) unsubscribe = subscribeUserOrders(currentUser.uid, setUserOrders);
    });
    return () => {
      disposed = true;
      unsubscribe();
    };
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
      batchId: '',
      fulfillment: summary.items?.[0]?.fulfillmentGroup === 'live-climate' ? 'Live Express Transport' : 'Express Delivery',
      eta: firstSlot,
      deliverySlots: summary.deliverySlots,
      buyerType: summary.buyerType,
      paymentMethod: summary.paymentMethod,
      paymentNumber: summary.paymentNumber,
      paymentConfirmationStatus: summary.paymentConfirmationStatus,
      deliveryFeeStatus: summary.deliveryFeeStatus,
      paymentCovers: summary.paymentCovers,
      customerName: summary.name,
      customerEmail: summary.email,
      customerPhone: summary.phone,
      deliveryZone: summary.deliveryZone,
      deliveryAddress: summary.address,
    };

    const { saveOrderToFirestore } = await import('./services/firestoreSync');
    await saveOrderToFirestore(newOrderRecord);
    setCompletedOrderSummary(summary);
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  // Product CRUD Handlers (Writing to Firestore)
  const handleUpdateProduct = async (updatedProduct: Product) => {
    const { saveProductToFirestore } = await import('./services/firestoreSync');
    await saveProductToFirestore(updatedProduct);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleAddProduct = async (newProduct: Product) => {
    const { saveProductToFirestore } = await import('./services/firestoreSync');
    await saveProductToFirestore(newProduct);
    setProducts(prev => [newProduct, ...prev.filter(p => p.id !== newProduct.id)]);
  };

  const handleDeleteProduct = async (productId: string) => {
    const { deleteProductFromFirestore } = await import('./services/firestoreSync');
    await deleteProductFromFirestore(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Filter Products
  const VALID_CATEGORIES = ['live-birds', 'fresh-poultry', 'eggs'];
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
  const catalogueHeading = selectedCategory === 'all'
    ? (buyerType === 'wholesale' ? 'Commercial Wholesale' : 'Retail Products')
    : selectedCategory === 'live-birds'
      ? 'Live Chicken'
      : selectedCategory === 'fresh-poultry'
        ? 'Fresh Chicken'
        : 'Eggs';

  const handleBuyerTypeChange = (type: BuyerType) => {
    setBuyerType(type);
    if (type === 'wholesale' && selectedCategory === 'fresh-poultry') {
      setSelectedCategory('all');
    }
  };

  const scrollToCatalog = () => {
    window.setTimeout(() => {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleApplySearch = () => {
    const targetUrl = new URL(
      getCategoryPath(selectedCategory, buyerType === 'wholesale'),
      window.location.origin,
    );
    const normalizedQuery = searchQuery.trim();
    if (normalizedQuery) targetUrl.searchParams.set('q', normalizedQuery);

    const targetPath = `${targetUrl.pathname}${targetUrl.search}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (targetPath === currentPath) {
      scrollToCatalog();
      return;
    }

    window.location.assign(`${targetPath}#catalog-section`);
  };

  const handleFooterCategorySelect = (category: MainCategory | 'all') => {
    window.location.assign(getCategoryPath(category, buyerType === 'wholesale'));
  };

  // If Admin Dashboard mode is active, render full-screen Admin View
  if (isAdminOpen && isCurrentUserAdmin) {
    return (
      <Suspense fallback={<LoadingSurface />}>
        <AdminDashboard
          products={products}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onOpenStorefrontPreview={() => setIsAdminOpen(false)}
          currentUser={currentUser}
          onCloseAdmin={() => setIsAdminOpen(false)}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#fffdf9] font-sans text-emerald-950 selection:bg-amber-400 selection:text-emerald-950 dark:bg-[#07130e] dark:text-emerald-50 dark:selection:bg-amber-300">
      
      {/* Sticky Header Navigation */}
      <Navbar
        activeTab={activeTab === 'product' ? 'shop' : activeTab}
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
            const { logoutUser } = await import('./config/firebaseAuth');
            await logoutUser();
          } catch (e) {
            console.warn('Logout note:', e);
          }
          setCurrentUser(null);
          window.localStorage.removeItem('chickmagnet_user');
        }}
        buyerType={buyerType}
        setBuyerType={handleBuyerTypeChange}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchableProducts={storefrontProducts}
        onApplySearch={handleApplySearch}
        colorScheme={colorScheme}
        onColorSchemeChange={setColorScheme}
        onOpenAdmin={isCurrentUserAdmin ? () => setIsAdminOpen(true) : undefined}
      />

      {/* Admin Dashboard Command Overlay View */}
      {isAdminOpen && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
          <Suspense fallback={<LoadingSurface />}>
            <AdminDashboard
              products={products}
              onUpdateProduct={handleUpdateProduct}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onOpenStorefrontPreview={() => setIsAdminOpen(false)}
              currentUser={currentUser}
              onCloseAdmin={() => setIsAdminOpen(false)}
            />
          </Suspense>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        
        {/* CHECKOUT RITUAL SCREEN */}
        {isCheckoutOpen ? (
          <Suspense fallback={<LoadingSurface />}>
            <CheckoutRitual
              cartItems={cartItems}
              buyerType={buyerType}
              currentUser={currentUser}
              onOrderCompleted={handleOrderCompleted}
              onCancel={() => setIsCheckoutOpen(false)}
            />
          </Suspense>
        ) : activeTab === 'profile' ? (
          <Suspense fallback={<LoadingSurface />}>
            <AccountDashboard
              currentUser={currentUser}
              buyerType={buyerType}
              userOrders={userOrders}
              onOpenClaims={() => setIsClaimsOpen(true)}
              onNavigateToShop={() => navigateToTab('shop')}
              onOpenAdmin={isCurrentUserAdmin ? () => setIsAdminOpen(true) : undefined}
            />
          </Suspense>
        ) : activeTab === 'product' && initialProduct ? (
          <div className="mx-auto w-full max-w-[1440px] px-3 py-5 min-[360px]:px-4 sm:px-6 sm:py-8 lg:px-8">
            <ProductDetail
              product={storefrontProducts.find(product => product.id === initialProduct.id) || initialProduct}
              buyerType={buyerType}
              onAddToCart={(product, quantity) => handleAddToCart(product, quantity)}
              standalone
              initialAgeWeeks={initialAgeWeeks}
            />
          </div>
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
                    <a
                      href="/shop"
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        buyerType === 'retail'
                          ? 'bg-emerald-950 text-amber-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 dark:text-emerald-100/70 dark:hover:text-white'
                      }`}
                    >
                      <span>Retail</span>
                    </a>
                    <a
                      href="/wholesale"
                      className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        buyerType === 'wholesale'
                          ? 'bg-emerald-950 text-amber-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 dark:text-emerald-100/70 dark:hover:text-white'
                      }`}
                    >
                      <span>Commercial Wholesale</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Catalog Header & Count */}
              <div className="flex items-end justify-between gap-3 border-b border-stone-200 pb-4 pt-2 dark:border-white/10">
                <div>
                  <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.13em] text-amber-700">
                    {buyerType === 'wholesale' ? 'For commercial buyers' : 'For your table and flock'}
                  </p>
                  {selectedCategory === 'all' ? (
                    <h2 className="text-2xl font-black tracking-[-0.035em] text-emerald-950 dark:text-white sm:text-3xl">
                      {catalogueHeading}
                    </h2>
                  ) : (
                    <h1 className="text-2xl font-black tracking-[-0.035em] text-emerald-950 dark:text-white sm:text-3xl">
                      {catalogueHeading}
                    </h1>
                  )}
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

            <FAQSection limit={6} showAllLink />

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

      {/* Cart Drawer */}
      {isCartOpen ? (
        <Suspense fallback={null}>
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            buyerType={buyerType}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onProceedToCheckout={() => {
              if (!currentUser) {
                setAuthMode('signin');
                setResumeCheckoutAfterAuth(true);
                setAuthModalOpen(true);
                return;
              }
              setIsCheckoutOpen(true);
            }}
          />
        </Suspense>
      ) : null}

      {/* 24h Mortality Claim Ritual */}
      {isClaimsOpen ? (
        <Suspense fallback={null}>
          <MortalityClaimRitual isOpen={isClaimsOpen} onClose={() => setIsClaimsOpen(false)} />
        </Suspense>
      ) : null}

      {/* Congrats Order Confirmation Modal */}
      {completedOrderSummary ? (
        <Suspense fallback={null}>
          <CongratsModal
            orderSummary={completedOrderSummary}
            onClose={() => setCompletedOrderSummary(null)}
            onOpenClaims={() => setIsClaimsOpen(true)}
          />
        </Suspense>
      ) : null}

      {/* Auth Modal */}
      {authModalOpen ? (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => {
              setAuthModalOpen(false);
              setResumeCheckoutAfterAuth(false);
            }}
            initialMode={authMode}
            returnFocusSelector={resumeCheckoutAfterAuth ? '#header-cart-button' : undefined}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setAuthModalOpen(false);
              if (resumeCheckoutAfterAuth) {
                setResumeCheckoutAfterAuth(false);
                setIsCheckoutOpen(true);
              }
            }}
          />
        </Suspense>
      ) : null}

    </div>
  );
}
