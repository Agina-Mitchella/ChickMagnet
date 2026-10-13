import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileText,
  Globe,
  Layers,
  LayoutDashboard,
  Menu,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { Product, ProductGuide, MainCategory, User } from '../types';
import { updateBrandLogo, useBrandLogo, DEFAULT_BRAND_LOGO_IMAGE } from '../utils/cms';
import { getWholesaleMinimumForCategory } from '../utils/orderRules';
import { normalizeProductSeo, slugifyProductName, validateProductSeo } from '../utils/productSeo';
import {
  subscribeAdminOrders,
  reviewOrderPaymentInFirestore,
  updateOrderStatusInFirestore,
  subscribeAuditLogs,
  saveAuditLogToFirestore
} from '../services/firestoreSync';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (product: Product) => Promise<void>;
  onAddProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onOpenStorefrontPreview: () => void;
  currentUser: User | null;
  onCloseAdmin: () => void;
}

const createEmptyProductDraft = (): Partial<Product> => ({
  name: '',
  description: '',
  slug: '',
  previousSlugs: [],
  seoTitle: '',
  seoDescription: '',
  imageAlt: '',
  searchVisibility: 'index',
  catalogStatus: 'published',
  contentSections: [],
  showOnStorefront: true,
  price: 0,
  wholesalePrice: 0,
  wholesaleMinQty: 10,
  unit: 'bird',
  minOrderQty: 1,
  category: 'live-birds',
  subCategory: 'day-old-chicks',
  stock: 0,
  image: '',
  sellerName: 'ChickMagnet',
  sellerId: 'chickmagnet',
  sellerBadge: 'Sold by ChickMagnet',
  fulfillmentType: 'live-climate',
  tags: [],
  rating: 4.8,
  reviewsCount: 0,
});

