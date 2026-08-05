import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Truck, ShieldCheck, FileText, Activity, 
  Users, Settings, Plus, Edit3, Trash2, Eye, CheckCircle2, AlertTriangle, 
  Clock, Search, Filter, RefreshCw, Upload, Download, ArrowRight, Lock, 
  Key, Award, AlertCircle, HelpCircle, ChevronRight, Save, Globe, Sparkles, 
  PieChart, BarChart3, TrendingUp, DollarSign, Calendar, Mail, Building, 
  FileSpreadsheet, XCircle, Check, ArrowUpRight, Layers, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, BuyerType, MainCategory, MortalityClaim, BatchTraceabilityRecord, User } from '../types';
import { getStoredCMSData, updateCMSBlock, saveStoredCMSData, CMSBlock, getStoredBrandLogo, updateBrandLogo, useBrandLogo } from '../utils/cms';
import BusinessPlanHub from './BusinessPlanHub';
import FarmOperationsModule from './FarmOperationsModule';

export type AdminRole = 'ADMIN' | 'CONTENT_EDITOR' | 'FULFILLMENT_STAFF';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  userOrders: any[];
  onUpdateOrderStatus?: (orderId: string, newStatus: string) => void;
  onOpenStorefrontPreview: () => void;
  currentUser: User | null;
  onCloseAdmin: () => void;
}

// Initial Mock Audit Log
const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', timestamp: '2026-08-03 10:14', user: 'Agina (Admin)', action: 'Content Edit', detail: 'Updated Hero Subhead text', oldValue: 'Fresh chicks to your farm', newValue: 'Direct-from-Hatchery Day-Old Chicks & Cold-Chain Dressed Poultry' },
  { id: 'log-2', timestamp: '2026-08-02 16:30', user: 'Agina (Admin)', action: 'Price Update', detail: 'Kenbro Chicks Wholesale Price', oldValue: 'Ksh 120', newValue: 'Ksh 115' },
  { id: 'log-3', timestamp: '2026-08-02 11:20', user: 'Order Staff', action: 'Order Pipeline', detail: 'Advanced CHX-8821 to Dispatched', oldValue: 'Packed/Weighed', newValue: 'Dispatched' },
  { id: 'log-4', timestamp: '2026-08-01 09:45', user: 'Agina (Admin)', action: 'Wholesale Approval', detail: 'Approved Net-30 for Rift Valley Farms', oldValue: 'Pending', newValue: 'Approved (Ksh 500,000 Limit)' },
];

// Initial Trust Badges
const INITIAL_BADGES = [
  { id: 'badge-1', name: 'KEBS Quality Mark', category: 'Standards', number: 'KEBS/PV-88392/2025', expiryDate: '2027-12-31', status: 'active', icon: '🛡️', issuer: 'Kenya Bureau of Standards' },
  { id: 'badge-2', name: 'DVS Avian Health Clearance', category: 'Veterinary', number: 'DVS-NAI-9921', expiryDate: '2026-11-15', status: 'active', icon: '💉', issuer: 'Directorate of Veterinary Services' },
  { id: 'badge-3', name: 'Halal Slaughter Certification', category: 'Religious Standard', number: 'HALAL-KE-2026', expiryDate: '2026-09-30', status: 'active', icon: '🌙', issuer: 'Kenya Halal Bureau' },
  { id: 'badge-4', name: 'NPIP Salmonella-Clean Hatchery', category: 'Biosecurity', number: 'NPIP-HAT-004', expiryDate: '2025-06-01', status: 'expired', icon: '🐥', issuer: 'National Poultry Improvement Plan' },
];

// Initial Batch Records
const INITIAL_BATCHES: BatchTraceabilityRecord[] = [
  {
    batchId: 'BATCH-2026-CHX9',
    farmName: 'ChickMagnet Bio-Hatchery #1',
    location: 'Naivasha Bio-Isolated Facility',
    breedOrCut: 'Kenbro Day-Old Chicks',
    hatchOrSlaughterDate: '2026-07-29',
    feedSupplier: 'Ungwa Bio-Feeds Starter',
    vaccinationHistory: [
      { vaccine: "Marek's HVT In-Ovo", dateAdministered: '2026-07-29' },
      { vaccine: 'Newcastle NCD + IB Spray', dateAdministered: '2026-07-29' }
    ],
    labTestStatus: 'NEGATIVE (Salmonella & Avian Flu Screened)',
    kebsLicenseNo: 'KEBS/PV-88392/2025',
    dvsCertNo: 'DVS-NAI-9921',
    veterinarySignOff: 'Dr. J. Karanja (DVM License #1128)',
    temperatureLog: '37.8°C Incubation / 24.2°C Transit'
  },
  {
    batchId: 'BATCH-2026-MEAT4',
    farmName: 'ChickMagnet Limuru Processing Plant',
    location: 'Limuru Highlands',
    breedOrCut: 'Fresh Dressed Whole Broiler',
    hatchOrSlaughterDate: '2026-08-01',
    feedSupplier: 'ChickMagnet Bio-Grower Pellets',
    vaccinationHistory: [
      { vaccine: 'Gumboro IBD Booster', dateAdministered: '2026-07-10' }
    ],
    labTestStatus: 'PASSED (HACCP Microbial Count < 10 CFU/g)',
    kebsLicenseNo: 'KEBS/MEAT-44102',
    dvsCertNo: 'DVS-KMB-3309',
    veterinarySignOff: 'Dr. M. Wanjiku (Senior Meat Inspector)',
    temperatureLog: '0.8°C Air-Chilled Processing'
  }
];

// Initial Wholesale Accounts
const INITIAL_WHOLESALE_ACCOUNTS = [
  { id: 'ws-1', companyName: 'Naivasha Safari Lodge HORECA', contactPerson: 'David Mwangi', email: 'procurement@naivashalodge.co.ke', buyerType: 'wholesale', creditLimitKsh: 500000, creditUsedKsh: 280000, net30Status: 'approved', lastOrderDate: '2026-07-28', overdueAmountKsh: 0, phone: '+254 722 100 200' },
  { id: 'ws-2', companyName: 'Nairobi Fresh Poultry Distributors', contactPerson: 'Sarah Kimani', email: 'orders@nairobfresh.co.ke', buyerType: 'wholesale', creditLimitKsh: 1000000, creditUsedKsh: 850000, net30Status: 'approved', lastOrderDate: '2026-07-15', overdueAmountKsh: 120000, phone: '+254 733 400 500' },
  { id: 'ws-3', companyName: 'Eldoret Farmers Cooperative', contactPerson: 'Peter Kiprop', email: 'pkiprop@eldoretcoop.or.ke', buyerType: 'wholesale', creditLimitKsh: 300000, creditUsedKsh: 0, net30Status: 'pending_approval', lastOrderDate: 'None', overdueAmountKsh: 0, phone: '+254 711 990 880' }
];

// Initial Claims Queue
const INITIAL_CLAIMS: MortalityClaim[] = [
  {
    id: 'CLM-9021',
    orderId: 'CHX-8821',
    batchId: 'BATCH-2026-CHX9',
    breed: 'Kenbro Day-Old Chicks',
    affectedQty: 12,
    incidentDate: '2026-08-02',
    photoEvidenceUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80',
    description: '12 chicks lost during transit due to excessive heat in rear crate compartment.',
    status: 'pending_review',
    claimDate: '2026-08-02 18:30'
  },
  {
    id: 'CLM-8810',
    orderId: 'CHX-7710',
    batchId: 'BATCH-2026-MEAT4',
    breed: 'Air-Chilled Whole Chicken',
    affectedQty: 1,
    incidentDate: '2026-07-28',
    photoEvidenceUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80',
    description: 'Weight discrepancy of 250g beyond 10% tolerance margin.',
    status: 'approved_credit',
    refundAmount: 350,
    claimDate: '2026-07-29 10:15'
  }
];