export default function AdminDashboard({
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onOpenStorefrontPreview,
  currentUser,
  onCloseAdmin
}: AdminDashboardProps) {
  // Navigation tab
  type AdminTab = 'overview' | 'products' | 'orders' | 'website_cms' | 'audit_logs';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Brand Logo & Platform Name State
  const brand = useBrandLogo();
  const [logoImageUrl, setLogoImageUrl] = useState(brand.logoImageUrl || '');
  const [brandName, setBrandName] = useState(brand.brandName || 'ChickMagnet');
  const [logoSavedSuccess, setLogoSavedSuccess] = useState(false);
  const [brandSaveError, setBrandSaveError] = useState<string | null>(null);

  useEffect(() => {
    setLogoImageUrl(brand.logoImageUrl || '');
    setBrandName(brand.brandName || 'ChickMagnet');
  }, [brand]);

  const handleSaveBrandLogo = async () => {
    const nextBrandName = brandName.trim();
    const finalImageUrl = logoImageUrl.trim();
    if (!nextBrandName) {
      setBrandSaveError('Enter the brand name.');
      return;
    }
    if (finalImageUrl && !finalImageUrl.startsWith('/')) {
      try {
        const parsedUrl = new URL(finalImageUrl);
        if (parsedUrl.protocol !== 'https:') throw new Error();
      } catch {
        setBrandSaveError('Use a public HTTPS image URL, or reset to the ChickMagnet logo.');
        return;
      }
    }

    setBrandSaveError(null);
    try {
      await updateBrandLogo({
        logoImageUrl: finalImageUrl,
        brandName: nextBrandName,
      }, currentUser?.name || 'Admin');
      logAction(
        currentUser?.name || 'Admin',
        'Brand Updated',
        'Storefront name and logo',
        brand.brandName,
        nextBrandName,
      );
      setLogoSavedSuccess(true);
      setTimeout(() => setLogoSavedSuccess(false), 3500);
    } catch (error) {
      setBrandSaveError(error instanceof Error ? error.message : 'The brand settings could not be saved.');
    }
  };

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubAudit = subscribeAuditLogs(setAuditLogs);
    const unsubOrders = subscribeAdminOrders(setOrders);

    return () => {
      unsubAudit();
      unsubOrders();
    };
  }, []);

  const logAction = (user: string, action: string, detail: string, oldValue: string, newValue: string) => {
    const newEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user,
      action,
      detail,
      oldValue,
      newValue
    };
    saveAuditLogToFirestore(newEntry);
  };

  const handleAdvanceOrderStatus = async (orderId: string, newStatus: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    if (
      newStatus === 'Packed / Weighed'
      && (
        targetOrder.paymentConfirmationStatus !== 'confirmed'
        || targetOrder.pricingVerificationStatus !== 'verified'
      )
    ) {
      window.alert('Confirm the M-Pesa payment and product total before packing this order.');
      return;
    }

    try {
      await updateOrderStatusInFirestore(orderId, newStatus);
      logAction(currentUser?.name || 'Admin', 'Order Status Update', `Order ${orderId}`, targetOrder.status, newStatus);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The order status could not be updated.');
    }
  };

  const handleReviewOrderPayment = async (orderId: string, decision: 'confirmed' | 'rejected') => {
    const targetOrder = orders.find(order => order.id === orderId);
    if (!targetOrder) return;

    try {
      await reviewOrderPaymentInFirestore(orderId, decision);
      logAction(
        currentUser?.name || 'Admin',
        decision === 'confirmed' ? 'Payment Confirmed' : 'Payment Rejected',
        `Order ${orderId}`,
        String(targetOrder.paymentConfirmationStatus || 'pending_manual_review'),
        decision,
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The payment review could not be saved.');
    }
  };

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderBuyerFilter, setOrderBuyerFilter] = useState('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);

  // Product Add / Edit Modal State
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSaveError, setProductSaveError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>(createEmptyProductDraft);

  const updateProductGuide = (update: (guide: ProductGuide) => ProductGuide) => {
    setProductForm((current) => {
      const guide = current.productGuide ?? {
        intro: current.description || '',
        highlights: [],
        sections: [],
      };

      return { ...current, productGuide: update(guide) };
    });
  };

  const handleSaveProductForm = async () => {
    const category = (productForm.category as MainCategory) || 'live-birds';
    const retailPrice = Number(productForm.price);
    const stock = Number(productForm.stock ?? 0);
    const image = productForm.image?.trim() || '';
    const unit = productForm.unit?.trim() || (category === 'eggs' ? 'tray' : category === 'live-birds' ? 'bird' : 'kg');

    if (!productForm.name?.trim() || !productForm.description?.trim()) {
      setProductSaveError('Add a product title and short description.');
      return;
    }
    if (!Number.isFinite(retailPrice) || retailPrice <= 0 || !Number.isFinite(stock) || stock < 0) {
      setProductSaveError('Enter a valid price and stock quantity.');
      return;
    }
    try {
      const imageUrl = new URL(image);
      if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error();
    } catch {
      setProductSaveError('Add a public http or https image URL.');
      return;
    }

    const fulfillmentType = category === 'live-birds'
      ? 'live-climate'
      : category === 'fresh-poultry'
        ? 'chilled-express'
        : category === 'eggs'
          ? 'dry-ambient'
          : 'chilled-express';

    setIsSavingProduct(true);
    setProductSaveError(null);

    try {
      const productId = isAddingNewProduct ? `prod-${Date.now()}` : selectedProductModal?.id;
      if (!productId) throw new Error('The product ID is missing. Close the editor and try again.');

      const requestedSlug = productForm.slug?.trim() || slugifyProductName(productForm.name.trim());
      const existingSlug = selectedProductModal ? normalizeProductSeo(selectedProductModal).slug : '';
      const previousSlugs = Array.from(new Set([
        ...(productForm.previousSlugs ?? []),
        ...(existingSlug && existingSlug !== requestedSlug ? [existingSlug] : []),
      ]));
      const sharedProductFields = {
        ...productForm,
        id: productId,
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        slug: requestedSlug,
        previousSlugs,
        showOnStorefront: productForm.catalogStatus !== 'archived' && (productForm.showOnStorefront ?? true),
        price: retailPrice,
        wholesalePrice: retailPrice,
        wholesaleMinQty: getWholesaleMinimumForCategory(category),
        minOrderQty: Math.max(1, Number(productForm.minOrderQty || 1)),
        unit,
        category,
        stock,
        image,
        imageAlt: productForm.imageAlt?.trim() || productForm.name.trim(),
        contentSections: productForm.productGuide?.sections?.length
          ? productForm.productGuide.sections.map((section, index) => ({
              id: slugifyProductName(section.title) || `section-${index + 1}`,
              heading: section.title,
              body: section.summary || '',
              bullets: section.bullets,
            }))
          : productForm.contentSections,
        fulfillmentType,
        sellerName: 'ChickMagnet',
        sellerId: 'chickmagnet',
        sellerBadge: 'Sold by ChickMagnet',
      } as Product;
      const normalizedProduct = normalizeProductSeo(sharedProductFields);
      const validationErrors = validateProductSeo(normalizedProduct, products);
      if (validationErrors.length) {
        throw new Error(validationErrors.join(' '));
      }

      if (isAddingNewProduct) {
        const createdProd: Product = {
          ...normalizedProduct,
          subCategory: productForm.subCategory as any || (category === 'eggs' ? 'table-eggs' : 'day-old-chicks'),
          tags: productForm.tags || [],
          rating: productForm.rating || 4.8,
          reviewsCount: 0
        } as Product;

        await onAddProduct(createdProd);
        logAction(currentUser?.name || 'Admin', 'Product Created', createdProd.name, 'None', `Price Ksh ${createdProd.price}`);
      } else if (selectedProductModal) {
        const updatedProd: Product = {
          ...selectedProductModal,
          ...normalizedProduct,
        } as Product;

        await onUpdateProduct(updatedProd);
        logAction(currentUser?.name || 'Admin', 'Product Updated', updatedProd.name, `Stock ${selectedProductModal.stock}`, `Stock ${updatedProd.stock}`);
      }

      setSelectedProductModal(null);
      setIsAddingNewProduct(false);
    } catch (error) {
      setProductSaveError(error instanceof Error ? error.message : 'The product could not be saved.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Archive "${product.name}"? It will leave the storefront, but its old link will remain reserved.`);
    if (!confirmed) return;

    try {
      await onDeleteProduct(product.id);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The product could not be archived.');
    }
  };

  const filteredOrders = orders.filter(o => {
    const search = orderSearch.trim().toLowerCase();
    const matchesSearch = !search || [o.id, o.customerName, o.customerEmail, o.customerPhone]
      .some(value => String(value || '').toLowerCase().includes(search));
    const normalizedStatus = String(o.status || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const matchesStatus = orderStatusFilter === 'all' || normalizedStatus === orderStatusFilter;
    const matchesBuyer = orderBuyerFilter === 'all' || o.buyerType === orderBuyerFilter;
    return matchesSearch && matchesStatus && matchesBuyer;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const publishedProductCount = products.filter(product => product.catalogStatus !== 'archived' && product.showOnStorefront !== false).length;
  const unavailableProductCount = products.filter(product => product.catalogStatus === 'temporarilyUnavailable' || product.stock <= 0).length;
  const pendingPaymentCount = orders.filter(order => order.paymentConfirmationStatus === 'pending_manual_review').length;
  const totalOrderValue = orders.reduce((total, order) => total + Number(order.total || 0), 0);

  const openNewProductEditor = () => {
    setIsAddingNewProduct(true);
    setProductSaveError(null);
    setSelectedProductModal({} as Product);
    setProductForm(createEmptyProductDraft());
  };

  const navSections = [
    {
      title: 'MANAGE',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
        { id: 'products', label: 'Products', icon: Layers, badge: products.length.toString(), badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length.toString(), badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { id: 'website_cms', label: 'Brand', icon: Edit3, badge: null },
        { id: 'audit_logs', label: 'Activity', icon: FileText, badge: auditLogs.length ? auditLogs.length.toString() : null, badgeColor: 'bg-slate-100 text-slate-800 border-slate-300' }
      ]
    }
  ];

  const tabMeta: Record<string, { title: string; subtitle: string; category: string; actionBtn?: { label: string; action: () => void; icon: any; primary?: boolean } }> = {
    overview: {
      title: 'Overview',
      subtitle: 'A clear view of the products and orders currently stored in ChickMagnet.',
      category: 'ADMIN',
      actionBtn: {
        label: 'View Storefront',
        action: onOpenStorefrontPreview,
        icon: Globe
      }
    },
    orders: {
      title: 'Orders',
      subtitle: 'Review submitted orders and move them through fulfilment.',
      category: 'ADMIN'
    },
    products: {
      title: 'Products',
      subtitle: 'Add products, update prices and descriptions, or remove a product from sale.',
      category: 'ADMIN',
      actionBtn: {
        label: 'Add Product',
        action: openNewProductEditor,
        icon: Plus,
        primary: true
      }
    },
    website_cms: {
      title: 'Brand',
      subtitle: 'Manage the ChickMagnet name and logo used across the storefront.',
      category: 'ADMIN'
    },
    audit_logs: {
      title: 'Activity',
      subtitle: 'A record of product, order, and brand changes made through the CMS.',
      category: 'ADMIN'
    }
  };

  const currentMeta = tabMeta[activeTab] || {
    title: 'ChickMagnet Admin',
    subtitle: 'Manage the storefront.',
    category: 'ADMIN'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out shadow-sm ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Top Branding Section */}
        <div className="p-4 sm:p-5 border-b border-emerald-900 bg-[#062316] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            {brand.logoImageUrl ? (
              <img 
                src={brand.logoImageUrl} 
                alt={brand.brandName || 'Logo'} 
                style={{ height: '32px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }}
                className="h-8 max-w-[140px] w-auto object-contain drop-shadow shrink-0" 
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-sm shadow-md">
                CM
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm sm:text-base text-amber-400 leading-tight">
                  {brand.brandName || 'ChickMagnet'}
                </span>
              </div>
              <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/80 border border-emerald-700 px-1.5 py-0.2 rounded">
                Admin
              </span>
            </div>
          </div>

          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-900/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Vertical Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar bg-white">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-900/80 mb-1">
                {section.title}
              </div>
              
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as AdminTab);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-emerald-950 font-black shadow-md border border-amber-500/40'
                          : 'text-slate-700 hover:text-emerald-950 hover:bg-emerald-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-950' : 'text-emerald-700'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                          isActive 
                            ? 'bg-emerald-950 text-amber-300 border-emerald-900' 
                            : (item.badgeColor || 'bg-emerald-100 text-emerald-900 border-emerald-200')
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Sidebar User Profile & Quick Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                👑
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-[10px] font-mono text-emerald-800 truncate">
                  {currentUser?.email || ''}
                </div>
              </div>
            </div>
            
            <button
              onClick={onCloseAdmin}
              title="Exit Admin"
              className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-slate-50 overflow-y-auto">
        
        {/* Persistent Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-xs">
          
          {/* Left: Mobile Toggle & Dynamic Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-emerald-900 hover:text-emerald-800 p-1.5 rounded-lg bg-slate-100 border border-slate-200 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs truncate">
              <span className="font-mono text-emerald-800 uppercase font-bold hidden sm:inline">{currentMeta.category}</span>
              <span className="text-slate-400 hidden sm:inline">/</span>
              <span className="font-bold text-slate-900 truncate">{currentMeta.title}</span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Context Primary Action Button if provided */}
            {currentMeta.actionBtn && (
              <button
                onClick={currentMeta.actionBtn.action}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer ${
                  currentMeta.actionBtn.primary
                    ? 'bg-amber-400 hover:bg-amber-500 text-emerald-950 border border-amber-500/40'
                    : 'bg-emerald-900 hover:bg-emerald-800 text-white border border-emerald-950'
                }`}
              >
                <currentMeta.actionBtn.icon className="w-3.5 h-3.5" />
                <span>{currentMeta.actionBtn.label}</span>
              </button>
            )}

            {/* Preview Storefront Button */}
            <button
              onClick={onOpenStorefrontPreview}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>Storefront</span>
            </button>

            {/* Exit Admin */}
            <button
              onClick={onCloseAdmin}
              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </header>

        {/* Dynamic Section Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#072418] border-b border-emerald-900 px-4 sm:px-6 lg:px-8 py-5 text-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  {currentMeta.category}
                </span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-amber-300 mt-1.5">
                {currentMeta.title}
              </h1>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-3xl leading-relaxed">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Module Body Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 pb-16 bg-slate-50">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Products for sale', value: publishedProductCount, note: `${products.length} saved products`, icon: Layers },
                { label: 'Unavailable', value: unavailableProductCount, note: 'Out of stock or paused', icon: AlertCircle },
                { label: 'Orders', value: orders.length, note: `Ksh ${totalOrderValue.toLocaleString()} submitted`, icon: ShoppingBag },
                { label: 'Payment review', value: pendingPaymentCount, note: 'Awaiting manual confirmation', icon: Clock },
              ].map(metric => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>{metric.label}</span>
                    <metric.icon className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div className="mt-3 text-3xl font-black text-emerald-950">{metric.value}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{metric.note}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                    <ShoppingBag className="h-4 w-4 text-emerald-700" />
                    Recent orders
                  </h2>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-emerald-800 hover:text-emerald-950">
                    View orders
                  </button>
                </div>
                {orders.length ? (
                  <div className="mt-3 space-y-2">
                    {orders.slice(0, 4).map(order => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelectedOrderModal(order)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs hover:border-emerald-300"
                      >
                        <span>
                          <span className="block font-mono font-bold text-slate-900">{order.id}</span>
                          <span className="block text-slate-600">{order.customerName || 'Customer'}</span>
                        </span>
                        <span className="text-right">
                          <span className="block font-bold text-slate-900">Ksh {Number(order.total || 0).toLocaleString()}</span>
                          <span className="block text-[10px] text-slate-500">{order.status}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <ShoppingBag className="mx-auto h-7 w-7 text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-800">No orders yet</p>
                    <p className="mt-1 text-xs text-slate-500">New checkout submissions will appear here.</p>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                    <Activity className="h-4 w-4 text-emerald-700" />
                    Recent activity
                  </h2>
                  <button onClick={() => setActiveTab('audit_logs')} className="text-xs font-bold text-emerald-800 hover:text-emerald-950">
                    View activity
                  </button>
                </div>
                {auditLogs.length ? (
                  <div className="mt-3 space-y-3">
                    {auditLogs.slice(0, 4).map(log => (
                      <div key={log.id} className="border-b border-slate-100 pb-3 text-xs last:border-0 last:pb-0">
                        <div className="font-bold text-slate-900">{log.detail}</div>
                        <div className="mt-1 text-[10px] text-slate-500">{log.user} · {log.timestamp}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Activity className="mx-auto h-7 w-7 text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-800">No activity yet</p>
                    <p className="mt-1 text-xs text-slate-500">Changes made in this CMS will be recorded here.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Orders</h2>
                <p className="text-xs text-slate-600">Review customer details, payment confirmation, and fulfilment status.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order ID / Name"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-emerald-950 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="all">All statuses</option>
                  <option value="payment_confirmation_pending">Payment confirmation pending</option>
                  <option value="packed_weighed">Packed / Weighed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="guarantee_window_open">Guarantee Window Open</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={orderBuyerFilter}
                  onChange={(e) => setOrderBuyerFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-emerald-950 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Buyer Types</option>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Commercial wholesale</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-[#062316] text-amber-300 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Order ID & Date</th>
                      <th className="p-3.5">Customer & Type</th>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Total & Payment</th>
                      <th className="p-3.5">Current Status</th>
                      <th className="p-3.5 text-right">Pipeline Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-3.5 font-mono">
                          <button
                            onClick={() => setSelectedOrderModal(order)}
                            className="font-bold text-emerald-900 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>{order.id}</span>
                            <Eye className="w-3 h-3 text-emerald-700" />
                          </button>
                          <div className="text-[10px] text-slate-500">{order.date}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            order.buyerType === 'wholesale' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {order.buyerType}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-800 font-medium">{order.items || `${order.itemCount || 0} item(s)`}</div>
                          <div className="text-[10px] text-slate-500">{order.fulfillment || 'Delivery details pending'}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 font-mono">Ksh {Number(order.total || 0).toLocaleString()}</div>
                          <div className={`text-[10px] font-semibold ${
                            order.paymentConfirmationStatus === 'confirmed'
                              ? 'text-emerald-800'
                              : order.paymentConfirmationStatus === 'rejected'
                                ? 'text-rose-700'
                                : 'text-amber-800'
                          }`}>
                            {String(order.paymentConfirmationStatus || 'pending_manual_review').replaceAll('_', ' ')}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="bg-emerald-50 text-emerald-950 border border-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono">
                            {order.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5">
                          {order.paymentConfirmationStatus === 'pending_manual_review' ? (
                            <>
                              <button
                                onClick={() => handleReviewOrderPayment(order.id, 'confirmed')}
                                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs"
                              >
                                Confirm payment
                              </button>
                              <button
                                onClick={() => handleReviewOrderPayment(order.id, 'rejected')}
                                className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : null}
                          {order.paymentConfirmationStatus === 'rejected' ? (
                            <span className="text-[10px] text-rose-700 font-mono font-bold">Payment rejected</span>
                          ) : null}
                          {order.status === 'Payment confirmation pending'
                            && order.paymentConfirmationStatus === 'confirmed'
                            && order.pricingVerificationStatus === 'verified' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Packed / Weighed')}
                              className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs"
                            >
                              Mark packed
                            </button>
                          )}
                          {order.status === 'Packed / Weighed' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Dispatched')}
                              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs"
                            >
                              Mark dispatched
                            </button>
                          )}
                          {order.status === 'Dispatched' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Delivered')}
                              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {order.status === 'Delivered' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Guarantee Window Open')}
                              className="bg-purple-700 hover:bg-purple-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs"
                            >
                              Open guarantee window
                            </button>
                          )}
                          {order.status === 'Guarantee Window Open' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Closed')}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs"
                            >
                              Close Order
                            </button>
                          )}
                          {order.status === 'Closed' && (
                            <span className="text-[10px] text-slate-500 font-mono font-bold">Complete</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-14 text-center">
                          <ShoppingBag className="mx-auto h-7 w-7 text-slate-300" />
                          <p className="mt-3 text-sm font-bold text-slate-800">No orders found</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {orders.length ? 'Try changing the filters.' : 'The first completed checkout will appear here.'}
                          </p>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Products</h2>
                <p className="text-xs text-slate-600">Manage product names, prices, availability, images, descriptions, and search details.</p>
              </div>

              <button
                onClick={openNewProductEditor}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-emerald-500 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                        {product.category}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        product.stock <= 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-600'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm leading-snug">{product.name}</div>
                    <div className="text-xs text-emerald-900 font-bold font-mono">
                      Ksh {product.price} / {product.unit || 'unit'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedProductModal(product);
                        setIsAddingNewProduct(false);
                        setProductSaveError(null);
                        setProductForm(product);
                      }}
                      className="text-emerald-800 hover:text-emerald-950 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      className="text-rose-600 hover:text-rose-700 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRAND */}
        {activeTab === 'website_cms' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Brand</h2>
                <p className="text-xs text-slate-600">Manage the name and logo that are connected to the live storefront.</p>
              </div>
            </div>

            {/* BRAND LOGO & IDENTITY MANAGER CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-emerald-950 font-serif">Storefront identity</h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Update the ChickMagnet name and logo used in the header, footer, and account screens.
                  </p>
                </div>

                {/* Live Realtime Header Preview Box */}
                <div className="bg-[#123524] text-amber-50 border border-emerald-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 shadow-md max-w-full overflow-hidden">
                  <div className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider mr-1 shrink-0">
                    Preview
                  </div>
                  <div className="flex items-center gap-2.5">
                    {logoImageUrl ? (
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={logoImageUrl} 
                          alt="Logo Preview" 
                          style={{ height: '40px', width: 'auto', maxWidth: '220px', objectFit: 'contain' }}
                          className="h-10 max-w-[220px] w-auto object-contain shrink-0 drop-shadow-md" 
                        />
                      </div>
                    ) : (
                      <span className="font-serif text-lg font-black text-amber-400 tracking-tight">
                        {brandName || 'ChickMagnet'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Brand controls */}
              <div className="space-y-4 text-xs">
                <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-emerald-950">Brand name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(event) => setBrandName(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="brand-logo-url" className="block text-emerald-950 font-bold text-sm">Brand logo URL</label>
                    <span className="text-[10px] bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono font-bold">HTTPS</span>
                  </div>
                  <div>
                    <input
                      id="brand-logo-url"
                      type="url"
                      value={logoImageUrl}
                      onChange={(e) => setLogoImageUrl(e.target.value)}
                      placeholder="https://example.com/my-company-logo.png"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-600"
                    />
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                      Use a public image URL. Direct uploads stay disabled until image storage is connected.
                    </p>
                  </div>

                  {logoImageUrl && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-900 font-bold">Logo preview</span>
                        <button
                          type="button"
                          onClick={() => setLogoImageUrl(DEFAULT_BRAND_LOGO_IMAGE)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer underline"
                        >
                          Reset to ChickMagnet logo
                        </button>
                      </div>
                      <div className="h-28 w-full bg-slate-100 rounded-lg p-3 flex items-center justify-center border border-slate-200 overflow-hidden">
                        <img 
                          src={logoImageUrl} 
                          alt="Uploaded Brand Logo" 
                          style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                          className="max-h-full max-w-full w-auto h-auto object-contain" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Action */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {brandSaveError ? (
                  <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800">
                    {brandSaveError}
                  </div>
                ) : logoSavedSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-900 font-bold bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Brand settings saved.</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Save when the preview looks right.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSaveBrandLogo}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save brand</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-emerald-950 font-serif">Activity</h2>
              <p className="text-xs text-slate-600">Product, order, and brand changes made through this CMS.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-[#062316] text-amber-300 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Administrator</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Detail</th>
                    <th className="p-3.5">Old → New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-emerald-50/40">
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                      <td className="p-3.5 font-bold text-slate-900">{log.user}</td>
                      <td className="p-3.5 text-emerald-900 font-mono font-bold text-[11px]">{log.action}</td>
                      <td className="p-3.5 text-slate-800">{log.detail}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">
                        {log.oldValue} → <strong className="text-emerald-950">{log.newValue}</strong>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center">
                        <Activity className="mx-auto h-7 w-7 text-slate-300" />
                        <p className="mt-3 text-sm font-bold text-slate-800">No activity yet</p>
                        <p className="mt-1 text-xs text-slate-500">The first CMS change will be recorded here.</p>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* MODAL 1: ORDER DETAIL MODAL */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-4 text-xs text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">Order Detail: {selectedOrderModal.id}</h3>
                <p className="text-[11px] text-emerald-800 font-mono font-medium">Date: {selectedOrderModal.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{selectedOrderModal.customerName}</div>
                <div className="text-[11px] text-slate-600">{selectedOrderModal.customerEmail}</div>
                <div className="text-[11px] text-slate-600">{selectedOrderModal.customerPhone}</div>
                <div className="text-[10px] text-emerald-900 font-mono font-bold">{selectedOrderModal.buyerType === 'wholesale' ? 'Commercial wholesale' : 'Retail'}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-bold text-emerald-950">Order</div>
                <p className="mt-1 whitespace-pre-wrap text-[11px] leading-5 text-slate-700">{selectedOrderModal.items}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-950 text-xs">Delivery</div>
                <div className="text-[11px] text-slate-700">{selectedOrderModal.deliveryAddress}</div>
                <div className="text-[11px] text-slate-500">{selectedOrderModal.deliveryZone}</div>
                {Object.entries(selectedOrderModal.deliverySlots || {}).map(([grp, slot]: any) => (
                  <div key={grp} className="flex justify-between text-[11px] text-slate-700 font-mono">
                    <span className="uppercase font-semibold">{grp}:</span>
                    <strong className="text-emerald-950 font-bold">{slot}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Total: Ksh {Number(selectedOrderModal.total || 0).toLocaleString()}</span>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT MODAL */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs text-slate-800 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-emerald-950">
                {isAddingNewProduct ? 'Add Product' : `Edit Product: ${selectedProductModal.name}`}
              </h3>
              <button
                onClick={() => setSelectedProductModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Retail Price (Ksh)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Unit</label>
                  <select
                    value={productForm.unit || 'bird'}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="bird">Bird</option>
                    <option value="tray">Tray</option>
                    <option value="kg">Kilogram</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Retail minimum</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.minOrderQty || 1}
                    onChange={(e) => setProductForm({ ...productForm, minOrderQty: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as MainCategory })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="live-birds">Chicken</option>
                    <option value="fresh-poultry">Fresh Chicken</option>
                    <option value="eggs">Eggs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.showOnStorefront ?? true}
                  onChange={(e) => setProductForm({ ...productForm, showOnStorefront: e.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-emerald-700"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-900">Show on storefront</span>
                  <span className="block text-xs text-slate-600">Turn this off to keep the product in the CMS without offering it for sale.</span>
                </span>
              </label>

              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                Retail and wholesale use the same unit price. Wholesale minimums are applied automatically: 10 for chicken and 5 for egg products.
              </p>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Short Summary Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <div>
                  <div className="text-sm font-bold text-emerald-950">Search and sharing</div>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-600">
                    The URL is permanent by default. If it changes, the old URL is kept as a redirect.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Product URL</label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-emerald-600">
                    <span className="shrink-0 border-r border-slate-200 bg-slate-100 px-2 py-2 text-[11px] text-slate-500">/products/</span>
                    <input
                      type="text"
                      value={productForm.slug || ''}
                      onChange={(e) => setProductForm({ ...productForm, slug: slugifyProductName(e.target.value) })}
                      placeholder={slugifyProductName(productForm.name || 'product-name')}
                      className="min-w-0 flex-1 bg-white p-2 font-mono text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-700">Catalogue status</label>
                    <select
                      value={productForm.catalogStatus || 'published'}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        catalogStatus: e.target.value as Product['catalogStatus'],
                        showOnStorefront: e.target.value !== 'archived' && productForm.showOnStorefront !== false,
                      })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="temporarilyUnavailable">Temporarily unavailable</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-700">Google visibility</label>
                    <select
                      value={productForm.searchVisibility || 'index'}
                      onChange={(e) => setProductForm({ ...productForm, searchVisibility: e.target.value as Product['searchVisibility'] })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="index">Allow indexing</option>
                      <option value="noindex">Do not index</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Search title</label>
                  <input
                    type="text"
                    value={productForm.seoTitle || ''}
                    onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                    placeholder={`${productForm.name || 'Product name'} | ChickMagnet`}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Search description</label>
                  <textarea
                    rows={2}
                    value={productForm.seoDescription || ''}
                    onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                    placeholder="Leave blank to use the short summary."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Image description</label>
                  <input
                    type="text"
                    value={productForm.imageAlt || ''}
                    onChange={(e) => setProductForm({ ...productForm, imageAlt: e.target.value })}
                    placeholder="Describe what is visible in the product image."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <div>
                  <div className="text-sm font-bold text-emerald-950">Detailed product guide</div>
                  <p className="mt-0.5 text-[11px] leading-4 text-emerald-900/75">
                    This appears below the buying controls. Keep the overview short, then use sections for the detail buyers may choose to open.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Guide overview</label>
                  <textarea
                    rows={3}
                    value={productForm.productGuide?.intro || ''}
                    onChange={(event) => updateProductGuide((guide) => ({ ...guide, intro: event.target.value }))}
                    placeholder="Explain what the product is and who it is for in two or three sentences."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-slate-700">Quick facts</span>
                    <button
                      type="button"
                      onClick={() => updateProductGuide((guide) => ({
                        ...guide,
                        highlights: [...(guide.highlights ?? []), { label: '', value: '' }],
                      }))}
                      className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-900 hover:bg-emerald-50"
                    >
                      Add fact
                    </button>
                  </div>
                  {(productForm.productGuide?.highlights ?? []).map((highlight, index) => (
                    <div key={`highlight-${index}`} className="grid grid-cols-[1fr_1.4fr_auto] gap-1.5">
                      <input
                        type="text"
                        aria-label={`Quick fact ${index + 1} label`}
                        value={highlight.label}
                        onChange={(event) => updateProductGuide((guide) => ({
                          ...guide,
                          highlights: (guide.highlights ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item),
                        }))}
                        placeholder="Label"
                        className="min-w-0 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        aria-label={`Quick fact ${index + 1} value`}
                        value={highlight.value}
                        onChange={(event) => updateProductGuide((guide) => ({
                          ...guide,
                          highlights: (guide.highlights ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item),
                        }))}
                        placeholder="Value"
                        className="min-w-0 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        aria-label={`Remove quick fact ${index + 1}`}
                        onClick={() => updateProductGuide((guide) => ({
                          ...guide,
                          highlights: (guide.highlights ?? []).filter((_, itemIndex) => itemIndex !== index),
                        }))}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-slate-700">Guide sections</span>
                    <button
                      type="button"
                      onClick={() => updateProductGuide((guide) => ({
                        ...guide,
                        sections: [...guide.sections, { title: '', summary: '', bullets: [] }],
                      }))}
                      className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-900 hover:bg-emerald-50"
                    >
                      Add section
                    </button>
                  </div>

                  {(productForm.productGuide?.sections ?? []).map((section, index) => (
                    <div key={`guide-section-${index}`} className="space-y-2 rounded-xl border border-emerald-100 bg-white p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          aria-label={`Guide section ${index + 1} heading`}
                          value={section.title}
                          onChange={(event) => updateProductGuide((guide) => ({
                            ...guide,
                            sections: guide.sections.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                          }))}
                          placeholder="Section heading"
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-900"
                        />
                        <button
                          type="button"
                          aria-label={`Remove guide section ${index + 1}`}
                          onClick={() => updateProductGuide((guide) => ({
                            ...guide,
                            sections: guide.sections.filter((_, itemIndex) => itemIndex !== index),
                          }))}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        aria-label={`Guide section ${index + 1} summary`}
                        value={section.summary || ''}
                        onChange={(event) => updateProductGuide((guide) => ({
                          ...guide,
                          sections: guide.sections.map((item, itemIndex) => itemIndex === index ? { ...item, summary: event.target.value } : item),
                        }))}
                        placeholder="Short explanation"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900"
                      />
                      <textarea
                        rows={3}
                        aria-label={`Guide section ${index + 1} bullet points`}
                        value={(section.bullets ?? []).join('\n')}
                        onChange={(event) => updateProductGuide((guide) => ({
                          ...guide,
                          sections: guide.sections.map((item, itemIndex) => itemIndex === index ? {
                            ...item,
                            bullets: event.target.value.split('\n').map((bullet) => bullet.trim()).filter(Boolean),
                          } : item),
                        }))}
                        placeholder={'Optional bullet points, one per line'}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Important note</label>
                  <textarea
                    rows={2}
                    value={productForm.productGuide?.note || ''}
                    onChange={(event) => updateProductGuide((guide) => ({ ...guide, note: event.target.value }))}
                    placeholder="Add a care, storage or performance qualification only when it is useful."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Image Section */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-slate-900 font-bold">Main Product Image URL</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {productForm.image ? (
                      <img src={productForm.image} alt="Product preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400">No image</span>
                    )}
                  </div>
                  <div className="flex-grow space-y-1.5">
                    <input
                      type="url"
                      value={productForm.image || ''}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-600"
                    />
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Use a public image URL. Direct uploads are disabled until image storage is connected.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {productSaveError ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                {productSaveError}
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setSelectedProductModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProductForm}
                disabled={isSavingProduct}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer disabled:cursor-wait disabled:opacity-60"
              >
                {isSavingProduct ? 'Saving…' : 'Save product'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