export default function AdminDashboard({
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  userOrders,
  onUpdateOrderStatus,
  onOpenStorefrontPreview,
  currentUser,
  onCloseAdmin
}: AdminDashboardProps) {
  // Navigation tab
  type AdminTab = 
    | 'overview' 
    | 'farm_ops'
    | 'business_plan'
    | 'orders' 
    | 'claims' 
    | 'customers' 
    | 'analytics' 
    | 'products' 
    | 'batches' 
    | 'website_cms' 
    | 'badges' 
    | 'audit_logs';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Brand Logo & Platform Name State
  const brand = useBrandLogo();
  const [logoType, setLogoType] = useState<'emoji' | 'image'>(brand.logoType || 'emoji');
  const [logoDisplayMode, setLogoDisplayMode] = useState<'image_only' | 'image_with_text' | 'emoji_with_text'>(brand.logoDisplayMode || 'image_only');
  const [logoEmoji, setLogoEmoji] = useState(brand.logoEmoji || '🐔');
  const [logoImageUrl, setLogoImageUrl] = useState(brand.logoImageUrl || '');
  const [brandName, setBrandName] = useState(brand.brandName || 'ChickMagnet');
  const [logoSavedSuccess, setLogoSavedSuccess] = useState(false);

  useEffect(() => {
    setLogoType(brand.logoType || 'emoji');
    setLogoDisplayMode(brand.logoDisplayMode || 'image_only');
    setLogoEmoji(brand.logoEmoji || '🐔');
    setLogoImageUrl(brand.logoImageUrl || '');
    setBrandName(brand.brandName || 'ChickMagnet');
  }, [brand]);

  const handleSaveBrandLogo = () => {
    updateBrandLogo({
      logoType,
      logoDisplayMode,
      logoEmoji,
      logoImageUrl,
      brandName
    }, currentUser?.name || 'Admin');
    logAction(
      currentUser?.name || 'Admin',
      'Platform Logo Updated',
      `Type: ${logoType}, Mode: ${logoDisplayMode}, Logo: ${logoType === 'emoji' ? logoEmoji : 'Custom Image'}`,
      brand.brandName,
      brandName
    );
    setLogoSavedSuccess(true);
    setTimeout(() => setLogoSavedSuccess(false), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Selected image file is too large. Please select an image under 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLogoImageUrl(reader.result);
        setLogoType('image');
        setLogoDisplayMode('image_only');
      }
    };
    reader.readAsDataURL(file);
  };

  // Role Control
  const [activeRole, setActiveRole] = useState<AdminRole>('ADMIN');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

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
    const updated = [newEntry, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('chickmagnet_admin_audit_logs', JSON.stringify(updated));
  };

  // Orders State (Merged initial sample + real user orders)
  const INITIAL_ORDERS = [
    {
      id: 'CHX-8821',
      date: '2026-08-02',
      customerName: 'Eldoret Poultry Care',
      email: 'orders@eldoretcare.co.ke',
      buyerType: 'retail',
      items: [
        { product: { name: 'Kenbro Day-Old Chicks' }, quantity: 100, fulfillmentGroup: 'live-climate' }
      ],
      deliverySlots: { 'live-climate': 'Tue Morning (06:00 AM - 09:00 AM Express Transport)' },
      status: 'Dispatched',
      fulfillment: 'Live Express Transport',
      paymentStatus: 'Paid (M-PESA)',
      grandTotal: 13500,
      batchIds: ['BATCH-2026-CHX9'],
      weightAdjustments: []
    },
    {
      id: 'CHX-7710',
      date: '2026-08-01',
      customerName: 'Naivasha Safari Lodge',
      email: 'procurement@naivashalodge.co.ke',
      buyerType: 'wholesale',
      items: [
        { product: { name: 'Air-Chilled Dressed Broiler' }, quantity: 50, fulfillmentGroup: 'chilled-express' }
      ],
      deliverySlots: { 'chilled-express': 'Today Evening (04:00 PM - 07:00 PM Chilled Van)' },
      status: 'Delivered',
      fulfillment: 'Chilled Van (0-4°C)',
      paymentStatus: 'Net-30 Invoiced',
      grandTotal: 22500,
      batchIds: ['BATCH-2026-MEAT4'],
      weightAdjustments: [
        { estWeightKg: 60.0, actualWeightKg: 58.4, adjAmountKsh: -640, status: 'Credited' }
      ]
    },
    {
      id: 'CHX-6604',
      date: '2026-07-31',
      customerName: 'Grace Wanjiku',
      email: 'grace.wanjiku@gmail.com',
      buyerType: 'retail',
      items: [
        { product: { name: 'Kienyeji Table Eggs (30 Pack)' }, quantity: 5, fulfillmentGroup: 'dry-ambient' }
      ],
      deliverySlots: { 'dry-ambient': 'Standard Parcel Delivery (24-48 Hours)' },
      status: 'Guarantee Window Open',
      fulfillment: 'Standard Delivery',
      paymentStatus: 'Paid (Card)',
      grandTotal: 2250,
      batchIds: ['BATCH-2026-EGGS1'],
      weightAdjustments: []
    }
  ];

  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_orders');
    if (saved) return JSON.parse(saved);
    
    // merge with userOrders from App
    const appUserOrders = userOrders.map(u => ({
      id: u.id,
      date: u.date,
      customerName: currentUser?.name || 'Customer',
      email: currentUser?.email || 'customer@chickmagnet.co.ke',
      buyerType: 'retail',
      items: [{ product: { name: u.items }, quantity: 1, fulfillmentGroup: 'live-climate' }],
      deliverySlots: u.deliverySlots || { 'live-climate': u.eta || 'Standard Slot' },
      status: u.status || 'Placed',
      fulfillment: u.fulfillment || 'Express Transport',
      paymentStatus: 'Paid',
      grandTotal: u.total || 5000,
      batchIds: [u.batchId || 'BATCH-2026-CHX9'],
      weightAdjustments: []
    }));

    return [...appUserOrders, ...INITIAL_ORDERS];
  });

  const handleAdvanceOrderStatus = (orderId: string, newStatus: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        logAction(currentUser?.name || 'Admin', 'Order Status Update', `Order ${orderId}`, o.status, newStatus);
        return { ...o, status: newStatus };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('chickmagnet_admin_orders', JSON.stringify(updated));
    if (onUpdateOrderStatus) onUpdateOrderStatus(orderId, newStatus);
  };

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState('all');
  const [orderBuyerFilter, setOrderBuyerFilter] = useState('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);

  // Claims State
  const [claims, setClaims] = useState<MortalityClaim[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });
  const [selectedClaimModal, setSelectedClaimModal] = useState<MortalityClaim | null>(null);
  const [claimResolutionNote, setClaimResolutionNote] = useState('');

  const handleResolveClaim = (claimId: string, newStatus: 'approved_credit' | 'approved_replacement' | 'rejected', creditAmt?: number) => {
    const updated = claims.map(c => {
      if (c.id === claimId) {
        logAction(currentUser?.name || 'Admin', 'Claim Resolution', `Claim ${claimId}`, c.status, `${newStatus} (${claimResolutionNote})`);
        return { ...c, status: newStatus, refundAmount: creditAmt || c.refundAmount };
      }
      return c;
    });
    setClaims(updated);
    localStorage.setItem('chickmagnet_admin_claims', JSON.stringify(updated));
    setSelectedClaimModal(null);
    setClaimResolutionNote('');
  };

  // Wholesale Accounts State
  const [wholesaleAccounts, setWholesaleAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_wholesale');
    return saved ? JSON.parse(saved) : INITIAL_WHOLESALE_ACCOUNTS;
  });

  const handleApproveWholesaleAccount = (accId: string, limitKsh: number) => {
    const updated = wholesaleAccounts.map(a => {
      if (a.id === accId) {
        logAction(currentUser?.name || 'Admin', 'Wholesale Approval', `Account ${a.companyName}`, a.net30Status, `Approved (Limit Ksh ${limitKsh.toLocaleString()})`);
        return { ...a, net30Status: 'approved', creditLimitKsh: limitKsh };
      }
      return a;
    });
    setWholesaleAccounts(updated);
    localStorage.setItem('chickmagnet_admin_wholesale', JSON.stringify(updated));
  };

  // Trust Badges State
  const [badges, setBadges] = useState<any[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });
  const [isAddBadgeModal, setIsAddBadgeModal] = useState(false);
  const [newBadge, setNewBadge] = useState({ name: '', category: 'Standards', number: '', expiryDate: '', icon: '🛡️', issuer: '' });

  const handleSaveBadge = () => {
    if (!newBadge.name || !newBadge.expiryDate) return;
    const isExpired = new Date(newBadge.expiryDate) < new Date();
    const created = {
      id: `badge-${Date.now()}`,
      ...newBadge,
      status: isExpired ? 'expired' : 'active'
    };
    const updated = [...badges, created];
    setBadges(updated);
    localStorage.setItem('chickmagnet_admin_badges', JSON.stringify(updated));
    logAction(currentUser?.name || 'Admin', 'Badge Created', `Trust Badge: ${newBadge.name}`, 'None', created.status);
    setIsAddBadgeModal(false);
    setNewBadge({ name: '', category: 'Standards', number: '', expiryDate: '', icon: '🛡️', issuer: '' });
  };

  // Batches State
  const [batches, setBatches] = useState<BatchTraceabilityRecord[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_batches');
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });
  const [isAddBatchModal, setIsAddBatchModal] = useState(false);
  const [newBatch, setNewBatch] = useState<Partial<BatchTraceabilityRecord>>({
    batchId: `BATCH-2026-CHX${Math.floor(10 + Math.random() * 90)}`,
    farmName: 'ChickMagnet Bio-Hatchery',
    location: 'Naivasha Basin',
    breedOrCut: 'Kenbro Day-Old Chicks',
    hatchOrSlaughterDate: new Date().toISOString().split('T')[0],
    feedSupplier: 'ChickMagnet Starter Pellets',
    vaccinationHistory: [{ vaccine: "Marek's HVT", dateAdministered: new Date().toISOString().split('T')[0] }],
    labTestStatus: 'NEGATIVE (Passed Salmonella & Avian Flu)',
    kebsLicenseNo: 'KEBS/PV-88392/2025',
    dvsCertNo: 'DVS-NAI-9921',
    veterinarySignOff: 'Dr. J. Karanja (DVM License #1128)',
    temperatureLog: '37.8°C Controlled'
  });

  const handleSaveBatch = () => {
    if (!newBatch.batchId) return;
    const updated = [newBatch as BatchTraceabilityRecord, ...batches];
    setBatches(updated);
    localStorage.setItem('chickmagnet_admin_batches', JSON.stringify(updated));
    logAction(currentUser?.name || 'Admin', 'Batch Created', `Hatchery/Pack Batch ${newBatch.batchId}`, 'None', newBatch.breedOrCut || 'Batch Record');
    setIsAddBatchModal(false);
  };

  // CMS No-Code Website Editor State
  const [cmsDrafts, setCmsDrafts] = useState<Record<string, string>>({
    hero_headline: 'Direct-from-Hatchery Day-Old Chicks & Cold-Chain Dressed Poultry',
    hero_subhead: 'Bio-secure Kenbro & Kienyeji chicks, air-chilled cuts, and hatching eggs delivered via climate-controlled transit with 48-hour mortality guarantee.',
    hero_cta_text: 'Explore Fresh Hatch Catalog',
    announcement_bar: '🚚 Live Climate Vehicle Dispatch: Tuesday & Friday Mornings across Nairobi & Rift Valley',
    feature_1_title: 'Vaccinated & Health Certified',
    feature_1_desc: "Marek's & Newcastle vaccination records linked directly to verified hatchery batch IDs.",
    feature_2_title: '0-4°C Cold-Chain & Live Transit',
    feature_2_desc: 'Climate-controlled vehicles for live chick transport and air-chilled fresh poultry.',
    feature_3_title: 'Net-30 & Weight Invoicing',
    feature_3_desc: 'Commercial buyer terms with weight tolerance adjustments and bulk crate pricing.'
  });

  const [hasUnpublishedCmsChanges, setHasUnpublishedCmsChanges] = useState(false);
  const [cmsPublishModal, setCmsPublishModal] = useState(false);

  const handleCmsChange = (key: string, val: string) => {
    setCmsDrafts(prev => ({ ...prev, [key]: val }));
    setHasUnpublishedCmsChanges(true);
  };

  const handlePublishCmsChanges = () => {
    // Sync with CMS blocks
    Object.entries(cmsDrafts).forEach(([key, value]) => {
      updateCMSBlock(key, value, currentUser?.name || 'Master Admin');
    });
    setHasUnpublishedCmsChanges(false);
    setCmsPublishModal(false);
    logAction(currentUser?.name || 'Admin', 'Website CMS Published', 'Live Site Content Updated', 'Draft Version', 'Published Live');
  };

  // Product Add / Edit Modal State
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 150,
    wholesalePrice: 130,
    wholesaleMinQty: 50,
    category: 'live-birds',
    subCategory: 'day-old-chicks',
    stock: 500,
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    sellerName: 'ChickMagnet',
    sellerId: 'farm-1',
    sellerBadge: 'ChickMagnet Certified Hatchery',
    fulfillmentType: 'live-climate',
    tags: ['Chickens', 'Vaccinated'],
    rating: 4.9,
    reviewsCount: 12
  });

  const handleSaveProductForm = () => {
    if (!productForm.name || !productForm.price) return;

    if (isAddingNewProduct) {
      const createdProd: Product = {
        ...productForm,
        id: `prod-${Date.now()}`,
        name: productForm.name || 'New Product',
        description: productForm.description || '',
        price: Number(productForm.price),
        wholesalePrice: Number(productForm.wholesalePrice || productForm.price),
        wholesaleMinQty: Number(productForm.wholesaleMinQty || 50),
        category: productForm.category as MainCategory || 'live-birds',
        subCategory: productForm.subCategory as any || 'day-old-chicks',
        stock: Number(productForm.stock || 100),
        image: productForm.image || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
        sellerName: 'ChickMagnet',
        sellerId: 'farm-1',
        sellerBadge: 'ChickMagnet Bio-Hatchery',
        fulfillmentType: productForm.fulfillmentType as any || 'live-climate',
        tags: productForm.tags || ['Poultry'],
        rating: 5.0,
        reviewsCount: 1
      } as Product;

      onAddProduct(createdProd);
      logAction(currentUser?.name || 'Admin', 'Product Created', createdProd.name, 'None', `Price Ksh ${createdProd.price}`);
    } else if (selectedProductModal) {
      const updatedProd: Product = {
        ...selectedProductModal,
        ...productForm
      } as Product;

      onUpdateProduct(updatedProd);
      logAction(currentUser?.name || 'Admin', 'Product Updated', updatedProd.name, `Stock ${selectedProductModal.stock}`, `Stock ${updatedProd.stock}`);
    }

    setSelectedProductModal(null);
    setIsAddingNewProduct(false);
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status.toLowerCase().replace(/\s+/g, '_') === orderStatusFilter;
    const matchesBuyer = orderBuyerFilter === 'all' || o.buyerType === orderBuyerFilter;
    return matchesSearch && matchesStatus && matchesBuyer;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      
      {/* Admin Top Banner & Role Switcher Header */}
      <header className="sticky top-0 z-40 bg-[#07160e] border-b border-emerald-900/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 flex items-center justify-center font-black text-lg shadow-md overflow-hidden shrink-0">
              {brand.logoType === 'image' && brand.logoImageUrl ? (
                <img src={brand.logoImageUrl} alt={brand.brandName || 'Logo'} className="w-full h-full object-cover" />
              ) : (
                <span>{brand.logoEmoji || '🐔'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-amber-400">{brand.brandName || 'ChickMagnet'} Control Center</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                  Admin Platform v2.4
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">Track live orders, process claims & edit site copy without code</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap w-full md:w-auto justify-between md:justify-end">
            
            {/* Active Role Selector */}
            <div className="flex items-center gap-1.5 bg-[#0b2217] border border-emerald-800 rounded-xl px-2.5 py-1 text-xs">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 hidden sm:inline">Role:</span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as AdminRole)}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ADMIN" className="bg-[#0b2217] text-amber-300">Full Admin (Master)</option>
                <option value="CONTENT_EDITOR" className="bg-[#0b2217] text-amber-300">Content Editor</option>
                <option value="FULFILLMENT_STAFF" className="bg-[#0b2217] text-amber-300">Fulfillment Staff</option>
              </select>
            </div>

            {/* Draft Publish Status Indicator */}
            {hasUnpublishedCmsChanges && (
              <button
                onClick={() => setCmsPublishModal(true)}
                className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Unpublished Changes</span>
              </button>
            )}

            {/* Storefront Preview Button */}
            <button
              onClick={onOpenStorefrontPreview}
              className="flex items-center gap-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/80 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preview Storefront</span>
            </button>

            {/* Exit Admin Button */}
            <button
              onClick={onCloseAdmin}
              className="flex items-center gap-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation Sidebar / Tab Bar */}
      <div className="bg-[#091f14] border-b border-emerald-900/80 sticky top-[57px] z-30">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar py-2.5 flex items-center gap-6 text-xs">
          
          {/* Group 1: MONITORING & TRACKING */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-mono uppercase text-emerald-400/70 font-bold mr-1 tracking-wider hidden lg:inline">
              [ Tracking ]
            </span>
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('farm_ops')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer border border-emerald-500/60 ${
                activeTab === 'farm_ops' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/70'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Farm Operations (Internal)</span>
            </button>

            <button
              onClick={() => setActiveTab('business_plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer border border-amber-500/50 ${
                activeTab === 'business_plan' ? 'bg-amber-400 text-emerald-950 shadow-md font-black' : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Farm Business Plan Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'claims' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Claims ({claims.filter(c => c.status === 'pending_review').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'customers' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'analytics' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          <div className="h-4 w-px bg-emerald-800/80 shrink-0" />

          {/* Group 2: CONTENT & INVENTORY CONTROL */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-mono uppercase text-emerald-400/70 font-bold mr-1 tracking-wider hidden lg:inline">
              [ Content Control ]
            </span>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'products' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Inventory & SKUs</span>
            </button>

            <button
              onClick={() => setActiveTab('batches')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'batches' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Traceability Batches</span>
            </button>

            <button
              onClick={() => setActiveTab('website_cms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer relative ${
                activeTab === 'website_cms' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Website Copy (No-Code)</span>
              {hasUnpublishedCmsChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('badges')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'badges' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Trust Badges</span>
            </button>

            <button
              onClick={() => setActiveTab('audit_logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'audit_logs' ? 'bg-amber-400 text-emerald-950 shadow-md' : 'text-slate-300 hover:bg-emerald-900/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Dashboard Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* FARM OPERATIONS COMMAND MODULE */}
        {activeTab === 'farm_ops' && (
          <FarmOperationsModule />
        )}

        {/* 0. BUSINESS PLAN HUB SCREEN */}
        {activeTab === 'business_plan' && (
          <BusinessPlanHub />
        )}

        {/* 1. OVERVIEW SCREEN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div className="bg-[#0e271c] border border-emerald-800/80 rounded-2xl p-4 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
                  <span>Revenue Today</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300 font-serif">Ksh 1,480,000</div>
                <div className="text-[11px] text-emerald-300/80 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>+18.4% vs last week</span>
                </div>
              </div>

              <div className="bg-[#0e271c] border border-emerald-800/80 rounded-2xl p-4 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
                  <span>Orders in Pipeline</span>
                  <Truck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white font-serif">{orders.length} Active</div>
                <div className="text-[11px] text-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>2 Dispatched live vehicles</span>
                </div>
              </div>

              <div className="bg-[#0e271c] border border-emerald-800/80 rounded-2xl p-4 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
                  <span>Low Stock Alert</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-serif">
                  {products.filter(p => p.stock < 500).length} SKUs
                </div>
                <div className="text-[11px] text-slate-400">Requires replenishment</div>
              </div>

              <div className="bg-[#0e271c] border border-emerald-800/80 rounded-2xl p-4 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
                  <span>Pending Net-30</span>
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white font-serif">Ksh 420,000</div>
                <div className="text-[11px] text-amber-300">1 Overdue account flagged</div>
              </div>

              <div className="bg-[#0e271c] border border-emerald-800/80 rounded-2xl p-4 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
                  <span>Open Claims</span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300 font-serif">
                  {claims.filter(c => c.status === 'pending_review').length} Pending
                </div>
                <div className="text-[11px] text-emerald-300">Guarantee window open</div>
              </div>
            </div>

            {/* Overview Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Recent Orders Overview */}
              <div className="bg-[#0b2217] border border-emerald-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                  <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Recent Order Dispatches</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-emerald-300 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="bg-[#123524] p-3 rounded-xl border border-emerald-800/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-amber-300">{order.id}</div>
                        <div className="text-slate-300 font-medium">{order.customerName}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">{order.fulfillment}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-400">Ksh {order.grandTotal?.toLocaleString()}</div>
                        <span className="bg-emerald-900/80 text-emerald-200 border border-emerald-700/80 px-2 py-0.5 rounded text-[10px]">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claims Queue Quick Glance */}
              <div className="bg-[#0b2217] border border-emerald-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                  <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Pending Mortality Claims</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('claims')}
                    className="text-xs text-emerald-300 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    Review Queue →
                  </button>
                </div>

                <div className="space-y-3">
                  {claims.filter(c => c.status === 'pending_review').map(claim => (
                    <div key={claim.id} className="bg-[#123524] p-3 rounded-xl border border-emerald-800/60 space-y-1 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-amber-300 font-mono">{claim.id}</span>
                        <span className="text-rose-400 font-mono text-[10px]">{claim.affectedQty} Birds Lost</span>
                      </div>
                      <div className="text-slate-300 text-[11px] truncate">{claim.description}</div>
                      <div className="text-[10px] text-emerald-400 font-mono flex justify-between">
                        <span>Batch: {claim.batchId}</span>
                        <span className="text-amber-300">48h Window Open</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Audit Stream */}
              <div className="bg-[#0b2217] border border-emerald-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                  <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Live Audit Activity</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('audit_logs')}
                    className="text-xs text-emerald-300 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    Audit Log →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {auditLogs.slice(0, 4).map(log => (
                    <div key={log.id} className="text-xs border-b border-emerald-900/60 pb-2 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                        <span>{log.user}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="text-slate-200 font-bold">{log.detail}</div>
                      <div className="text-[10px] text-amber-300/80 font-mono">
                        {log.oldValue} → <strong className="text-amber-300">{log.newValue}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDER TRACKING & PIPELINE */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0b2217] p-4 rounded-2xl border border-emerald-800">
              <div>
                <h2 className="text-lg font-bold text-amber-300 font-serif">Order Tracking & Logistics Pipeline</h2>
                <p className="text-xs text-emerald-300/80">Manage live bird dispatches, weight adjustments, and Net-30 commercial invoicing.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order ID / Name"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#123524] border border-emerald-700/80 rounded-xl text-xs text-slate-100 placeholder-emerald-400/60 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#123524] border border-emerald-700/80 text-amber-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Pipeline Statuses</option>
                  <option value="placed">Placed</option>
                  <option value="packed/weighed">Packed / Weighed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="guarantee_window_open">Guarantee Window Open</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={orderBuyerFilter}
                  onChange={(e) => setOrderBuyerFilter(e.target.value)}
                  className="bg-[#123524] border border-emerald-700/80 text-amber-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Buyer Types</option>
                  <option value="retail">Retail Buyers</option>
                  <option value="wholesale">Wholesale Net-30</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#0b2217] border border-emerald-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-[#123524] text-amber-300 uppercase font-mono text-[10px] border-b border-emerald-800">
                    <tr>
                      <th className="p-3.5">Order ID & Date</th>
                      <th className="p-3.5">Customer & Type</th>
                      <th className="p-3.5">Fulfillment Group</th>
                      <th className="p-3.5">Total & Payment</th>
                      <th className="p-3.5">Current Status</th>
                      <th className="p-3.5 text-right">Pipeline Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/60">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="p-3.5 font-mono">
                          <button
                            onClick={() => setSelectedOrderModal(order)}
                            className="font-bold text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>{order.id}</span>
                            <Eye className="w-3 h-3 text-emerald-400" />
                          </button>
                          <div className="text-[10px] text-emerald-400/80">{order.date}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-100">{order.customerName}</div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            order.buyerType === 'wholesale' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-900/80 text-emerald-300'
                          }`}>
                            {order.buyerType}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="text-emerald-200 font-medium">{order.fulfillment}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Batch: {order.batchIds?.[0] || 'N/A'}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-amber-300 font-mono">Ksh {order.grandTotal?.toLocaleString()}</div>
                          <div className="text-[10px] text-emerald-400 font-medium">{order.paymentStatus}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="bg-emerald-950 text-amber-300 border border-emerald-700 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono">
                            {order.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5">
                          {order.status === 'Placed' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Packed / Weighed')}
                              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                            >
                              Pack & Weigh
                            </button>
                          )}
                          {order.status === 'Packed / Weighed' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Dispatched')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                            >
                              Dispatch Vehicle
                            </button>
                          )}
                          {order.status === 'Dispatched' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Delivered')}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {order.status === 'Delivered' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Guarantee Window Open')}
                              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                            >
                              Start 48h Guarantee
                            </button>
                          )}
                          {order.status === 'Guarantee Window Open' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Closed')}
                              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                            >
                              Close Order
                            </button>
                          )}
                          {order.status === 'Closed' && (
                            <span className="text-[10px] text-slate-500 font-mono">Complete</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CLAIMS & GUARANTEES TRACKING */}
        {activeTab === 'claims' && (
          <div className="space-y-5">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-amber-300 font-serif">Mortality & Weight Claims Queue</h2>
                <p className="text-xs text-emerald-300/80">Review photo evidence and issue replacement batches or store credit under the 48-hour live bird guarantee.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claims.map(claim => (
                <div key={claim.id} className="bg-[#0b2217] border border-emerald-800 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex justify-between items-start border-b border-emerald-800/80 pb-2">
                    <div>
                      <span className="font-mono font-bold text-amber-300 text-sm">{claim.id}</span>
                      <div className="text-xs text-emerald-400">Order: <strong className="text-white font-mono">{claim.orderId}</strong></div>
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold uppercase ${
                      claim.status === 'pending_review' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      claim.status === 'approved_credit' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <img
                      src={claim.photoEvidenceUrl}
                      alt="Claim photo"
                      className="w-20 h-20 rounded-xl object-cover border border-emerald-700/80 shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-100">{claim.breed}</div>
                      <div className="text-rose-400 font-bold">{claim.affectedQty} Birds Affected</div>
                      <div className="text-slate-300 text-[11px]">{claim.description}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Submitted: {claim.claimDate}</div>
                    </div>
                  </div>

                  {claim.status === 'pending_review' && (
                    <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResolveClaim(claim.id, 'approved_credit', 1620)}
                        className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        Approve Store Credit
                      </button>
                      <button
                        onClick={() => handleResolveClaim(claim.id, 'approved_replacement')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        Approve Replacement
                      </button>
                      <button
                        onClick={() => handleResolveClaim(claim.id, 'rejected')}
                        className="bg-rose-900 hover:bg-rose-800 text-rose-200 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CUSTOMERS & NET-30 WHOLESALE */}
        {activeTab === 'customers' && (
          <div className="space-y-5">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-amber-300 font-serif">Customer Directory & Commercial Net-30 Approval</h2>
                <p className="text-xs text-emerald-300/80">Approve credit limits for commercial HORECA accounts and monitor overdue invoices.</p>
              </div>
            </div>

            <div className="bg-[#0b2217] border border-emerald-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#123524] text-amber-300 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5">Company / Buyer</th>
                    <th className="p-3.5">Contact & Email</th>
                    <th className="p-3.5">Credit Limit & Usage</th>
                    <th className="p-3.5">Net-30 Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/60">
                  {wholesaleAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-emerald-900/30">
                      <td className="p-3.5">
                        <div className="font-bold text-amber-300">{acc.companyName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{acc.phone}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-100">{acc.contactPerson}</div>
                        <div className="text-[10px] text-emerald-400">{acc.email}</div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-amber-300">
                          Ksh {acc.creditUsedKsh?.toLocaleString()} / Ksh {acc.creditLimitKsh?.toLocaleString()}
                        </div>
                        {acc.overdueAmountKsh > 0 && (
                          <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            OVERDUE: Ksh {acc.overdueAmountKsh.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          acc.net30Status === 'approved' ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {acc.net30Status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {acc.net30Status === 'pending_approval' && (
                          <button
                            onClick={() => handleApproveWholesaleAccount(acc.id, 500000)}
                            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3 py-1 rounded-lg text-xs cursor-pointer"
                          >
                            Grant Ksh 500k Net-30
                          </button>
                        )}
                        {acc.net30Status === 'approved' && (
                          <button
                            onClick={() => alert(`Sending Net-30 invoice reminder statement to ${acc.email}`)}
                            className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer"
                          >
                            Send Statement
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800">
              <h2 className="text-lg font-bold text-amber-300 font-serif">Platform Analytics & Mortality Ratios</h2>
              <p className="text-xs text-emerald-300/80">Monitor revenue splits, category performance, and bio-security claim ratios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-[#0b2217] border border-emerald-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-amber-300 text-sm">Revenue Distribution by Category</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Live Birds (Day-Old Chicks & Pullets)</span>
                      <strong className="text-amber-300">42% (Ksh 2,450,000)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[42%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Fresh & Dressed Poultry (Air-Chilled)</span>
                      <strong className="text-amber-300">35% (Ksh 2,040,000)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[35%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Eggs (Hatching & Table Eggs)</span>
                      <strong className="text-amber-300">15% (Ksh 875,000)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full w-[15%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Farm Supplies & Feeds</span>
                      <strong className="text-amber-300">8% (Ksh 460,000)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full w-[8%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mortality Ratios */}
              <div className="bg-[#0b2217] border border-emerald-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-amber-300 text-sm">Bio-Security Operational Health Ratio</h3>
                
                <div className="bg-[#123524] p-4 rounded-xl border border-emerald-700/80 space-y-2">
                  <div className="text-xs text-emerald-300">Live Bird Mortality Claim Rate</div>
                  <div className="text-3xl font-black text-amber-300 font-serif">0.42%</div>
                  <div className="text-[11px] text-emerald-300">Well below the 2.0% industry bio-security maximum threshold.</div>
                </div>

                <div className="bg-[#123524] p-4 rounded-xl border border-emerald-700/80 space-y-2">
                  <div className="text-xs text-emerald-300">Wholesale Net-30 Repeat Order Rate</div>
                  <div className="text-3xl font-black text-emerald-300 font-serif">84.5%</div>
                  <div className="text-[11px] text-emerald-300">Standing order renewals active across HORECA buyers.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. INVENTORY & PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-amber-300 font-serif">Product Catalog & Inventory SKUs</h2>
                <p className="text-xs text-emerald-300/80">Edit live bird pricing, stock levels, and vaccination payloads.</p>
              </div>

              <button
                onClick={() => {
                  setIsAddingNewProduct(true);
                  setSelectedProductModal({} as Product);
                  setProductForm({
                    name: '',
                    description: '',
                    price: 150,
                    wholesalePrice: 130,
                    stock: 500,
                    category: 'live-birds'
                  });
                }}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New SKU</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-[#0b2217] border border-emerald-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase bg-emerald-900 text-amber-300 px-2 py-0.5 rounded font-bold">
                        {product.category}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        product.stock < 500 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-emerald-300'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="font-bold text-slate-100 text-sm leading-snug">{product.name}</div>
                    <div className="text-xs text-amber-300 font-bold font-mono">
                      Ksh {product.price} <span className="text-slate-400 text-[10px]">(Wholesale: Ksh {product.wholesalePrice || product.price})</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedProductModal(product);
                        setIsAddingNewProduct(false);
                        setProductForm(product);
                      }}
                      className="text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit SKU</span>
                    </button>

                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-rose-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TRACEABILITY BATCHES */}
        {activeTab === 'batches' && (
          <div className="space-y-5">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-amber-300 font-serif">Hatchery & Pack Batch Traceability IDs</h2>
                <p className="text-xs text-emerald-300/80">Create and bind vaccination records, DVS veterinary clearances, and incubation logs to batch codes.</p>
              </div>

              <button
                onClick={() => setIsAddBatchModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Batch ID</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map(batch => (
                <div key={batch.batchId} className="bg-[#0b2217] border border-emerald-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                    <span className="font-mono font-bold text-amber-300 text-sm">{batch.batchId}</span>
                    <span className="text-[10px] text-emerald-300 font-mono">{batch.hatchOrSlaughterDate}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-100 font-bold">{batch.breedOrCut}</div>
                    <div className="text-emerald-300">Farm: {batch.farmName}</div>
                    <div className="text-slate-300 text-[11px] font-mono">Vet Inspector: {batch.veterinarySignOff}</div>
                    <div className="text-emerald-400 font-bold text-[10px] bg-emerald-950 p-2 rounded-lg border border-emerald-800 mt-2">
                      Lab Status: {batch.labTestStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. WEBSITE COPY (NO-CODE CMS) */}
        {activeTab === 'website_cms' && (
          <div className="space-y-5">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-amber-300 font-serif">No-Code Website & Brand Identity Editor</h2>
                <p className="text-xs text-emerald-300/80">Update brand logo, platform name, hero headlines, and value propositions live across the marketplace.</p>
              </div>

              <button
                onClick={() => setCmsPublishModal(true)}
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish Copy Changes</span>
              </button>
            </div>

            {/* BRAND LOGO & IDENTITY MANAGER CARD */}
            <div className="bg-[#0b2217] border-2 border-amber-500/50 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-amber-300 font-serif">Brand Logo & Platform Identity</h3>
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-400/30 uppercase font-bold">Live Global Sync</span>
                  </div>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    Upload your company logo image file or pick an icon. Any change updates the header, footer, admin, and receipts instantly.
                  </p>
                </div>

                {/* Live Realtime Header Preview Box */}
                <div className="bg-[#123524] border border-emerald-700/80 rounded-xl p-3 flex items-center gap-3 shrink-0 shadow-inner max-w-full overflow-hidden">
                  <div className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider mr-1 shrink-0">
                    Live Header Preview:
                  </div>
                  <div className="flex items-center gap-2.5">
                    {logoType === 'image' && logoImageUrl && logoDisplayMode === 'image_only' ? (
                      <img src={logoImageUrl} alt="Logo Preview" className="h-9 max-w-[180px] object-contain rounded-lg drop-shadow" />
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 flex items-center justify-center font-black text-lg shadow-inner overflow-hidden shrink-0">
                          {logoType === 'image' && logoImageUrl ? (
                            <img src={logoImageUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span>{logoEmoji || '🐔'}</span>
                          )}
                        </div>
                        <span className="font-serif text-lg font-black text-amber-400 tracking-tight">
                          {brandName || 'ChickMagnet'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Column 1: Logo Type & Display Mode */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-emerald-300 font-bold mb-1.5">Platform Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. ChickMagnet"
                      className="w-full bg-[#123524] border border-emerald-700 rounded-xl p-2.5 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-300 font-bold mb-1.5">Logo Format & Display Style</label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLogoType('image');
                          setLogoDisplayMode('image_only');
                        }}
                        className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between gap-2 border cursor-pointer transition-all ${
                          logoType === 'image' && logoDisplayMode === 'image_only'
                            ? 'bg-amber-400 text-emerald-950 border-amber-300 font-extrabold shadow-md' 
                            : 'bg-[#123524] text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Uploaded Image Logo (Image Only)</span>
                        </span>
                        <span className="text-[10px] font-mono opacity-80">Replaces text with graphic</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLogoType('image');
                          setLogoDisplayMode('image_with_text');
                        }}
                        className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between gap-2 border cursor-pointer transition-all ${
                          logoType === 'image' && logoDisplayMode === 'image_with_text'
                            ? 'bg-amber-400 text-emerald-950 border-amber-300 font-extrabold shadow-md' 
                            : 'bg-[#123524] text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Image Icon + Brand Name Text</span>
                        </span>
                        <span className="text-[10px] font-mono opacity-80">Square badge + text</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLogoType('emoji');
                          setLogoDisplayMode('emoji_with_text');
                        }}
                        className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between gap-2 border cursor-pointer transition-all ${
                          logoType === 'emoji' 
                            ? 'bg-amber-400 text-emerald-950 border-amber-300 font-extrabold shadow-md' 
                            : 'bg-[#123524] text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>🐔 Emoji Icon + Brand Name Text</span>
                        </span>
                        <span className="text-[10px] font-mono opacity-80">Emoji badge + text</span>
                      </button>
                    </div>
                  </div>

                  {/* Preset Emoji Options if mode is emoji */}
                  {logoType === 'emoji' && (
                    <div className="space-y-2 bg-[#123524] p-3.5 rounded-xl border border-emerald-700">
                      <label className="block text-amber-300 font-bold">Pick Preset Icon or Custom Emoji</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['🐔', '🐣', '🐓', '🥚', '🌾', '🚜', '🦅', '🐥', '👑', '🛡️'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setLogoEmoji(emoji)}
                            className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-transform cursor-pointer ${
                              logoEmoji === emoji ? 'bg-amber-400 text-emerald-950 scale-110 shadow-lg font-black' : 'bg-[#0b2217] hover:bg-emerald-800/80 text-white'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <label className="block text-[11px] text-emerald-400 mb-1">Or Type Custom Emoji Symbol</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={logoEmoji}
                          onChange={(e) => setLogoEmoji(e.target.value)}
                          className="w-24 bg-[#0b2217] border border-emerald-800 rounded-lg p-2 text-center text-xl text-amber-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Custom Image Upload / URL Controls */}
                <div className="space-y-4">
                  <div className="space-y-3 bg-[#123524] p-4 rounded-xl border border-emerald-700">
                    <div className="flex items-center justify-between">
                      <label className="block text-amber-300 font-bold">Upload Brand Logo Image</label>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-mono">PNG / JPG / WEBP / SVG</span>
                    </div>

                    {/* File Dropzone Input */}
                    <div className="relative border-2 border-dashed border-emerald-600/80 hover:border-amber-400 rounded-xl p-4 text-center bg-[#0b2217]/80 hover:bg-[#0b2217] transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                        <Upload className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-amber-300">Click or Drag & Drop Logo Image File</span>
                        <span className="text-[10px] text-emerald-400/80">Select any graphic file from your computer (Max 3MB)</span>
                      </div>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-emerald-800"></div>
                      <span className="flex-shrink mx-2 text-[10px] text-emerald-400 font-mono">OR PASTE WEB URL</span>
                      <div className="flex-grow border-t border-emerald-800"></div>
                    </div>

                    <div>
                      <input
                        type="url"
                        value={logoImageUrl}
                        onChange={(e) => {
                          setLogoImageUrl(e.target.value);
                          setLogoType('image');
                        }}
                        placeholder="https://example.com/my-company-logo.png"
                        className="w-full bg-[#0b2217] border border-emerald-800 rounded-xl p-2.5 text-amber-200 font-mono text-[11px] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {logoImageUrl && (
                      <div className="bg-[#0b2217] p-3 rounded-xl border border-emerald-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-amber-300 font-bold">Uploaded Image Preview:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setLogoImageUrl('');
                              setLogoType('emoji');
                              setLogoDisplayMode('emoji_with_text');
                            }}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
                        <div className="h-16 w-full bg-[#123524] rounded-lg p-2 flex items-center justify-center border border-emerald-700/60 overflow-hidden">
                          <img src={logoImageUrl} alt="Uploaded Brand Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Action */}
              <div className="pt-3 border-t border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                {logoSavedSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-300 font-bold bg-emerald-950 border border-emerald-700 px-3.5 py-2 rounded-xl text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Logo & Brand Settings Saved Live! All site headers updated.</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-400/80">
                    Clicking save updates the logo and brand title across all sessions immediately.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSaveBrandLogo}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Update Logo Everywhere</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0b2217] border border-emerald-800 rounded-2xl p-6 space-y-6">
              
              {/* Hero Section Copy */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-amber-300 border-b border-emerald-800 pb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Homepage Hero Section Copy</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-emerald-300 font-bold mb-1">Hero Main Headline</label>
                    <input
                      type="text"
                      value={cmsDrafts.hero_headline}
                      onChange={(e) => handleCmsChange('hero_headline', e.target.value)}
                      className="w-full bg-[#123524] border border-emerald-700 rounded-xl p-2.5 text-amber-300 font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-300 font-bold mb-1">Hero Subhead Description</label>
                    <textarea
                      rows={2}
                      value={cmsDrafts.hero_subhead}
                      onChange={(e) => handleCmsChange('hero_subhead', e.target.value)}
                      className="w-full bg-[#123524] border border-emerald-700 rounded-xl p-2.5 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-300 font-bold mb-1">Announcement Top Banner</label>
                    <input
                      type="text"
                      value={cmsDrafts.announcement_bar}
                      onChange={(e) => handleCmsChange('announcement_bar', e.target.value)}
                      className="w-full bg-[#123524] border border-emerald-700 rounded-xl p-2.5 text-amber-200 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Cards Copy */}
              <div className="space-y-4 pt-4 border-t border-emerald-800">
                <h3 className="text-sm font-bold text-amber-300 border-b border-emerald-800 pb-2">Value Proposition Feature Cards</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700 space-y-2">
                    <label className="font-bold text-amber-300 block">Card 1 Title</label>
                    <input
                      type="text"
                      value={cmsDrafts.feature_1_title}
                      onChange={(e) => handleCmsChange('feature_1_title', e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-800 p-2 rounded text-slate-100"
                    />
                    <textarea
                      rows={2}
                      value={cmsDrafts.feature_1_desc}
                      onChange={(e) => handleCmsChange('feature_1_desc', e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-800 p-2 rounded text-slate-300 text-[11px]"
                    />
                  </div>

                  <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700 space-y-2">
                    <label className="font-bold text-amber-300 block">Card 2 Title</label>
                    <input
                      type="text"
                      value={cmsDrafts.feature_2_title}
                      onChange={(e) => handleCmsChange('feature_2_title', e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-800 p-2 rounded text-slate-100"
                    />
                    <textarea
                      rows={2}
                      value={cmsDrafts.feature_2_desc}
                      onChange={(e) => handleCmsChange('feature_2_desc', e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-800 p-2 rounded text-slate-300 text-[11px]"
                    />
                  </div>

                  <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700 space-y-2">
                    <label className="font-bold text-amber-300 block">Card 3 Title</label>
                    <input
                      type="text"
                      value={cmsDrafts.feature_3_title}
                      onChange={(e) => handleCmsChange('feature_3_title', e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-800 p-2 rounded text-slate-100"
                    />
                    <textarea
                      rows={2}
                      value={cmsDrafts.feature_3_desc}
                      onChange={(e) => handleCmsChange('feature_3_desc', e.target.value)}
                      className="w-full bg-[#0b2217] border border-emerald-800 p-2 rounded text-slate-300 text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. TRUST BADGES & CERTIFICATIONS */}
        {activeTab === 'badges' && (
          <div className="space-y-5">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-amber-300 font-serif">Certification & Trust Badge Manager</h2>
                <p className="text-xs text-emerald-300/80">Manage bio-security licenses and automatically flag expired health certificates.</p>
              </div>

              <button
                onClick={() => setIsAddBadgeModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="bg-[#0b2217] border border-emerald-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <div className="font-bold text-amber-300 text-sm">{badge.name}</div>
                        <div className="text-xs text-emerald-400">{badge.issuer}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      badge.status === 'expired' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                    }`}>
                      {badge.status === 'expired' ? '⚠️ EXPIRED — FLAGGED' : 'VALID & DISPLAYED'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 font-mono pt-2 border-t border-emerald-800/80">
                    <div className="text-slate-300">License #: {badge.number}</div>
                    <div className="text-amber-300">Expiry Date: {badge.expiryDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. AUDIT LOGS */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-5">
            <div className="bg-[#0b2217] p-4 rounded-2xl border border-emerald-800">
              <h2 className="text-lg font-bold text-amber-300 font-serif">Security & System Audit Log</h2>
              <p className="text-xs text-emerald-300/80">Full audit trail of price modifications, content updates, and Net-30 credit limit grants.</p>
            </div>

            <div className="bg-[#0b2217] border border-emerald-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#123524] text-amber-300 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">User Role</th>
                    <th className="p-3.5">Action Category</th>
                    <th className="p-3.5">Detail</th>
                    <th className="p-3.5">Old → New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/60">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-emerald-900/30">
                      <td className="p-3.5 font-mono text-[11px] text-emerald-400">{log.timestamp}</td>
                      <td className="p-3.5 font-bold text-slate-100">{log.user}</td>
                      <td className="p-3.5 text-amber-300 font-mono text-[11px]">{log.action}</td>
                      <td className="p-3.5">{log.detail}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-300">
                        {log.oldValue} → <strong className="text-amber-300">{log.newValue}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: ORDER DETAIL MODAL */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b2217] border border-emerald-800 rounded-3xl max-w-xl w-full p-6 space-y-4 text-xs text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-300">Order Detail: {selectedOrderModal.id}</h3>
                <p className="text-[11px] text-emerald-400 font-mono">Date: {selectedOrderModal.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700/80 space-y-1">
                <div className="font-bold text-slate-100">{selectedOrderModal.customerName}</div>
                <div className="text-[11px] text-emerald-300">{selectedOrderModal.email}</div>
                <div className="text-[10px] text-amber-300 font-mono">Fulfillment: {selectedOrderModal.fulfillment}</div>
              </div>

              {/* Weight Adjustment History if present */}
              {selectedOrderModal.weightAdjustments?.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1 text-amber-200">
                  <div className="font-bold text-xs">Weight Adjustment Record</div>
                  {selectedOrderModal.weightAdjustments.map((wa: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[11px] font-mono">
                      <span>Est: {wa.estWeightKg}kg → Actual: {wa.actualWeightKg}kg</span>
                      <strong className="text-amber-300">{wa.adjAmountKsh} Ksh ({wa.status})</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery Slots */}
              <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700/80 space-y-1">
                <div className="font-bold text-amber-300 text-xs">Assigned Vehicle Slots</div>
                {Object.entries(selectedOrderModal.deliverySlots || {}).map(([grp, slot]: any) => (
                  <div key={grp} className="flex justify-between text-[11px] text-emerald-200 font-mono">
                    <span className="uppercase">{grp}:</span>
                    <strong className="text-amber-300">{slot}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-800 flex justify-between items-center">
              <span className="font-bold text-amber-300 text-sm">Total: Ksh {selectedOrderModal.grandTotal?.toLocaleString()}</span>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT MODAL */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b2217] border border-emerald-800 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs text-slate-100 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-amber-300">
                {isAddingNewProduct ? 'Add New Product SKU' : `Edit Product: ${selectedProductModal.name}`}
              </h3>
              <button
                onClick={() => setSelectedProductModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl text-amber-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-300 font-bold mb-1">Retail Price (Ksh)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl font-mono text-amber-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-bold mb-1">Wholesale Price (Ksh)</label>
                  <input
                    type="number"
                    value={productForm.wholesalePrice}
                    onChange={(e) => setProductForm({ ...productForm, wholesalePrice: Number(e.target.value) })}
                    className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl font-mono text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-300 font-bold mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as MainCategory })}
                    className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl text-amber-300 font-bold"
                  >
                    <option value="live-birds">Live Birds</option>
                    <option value="fresh-poultry">Fresh & Whole Poultry</option>
                    <option value="processed">Processed & Value-Added</option>
                    <option value="eggs">Eggs</option>
                    <option value="farm-supplies">Farm Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-emerald-300 font-bold mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl text-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-800 flex justify-between">
              <button
                onClick={() => setSelectedProductModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProductForm}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-4 py-2 rounded-xl shadow-md cursor-pointer"
              >
                Save SKU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PUBLISH CMS DRAFTS CONFIRMATION MODAL */}
      {cmsPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b2217] border border-emerald-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <Sparkles className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold">Publish Website Copy to Live Site</h3>
            </div>

            <p className="text-slate-300">
              You are about to push draft copy updates live to all customers. This action will update hero headlines, top announcement bars, and value proposition cards instantly.
            </p>

            <div className="bg-[#123524] p-3 rounded-xl border border-emerald-700 space-y-1 font-mono text-[11px] text-amber-200">
              <div>Headline: "{cmsDrafts.hero_headline}"</div>
              <div>Top Banner: "{cmsDrafts.announcement_bar}"</div>
            </div>

            <div className="pt-3 border-t border-emerald-800 flex justify-end gap-2">
              <button
                onClick={() => setCmsPublishModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Keep Draft
              </button>
              <button
                onClick={handlePublishCmsChanges}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-5 py-2 rounded-xl shadow-md cursor-pointer"
              >
                Publish Live Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD TRACEABILITY BATCH MODAL */}
      {isAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b2217] border border-emerald-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-amber-300">Create Traceability Batch ID</h3>
              <button onClick={() => setIsAddBatchModal(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">Batch ID Code</label>
                <input
                  type="text"
                  value={newBatch.batchId}
                  onChange={(e) => setNewBatch({ ...newBatch, batchId: e.target.value })}
                  className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl font-mono text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">Breed / Cut Description</label>
                <input
                  type="text"
                  value={newBatch.breedOrCut}
                  onChange={(e) => setNewBatch({ ...newBatch, breedOrCut: e.target.value })}
                  className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">Lab Test & Health Clearance</label>
                <input
                  type="text"
                  value={newBatch.labTestStatus}
                  onChange={(e) => setNewBatch({ ...newBatch, labTestStatus: e.target.value })}
                  className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl text-emerald-300 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-800 flex justify-end gap-2">
              <button onClick={() => setIsAddBatchModal(false)} className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl">Cancel</button>
              <button onClick={handleSaveBatch} className="bg-amber-500 text-emerald-950 font-bold px-4 py-2 rounded-xl">Save Batch ID</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD TRUST BADGE MODAL */}
      {isAddBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b2217] border border-emerald-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-amber-300">Add Trust Certification Badge</h3>
              <button onClick={() => setIsAddBadgeModal(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">Certification Name</label>
                <input
                  type="text"
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                  placeholder="e.g. KEBS Food Quality Standard"
                  className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">License / Registration #</label>
                <input
                  type="text"
                  value={newBadge.number}
                  onChange={(e) => setNewBadge({ ...newBadge, number: e.target.value })}
                  placeholder="e.g. KEBS/PV-9011/2026"
                  className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newBadge.expiryDate}
                  onChange={(e) => setNewBadge({ ...newBadge, expiryDate: e.target.value })}
                  className="w-full bg-[#123524] border border-emerald-700 p-2 rounded-xl text-amber-300 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-800 flex justify-end gap-2">
              <button onClick={() => setIsAddBadgeModal(false)} className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl">Cancel</button>
              <button onClick={handleSaveBadge} className="bg-amber-500 text-emerald-950 font-bold px-4 py-2 rounded-xl">Save Badge</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
