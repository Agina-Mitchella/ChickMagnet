import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Truck, ShieldCheck, FileText, Activity, 
  Users, Settings, Plus, Edit3, Trash2, Eye, CheckCircle2, AlertTriangle, 
  Clock, Search, Filter, RefreshCw, Upload, Download, ArrowRight, Lock, 
  Key, Award, AlertCircle, HelpCircle, ChevronRight, Save, Globe, Sparkles, 
  PieChart, BarChart3, TrendingUp, DollarSign, Calendar, Mail, Building, 
  FileSpreadsheet, XCircle, Check, ArrowUpRight, Layers, Tag, Menu, X, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductGuide, BuyerType, MainCategory, MortalityClaim, BatchTraceabilityRecord, User } from '../types';
import { getStoredCMSData, updateCMSBlock, saveStoredCMSData, CMSBlock, getStoredBrandLogo, updateBrandLogo, useBrandLogo, compressImageDataUrl, getCMSValue, DEFAULT_BRAND_LOGO_IMAGE } from '../utils/cms';
import BusinessPlanHub from './BusinessPlanHub';
import FarmOperationsModule from './FarmOperationsModule';
import { getWholesaleMinimumForCategory } from '../utils/orderRules';
import {
  subscribeAdminOrders,
  updateOrderStatusInFirestore,
  subscribeClaims,
  saveClaimToFirestore,
  subscribeWholesale,
  saveWholesaleAccountToFirestore,
  subscribeBadges,
  saveBadgeToFirestore,
  subscribeBatches,
  saveBatchToFirestore,
  subscribeAuditLogs,
  saveAuditLogToFirestore
} from '../services/firestoreSync';

export type AdminRole = 'ADMIN' | 'CONTENT_EDITOR' | 'FULFILLMENT_STAFF';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (product: Product) => Promise<void>;
  onAddProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
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

  const handleSaveBrandLogo = async () => {
    let finalImageUrl = logoImageUrl;
    if (finalImageUrl && finalImageUrl.startsWith('data:image/') && finalImageUrl.length > 2.5 * 1024 * 1024 && !finalImageUrl.includes('image/svg+xml')) {
      finalImageUrl = await compressImageDataUrl(finalImageUrl, 1600);
      setLogoImageUrl(finalImageUrl);
    }
    await updateBrandLogo({
      logoType,
      logoDisplayMode,
      logoEmoji,
      logoImageUrl: finalImageUrl,
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
    if (file.size > 8 * 1024 * 1024) {
      alert('Selected image file is too large. Please select an image under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const rawDataUrl = reader.result;
        // Keep raw image data unless it is large (>2.5MB), in which case scale strictly preserving aspect ratio
        let finalUrl = rawDataUrl;
        if (file.size > 2.5 * 1024 * 1024 && !file.type.includes('svg')) {
          finalUrl = await compressImageDataUrl(rawDataUrl, 1600);
        }
        setLogoImageUrl(finalUrl);
        setLogoType('image');
        setLogoDisplayMode('image_only');
        await updateBrandLogo({
          logoType: 'image',
          logoDisplayMode: 'image_only',
          logoImageUrl: finalUrl,
          brandName
        }, currentUser?.name || 'Admin');
        logAction(
          currentUser?.name || 'Admin',
          'Logo Image Uploaded',
          `Uploaded brand logo file: ${file.name}`,
          brand.logoImageUrl ? 'Previous Image' : 'Default Logo',
          'New Uploaded Logo Image'
        );
        setLogoSavedSuccess(true);
        setTimeout(() => setLogoSavedSuccess(false), 3500);
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

  const [orders, setOrders] = useState<any[]>([]);

  // Claims State
  const [claims, setClaims] = useState<MortalityClaim[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  // Wholesale Accounts State
  const [wholesaleAccounts, setWholesaleAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_wholesale');
    return saved ? JSON.parse(saved) : INITIAL_WHOLESALE_ACCOUNTS;
  });

  // Trust Badges State
  const [badges, setBadges] = useState<any[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  // Batches State
  const [batches, setBatches] = useState<BatchTraceabilityRecord[]>(() => {
    const saved = localStorage.getItem('chickmagnet_admin_batches');
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  // Real-time Firestore Subscriptions for all Admin entities
  useEffect(() => {
    const unsubAudit = subscribeAuditLogs(setAuditLogs, INITIAL_AUDIT_LOGS);
    const unsubOrders = subscribeAdminOrders(setOrders);
    const unsubClaims = subscribeClaims(setClaims, INITIAL_CLAIMS);
    const unsubWholesale = subscribeWholesale(setWholesaleAccounts, INITIAL_WHOLESALE_ACCOUNTS);
    const unsubBadges = subscribeBadges(setBadges, INITIAL_BADGES);
    const unsubBatches = subscribeBatches(setBatches, INITIAL_BATCHES);

    return () => {
      unsubAudit();
      unsubOrders();
      unsubClaims();
      unsubWholesale();
      unsubBadges();
      unsubBatches();
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

    try {
      await updateOrderStatusInFirestore(orderId, newStatus);
      logAction(currentUser?.name || 'Admin', 'Order Status Update', `Order ${orderId}`, targetOrder.status, newStatus);
      if (onUpdateOrderStatus) onUpdateOrderStatus(orderId, newStatus);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The order status could not be updated.');
    }
  };

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState('all');
  const [orderBuyerFilter, setOrderBuyerFilter] = useState('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);

  const [selectedClaimModal, setSelectedClaimModal] = useState<MortalityClaim | null>(null);
  const [claimResolutionNote, setClaimResolutionNote] = useState('');

  const handleResolveClaim = (claimId: string, newStatus: 'approved_credit' | 'approved_replacement' | 'rejected', creditAmt?: number) => {
    const targetClaim = claims.find(c => c.id === claimId);
    if (targetClaim) {
      logAction(currentUser?.name || 'Admin', 'Claim Resolution', `Claim ${claimId}`, targetClaim.status, `${newStatus} (${claimResolutionNote})`);
      const updatedClaim = { ...targetClaim, status: newStatus, refundAmount: creditAmt || targetClaim.refundAmount };
      saveClaimToFirestore(updatedClaim);
    }
    setSelectedClaimModal(null);
    setClaimResolutionNote('');
  };

  const handleApproveWholesaleAccount = (accId: string, limitKsh: number) => {
    const targetAcc = wholesaleAccounts.find(a => a.id === accId);
    if (targetAcc) {
      logAction(currentUser?.name || 'Admin', 'Wholesale Approval', `Account ${targetAcc.companyName}`, targetAcc.net30Status, `Approved (Limit Ksh ${limitKsh.toLocaleString()})`);
      const updatedAcc = { ...targetAcc, net30Status: 'approved', creditLimitKsh: limitKsh };
      saveWholesaleAccountToFirestore(updatedAcc);
    }
  };

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
    saveBadgeToFirestore(created);
    logAction(currentUser?.name || 'Admin', 'Badge Created', `Trust Badge: ${newBadge.name}`, 'None', created.status);
    setIsAddBadgeModal(false);
    setNewBadge({ name: '', category: 'Standards', number: '', expiryDate: '', icon: '🛡️', issuer: '' });
  };

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
    const batchRecord = newBatch as BatchTraceabilityRecord;
    saveBatchToFirestore(batchRecord);
    logAction(currentUser?.name || 'Admin', 'Batch Created', `Hatchery/Pack Batch ${newBatch.batchId}`, 'None', newBatch.breedOrCut || 'Batch Record');
    setIsAddBatchModal(false);
  };

  // CMS No-Code Website Editor State
  const loadCmsDrafts = () => ({
    hero_headline: getCMSValue('hero_headline', 'Direct-from-Hatchery Day-Old Chicks & Cold-Chain Dressed Poultry'),
    hero_subhead: getCMSValue('hero_subhead', 'Bio-secure Kenbro & Kienyeji chicks, air-chilled cuts, and hatching eggs delivered via climate-controlled transit with 48-hour mortality guarantee.'),
    hero_cta_text: getCMSValue('hero_cta_text', 'Explore Fresh Hatch Catalog'),
    announcement_bar: getCMSValue('announcement_bar', '🚚 Live Climate Vehicle Dispatch: Tuesday & Friday Mornings across Nairobi & Rift Valley'),
    feature_1_title: getCMSValue('feature_1_title', 'Vaccinated & Health Certified'),
    feature_1_desc: getCMSValue('feature_1_desc', "Marek's & Newcastle vaccination records linked directly to verified hatchery batch IDs."),
    feature_2_title: getCMSValue('feature_2_title', '0-4°C Cold-Chain & Live Transit'),
    feature_2_desc: getCMSValue('feature_2_desc', 'Climate-controlled vehicles for live chick transport and air-chilled fresh poultry.'),
    feature_3_title: getCMSValue('feature_3_title', 'Net-30 & Weight Invoicing'),
    feature_3_desc: getCMSValue('feature_3_desc', 'Commercial buyer terms with weight tolerance adjustments and bulk crate pricing.')
  });

  const [cmsDrafts, setCmsDrafts] = useState<Record<string, string>>(loadCmsDrafts);
  const [hasUnpublishedCmsChanges, setHasUnpublishedCmsChanges] = useState(false);
  const [cmsPublishModal, setCmsPublishModal] = useState(false);

  useEffect(() => {
    const handleCmsUpdated = () => {
      if (!hasUnpublishedCmsChanges) {
        setCmsDrafts(loadCmsDrafts());
      }
    };
    window.addEventListener('sol_cms_updated', handleCmsUpdated);
    return () => window.removeEventListener('sol_cms_updated', handleCmsUpdated);
  }, [hasUnpublishedCmsChanges]);

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
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSaveError, setProductSaveError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    showOnStorefront: true,
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
        : category === 'processed'
          ? 'frozen-deep'
          : 'dry-ambient';

    setIsSavingProduct(true);
    setProductSaveError(null);

    try {
      if (isAddingNewProduct) {
        const createdProd: Product = {
          ...productForm,
          id: `prod-${Date.now()}`,
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          showOnStorefront: productForm.showOnStorefront ?? true,
          price: retailPrice,
          wholesalePrice: Number(productForm.wholesalePrice || retailPrice),
          wholesaleMinQty: getWholesaleMinimumForCategory(category),
          category,
          subCategory: productForm.subCategory as any || (category === 'eggs' ? 'table-eggs' : 'day-old-chicks'),
          stock,
          image,
          sellerName: 'ChickMagnet',
          sellerId: 'chickmagnet',
          sellerBadge: 'Sold by ChickMagnet',
          fulfillmentType,
          tags: productForm.tags || ['Chicken'],
          rating: 4.9,
          reviewsCount: 0
        } as Product;

        await onAddProduct(createdProd);
        logAction(currentUser?.name || 'Admin', 'Product Created', createdProd.name, 'None', `Price Ksh ${createdProd.price}`);
      } else if (selectedProductModal) {
        const updatedProd: Product = {
          ...selectedProductModal,
          ...productForm,
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: retailPrice,
          stock,
          image,
          category,
          fulfillmentType,
          sellerName: 'ChickMagnet',
          sellerId: 'chickmagnet',
          sellerBadge: 'Sold by ChickMagnet',
          wholesaleMinQty: getWholesaleMinimumForCategory(category)
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
    const confirmed = window.confirm(`Remove "${product.name}" from the catalog? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await onDeleteProduct(product.id);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The product could not be removed.');
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status.toLowerCase().replace(/\s+/g, '_') === orderStatusFilter;
    const matchesBuyer = orderBuyerFilter === 'all' || o.buyerType === orderBuyerFilter;
    return matchesSearch && matchesStatus && matchesBuyer;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingClaimsCount = claims.filter(c => c.status === 'pending_review').length;
  const lowStockCount = products.filter(p => p.stock < 500).length;

  const navSections = [
    {
      title: 'SITE SECTIONS',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
        { id: 'farm_ops', label: 'Farm Operations', icon: Activity, badge: 'Internal', badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { id: 'business_plan', label: 'Farm Business Plan', icon: Sparkles, badge: '2026', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
        { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag, badge: orders.length.toString(), badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { id: 'claims', label: 'Mortality Claims', icon: ShieldCheck, badge: pendingClaimsCount > 0 ? `${pendingClaimsCount} Pending` : null, badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
        { id: 'customers', label: 'Customers & Net-30', icon: Users, badge: wholesaleAccounts.length.toString(), badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { id: 'analytics', label: 'Sales & Analytics', icon: BarChart3, badge: null }
      ]
    },
    {
      title: 'INVENTORY & TRACEABILITY',
      items: [
        { id: 'products', label: 'Inventory & SKUs', icon: Layers, badge: lowStockCount > 0 ? `${lowStockCount} Low` : products.length.toString(), badgeColor: lowStockCount > 0 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { id: 'batches', label: 'Traceability Batches', icon: Tag, badge: batches.length.toString(), badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { id: 'badges', label: 'Trust Badges', icon: Award, badge: null }
      ]
    },
    {
      title: 'CMS & SYSTEM',
      items: [
        { id: 'website_cms', label: 'Website Copy', icon: Edit3, badge: hasUnpublishedCmsChanges ? 'Draft' : null, badgeColor: 'bg-amber-400 text-emerald-950 font-black border-amber-500' },
        { id: 'audit_logs', label: 'Security & Audit Logs', icon: FileText, badge: auditLogs.length.toString(), badgeColor: 'bg-slate-100 text-slate-800 border-slate-300' }
      ]
    }
  ];

  const tabMeta: Record<string, { title: string; subtitle: string; category: string; actionBtn?: { label: string; action: () => void; icon: any; primary?: boolean } }> = {
    overview: {
      title: 'Commercial Operations Overview',
      subtitle: 'Real-time commercial dispatch, live vehicle telemetry, and revenue performance summary.',
      category: 'SITE SECTIONS',
      actionBtn: {
        label: 'Live Storefront',
        action: onOpenStorefrontPreview,
        icon: Globe
      }
    },
    farm_ops: {
      title: 'Farm Operations & Bio-Security Command',
      subtitle: 'Live hatchery incubation, feed batch control, brooder telemetry, and flock pen management.',
      category: 'SITE SECTIONS'
    },
    business_plan: {
      title: 'ChickMagnet 2026 Commercial Poultry Business Plan',
      subtitle: 'Comprehensive financial models, CAPEX budgets, unit economics, and Kisii regional expansion.',
      category: 'SITE SECTIONS'
    },
    orders: {
      title: 'Live Poultry Orders & Fulfillment Pipeline',
      subtitle: 'Climate-controlled transport scheduling, tare weight reconciliations, and Net-30 commercial invoicing.',
      category: 'SITE SECTIONS'
    },
    claims: {
      title: 'Transit Mortality & Guarantee Claims Management',
      subtitle: '24–48 hour live chick arrival claims, photo proof audits, and credit note issuance.',
      category: 'SITE SECTIONS'
    },
    customers: {
      title: 'Commercial Wholesale & Retail Accounts',
      subtitle: 'Net-30 credit approvals, institutional HORECA accounts, and buyer order records.',
      category: 'SITE SECTIONS'
    },
    analytics: {
      title: 'Commercial Sales & Hatchery Yield Analytics',
      subtitle: 'Order velocity, fulfillment accuracy, and revenue breakdown by product line.',
      category: 'SITE SECTIONS'
    },
    products: {
      title: 'Poultry Catalog & SKU Stock Control',
      subtitle: 'Manage live chick breeds, air-chilled meat cuts, fertile hatching eggs, and bio-feeds.',
      category: 'INVENTORY & TRACEABILITY',
      actionBtn: {
        label: 'Add New SKU',
        action: () => {
          setIsAddingNewProduct(true);
          setSelectedProductModal(null);
          setProductForm({
            name: '',
            showOnStorefront: true,
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
            rating: 5.0,
            reviewsCount: 1
          });
        },
        icon: Plus,
        primary: true
      }
    },
    batches: {
      title: 'Hatchery & Pack Batch Traceability IDs',
      subtitle: 'Link vaccination histories, DVS veterinary clearances, and incubation temperature logs.',
      category: 'INVENTORY & TRACEABILITY',
      actionBtn: {
        label: 'Create Batch ID',
        action: () => setIsAddBatchModal(true),
        icon: Plus,
        primary: true
      }
    },
    website_cms: {
      title: 'Website Copy & Brand Identity Editor',
      subtitle: 'Update brand logo, platform name, hero headlines, and value propositions live across the marketplace.',
      category: 'CMS & SYSTEM',
      actionBtn: {
        label: 'Publish Copy Changes',
        action: () => setCmsPublishModal(true),
        icon: Sparkles,
        primary: true
      }
    },
    badges: {
      title: 'Regulatory Certifications & Trust Badges',
      subtitle: 'Manage KEBS licenses, DVS vet clearance numbers, and Halal credentials.',
      category: 'INVENTORY & TRACEABILITY',
      actionBtn: {
        label: 'Add Badge',
        action: () => setIsAddBadgeModal(true),
        icon: Plus,
        primary: true
      }
    },
    audit_logs: {
      title: 'System Security & Administrative Audit Trail',
      subtitle: 'Immutable record of price changes, content revisions, and status approvals.',
      category: 'CMS & SYSTEM'
    }
  };

  const currentMeta = tabMeta[activeTab] || {
    title: 'ChickMagnet CRO Control Center',
    subtitle: 'Administrative and operational management platform.',
    category: 'SITE SECTIONS'
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
                  {brand.brandName || 'ChickMagnet'} CRO
                </span>
              </div>
              <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/80 border border-emerald-700 px-1.5 py-0.2 rounded">
                Admin v2.4
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
                  {currentUser?.name || 'Agina (Admin)'}
                </div>
                <div className="text-[10px] font-mono text-emerald-800 truncate">
                  {currentUser?.email || 'uxagina@gmail.com'}
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
            
            {/* Active Role Selector */}
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1 text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span className="text-slate-600 font-medium">Role:</span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as AdminRole)}
                className="bg-transparent text-emerald-950 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ADMIN">Full Admin (Master)</option>
                <option value="CONTENT_EDITOR">Content Editor</option>
                <option value="FULFILLMENT_STAFF">Fulfillment Staff</option>
              </select>
            </div>

            {/* Unpublished CMS Changes Pill */}
            {hasUnpublishedCmsChanges && (
              <button
                onClick={() => setCmsPublishModal(true)}
                className="flex items-center gap-1.5 bg-amber-100 border border-amber-400 text-amber-950 hover:bg-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer animate-pulse shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Unpublished Draft</span>
              </button>
            )}

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
                <span className="text-xs text-emerald-200/90 font-mono">Live Telemetry & Sync Active</span>
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
              
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-mono font-bold">
                  <span>Revenue Today</span>
                  <DollarSign className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-serif">Ksh 1,480,000</div>
                <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+18.4% vs last week</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-mono font-bold">
                  <span>Orders in Pipeline</span>
                  <Truck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-serif">{orders.length} Active</div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2 Dispatched live vehicles</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-mono font-bold">
                  <span>Low Stock Alert</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600 font-serif">
                  {products.filter(p => p.stock < 500).length} SKUs
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Requires replenishment</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-mono font-bold">
                  <span>Pending Net-30</span>
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-serif">Ksh 420,000</div>
                <div className="text-[11px] text-amber-700 font-bold">1 Overdue account flagged</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs hover:border-emerald-500 transition-colors">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-mono font-bold">
                  <span>Open Claims</span>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-serif">
                  {claims.filter(c => c.status === 'pending_review').length} Pending
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">Guarantee window open</div>
              </div>
            </div>

            {/* Overview Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Recent Orders Overview */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-700" />
                    <span>Recent Order Dispatches</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-slate-900">{order.id}</div>
                        <div className="text-slate-600 font-medium">{order.customerName}</div>
                        <div className="text-[10px] text-emerald-800 font-mono font-bold">{order.fulfillment}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">Ksh {order.grandTotal?.toLocaleString()}</div>
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claims Queue Quick Glance */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Pending Mortality Claims</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('claims')}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer"
                  >
                    Review Queue →
                  </button>
                </div>

                <div className="space-y-3">
                  {claims.filter(c => c.status === 'pending_review').map(claim => (
                    <div key={claim.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-900 font-mono">{claim.id}</span>
                        <span className="text-rose-700 font-mono text-[10px] font-bold">{claim.affectedQty} Birds Lost</span>
                      </div>
                      <div className="text-slate-600 text-[11px] truncate">{claim.description}</div>
                      <div className="text-[10px] text-emerald-800 font-mono flex justify-between font-bold">
                        <span>Batch: {claim.batchId}</span>
                        <span className="text-amber-700">48h Window Open</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Audit Stream */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    <span>Live Audit Activity</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('audit_logs')}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer"
                  >
                    Audit Log →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {auditLogs.slice(0, 4).map(log => (
                    <div key={log.id} className="text-xs border-b border-slate-100 pb-2 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-emerald-800 font-mono font-semibold">
                        <span>{log.user}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="text-slate-900 font-bold">{log.detail}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {log.oldValue} → <strong className="text-emerald-900">{log.newValue}</strong>
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
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Order Tracking & Logistics Pipeline</h2>
                <p className="text-xs text-slate-600">Manage live bird dispatches, weight adjustments, and Net-30 commercial invoicing.</p>
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
                  className="bg-slate-50 border border-slate-200 text-emerald-950 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Buyer Types</option>
                  <option value="retail">Homesteader Buyers</option>
                  <option value="wholesale">Wholesale Net-30</option>
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
                      <th className="p-3.5">Fulfillment Group</th>
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
                          <div className="text-slate-800 font-medium">{order.fulfillment}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Batch: {order.batchIds?.[0] || 'N/A'}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 font-mono">Ksh {order.grandTotal?.toLocaleString()}</div>
                          <div className="text-[10px] text-emerald-800 font-semibold">{order.paymentStatus}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="bg-emerald-50 text-emerald-950 border border-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono">
                            {order.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5">
                          {order.status === 'Placed' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Packed / Weighed')}
                              className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs"
                            >
                              Pack & Weigh
                            </button>
                          )}
                          {order.status === 'Packed / Weighed' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order.id, 'Dispatched')}
                              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs"
                            >
                              Dispatch Vehicle
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
                              Start 48h Guarantee
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CLAIMS & GUARANTEES TRACKING */}
        {activeTab === 'claims' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Mortality & Weight Claims Queue</h2>
                <p className="text-xs text-slate-600">Review photo evidence and issue replacement batches or store credit under the 48-hour live bird guarantee.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claims.map(claim => (
                <div key={claim.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{claim.id}</span>
                      <div className="text-xs text-emerald-800 font-medium">Order: <strong className="text-slate-900 font-mono">{claim.orderId}</strong></div>
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold uppercase ${
                      claim.status === 'pending_review' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      claim.status === 'approved_credit' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <img
                      src={claim.photoEvidenceUrl}
                      alt="Claim photo"
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-900">{claim.breed}</div>
                      <div className="text-rose-700 font-bold">{claim.affectedQty} Birds Affected</div>
                      <div className="text-slate-600 text-[11px]">{claim.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Submitted: {claim.claimDate}</div>
                    </div>
                  </div>

                  {claim.status === 'pending_review' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResolveClaim(claim.id, 'approved_credit', 1620)}
                        className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs"
                      >
                        Approve Store Credit
                      </button>
                      <button
                        onClick={() => handleResolveClaim(claim.id, 'approved_replacement')}
                        className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs"
                      >
                        Approve Replacement
                      </button>
                      <button
                        onClick={() => handleResolveClaim(claim.id, 'rejected')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Customer Directory & Commercial Net-30 Approval</h2>
                <p className="text-xs text-slate-600">Approve credit limits for commercial HORECA accounts and monitor overdue invoices.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-[#062316] text-amber-300 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5">Company / Buyer</th>
                    <th className="p-3.5">Contact & Email</th>
                    <th className="p-3.5">Credit Limit & Usage</th>
                    <th className="p-3.5">Net-30 Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wholesaleAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-emerald-50/40">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{acc.companyName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{acc.phone}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">{acc.contactPerson}</div>
                        <div className="text-[10px] text-emerald-800 font-semibold">{acc.email}</div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-slate-900">
                          Ksh {acc.creditUsedKsh?.toLocaleString()} / Ksh {acc.creditLimitKsh?.toLocaleString()}
                        </div>
                        {acc.overdueAmountKsh > 0 && (
                          <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            OVERDUE: Ksh {acc.overdueAmountKsh.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          acc.net30Status === 'approved' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {acc.net30Status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {acc.net30Status === 'pending_approval' && (
                          <button
                            onClick={() => handleApproveWholesaleAccount(acc.id, 500000)}
                            className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-3 py-1 rounded-lg text-xs cursor-pointer shadow-xs"
                          >
                            Grant Ksh 500k Net-30
                          </button>
                        )}
                        {acc.net30Status === 'approved' && (
                          <button
                            onClick={() => alert(`Sending Net-30 invoice reminder statement to ${acc.email}`)}
                            className="bg-emerald-900 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-emerald-950 font-serif">Platform Analytics & Mortality Ratios</h2>
              <p className="text-xs text-slate-600">Monitor revenue splits, category performance, and bio-security claim ratios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <h3 className="font-bold text-emerald-950 text-sm">Revenue Distribution by Category</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 font-medium">
                      <span>Live Birds (Day-Old Chicks & Pullets)</span>
                      <strong className="text-emerald-900">42% (Ksh 2,450,000)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-amber-400 h-full w-[42%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 font-medium">
                      <span>Fresh & Dressed Poultry (Air-Chilled)</span>
                      <strong className="text-emerald-900">35% (Ksh 2,040,000)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-emerald-600 h-full w-[35%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 font-medium">
                      <span>Eggs (Hatching & Table Eggs)</span>
                      <strong className="text-emerald-900">15% (Ksh 875,000)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-blue-500 h-full w-[15%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 font-medium">
                      <span>Farm Supplies & Feeds</span>
                      <strong className="text-emerald-900">8% (Ksh 460,000)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-purple-500 h-full w-[8%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mortality Ratios */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <h3 className="font-bold text-emerald-950 text-sm">Bio-Security Operational Health Ratio</h3>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs text-slate-600 font-medium">Live Bird Mortality Claim Rate</div>
                  <div className="text-3xl font-black text-emerald-900 font-serif">0.42%</div>
                  <div className="text-[11px] text-emerald-800 font-semibold">Well below the 2.0% industry bio-security maximum threshold.</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs text-slate-600 font-medium">Wholesale Net-30 Repeat Order Rate</div>
                  <div className="text-3xl font-black text-slate-900 font-serif">84.5%</div>
                  <div className="text-[11px] text-slate-600">Standing order renewals active across HORECA buyers.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. INVENTORY & PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Product Catalog & Inventory SKUs</h2>
                <p className="text-xs text-slate-600">Edit live bird pricing, stock levels, and vaccination payloads.</p>
              </div>

              <button
                onClick={() => {
                  setIsAddingNewProduct(true);
                  setSelectedProductModal({} as Product);
                  setProductSaveError(null);
                  setProductForm({
                    name: '',
                    description: '',
                    showOnStorefront: true,
                    price: 150,
                    wholesalePrice: 130,
                    stock: 500,
                    category: 'live-birds'
                  });
                }}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New SKU</span>
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
                        product.stock < 500 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-600'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm leading-snug">{product.name}</div>
                    <div className="text-xs text-emerald-900 font-bold font-mono">
                      Ksh {product.price} <span className="text-slate-500 text-[10px] font-normal">(Wholesale: Ksh {product.wholesalePrice || product.price})</span>
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
                      <span>Edit SKU</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      className="text-rose-600 hover:text-rose-700 hover:underline font-medium flex items-center gap-1 cursor-pointer"
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Hatchery & Pack Batch Traceability IDs</h2>
                <p className="text-xs text-slate-600">Create and bind vaccination records, DVS veterinary clearances, and incubation logs to batch codes.</p>
              </div>

              <button
                onClick={() => setIsAddBatchModal(true)}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Batch ID</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map(batch => (
                <div key={batch.batchId} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{batch.batchId}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{batch.hatchOrSlaughterDate}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-900 font-bold">{batch.breedOrCut}</div>
                    <div className="text-emerald-800 font-medium">Farm: {batch.farmName}</div>
                    <div className="text-slate-600 text-[11px] font-mono">Vet Inspector: {batch.veterinarySignOff}</div>
                    <div className="text-emerald-950 font-bold text-[10px] bg-emerald-50 p-2 rounded-lg border border-emerald-300 mt-2">
                      Lab Status: {batch.labTestStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. WEBSITE COPY */}
        {activeTab === 'website_cms' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Website Copy & Brand Identity Editor</h2>
                <p className="text-xs text-slate-600">Update brand logo, platform name, hero headlines, and value propositions live across the marketplace.</p>
              </div>

              <button
                onClick={() => setCmsPublishModal(true)}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish Copy Changes</span>
              </button>
            </div>

            {/* BRAND LOGO & IDENTITY MANAGER CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-emerald-950 font-serif">Brand Logo & Platform Identity</h3>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-300 uppercase font-bold">Live Global Sync</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Upload your company logo image file or paste an image URL. Any change updates the header, footer, admin, and receipts instantly.
                  </p>
                </div>

                {/* Live Realtime Header Preview Box */}
                <div className="bg-[#123524] text-amber-50 border border-emerald-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 shadow-md max-w-full overflow-hidden">
                  <div className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider mr-1 shrink-0">
                    Live Header Preview:
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
                        {logoDisplayMode === 'image_with_text' && (
                          <span className="font-serif text-lg font-black text-amber-400 tracking-tight">
                            {brandName || 'ChickMagnet'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-serif text-lg font-black text-amber-400 tracking-tight">
                        {brandName || 'ChickMagnet'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Controls - Brand Image Upload Only */}
              <div className="space-y-4 text-xs">
                <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-emerald-950 font-bold text-sm">Upload Brand Logo Image</label>
                    <span className="text-[10px] bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono font-bold">PNG / JPG / WEBP / SVG</span>
                  </div>

                  {/* File Dropzone Input */}
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-5 text-center bg-white hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <Upload className="w-7 h-7 text-emerald-800 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-slate-900">Click or Drag & Drop Logo Image File</span>
                      <span className="text-[11px] text-slate-500">Select any graphic file from your computer (Max 8MB, aspect ratio preserved)</span>
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-mono font-bold">OR PASTE WEB URL</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div>
                    <input
                      type="url"
                      value={logoImageUrl}
                      onChange={(e) => {
                        setLogoImageUrl(e.target.value);
                        setLogoType('image');
                        setLogoDisplayMode('image_only');
                      }}
                      placeholder="https://example.com/my-company-logo.png"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {logoImageUrl && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-900 font-bold">Uploaded Image Preview:</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setLogoImageUrl(DEFAULT_BRAND_LOGO_IMAGE);
                              setLogoType('image');
                              setLogoDisplayMode('image_only');
                            }}
                            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer underline"
                          >
                            Reset to Default Logo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLogoImageUrl('');
                              setLogoType('image');
                              setLogoDisplayMode('image_only');
                            }}
                            className="text-[11px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
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
                {logoSavedSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-900 font-bold bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Logo & Brand Settings Saved Live! All site headers updated.</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Clicking save updates the logo and brand title across all sessions immediately.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSaveBrandLogo}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Update Logo Everywhere</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
              
              {/* Hero Section Copy */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-950 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-800" />
                  <span>Homepage Hero Section Copy</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Hero Main Headline</label>
                    <input
                      type="text"
                      value={cmsDrafts.hero_headline}
                      onChange={(e) => handleCmsChange('hero_headline', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Hero Subhead Description</label>
                    <textarea
                      rows={2}
                      value={cmsDrafts.hero_subhead}
                      onChange={(e) => handleCmsChange('hero_subhead', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Announcement Top Banner</label>
                    <input
                      type="text"
                      value={cmsDrafts.announcement_bar}
                      onChange={(e) => handleCmsChange('announcement_bar', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Cards Copy */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-emerald-950 border-b border-slate-100 pb-2">Value Proposition Feature Cards</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-900 block">Card 1 Title</label>
                    <input
                      type="text"
                      value={cmsDrafts.feature_1_title}
                      onChange={(e) => handleCmsChange('feature_1_title', e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <textarea
                      rows={2}
                      value={cmsDrafts.feature_1_desc}
                      onChange={(e) => handleCmsChange('feature_1_desc', e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded text-slate-700 text-[11px] focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-900 block">Card 2 Title</label>
                    <input
                      type="text"
                      value={cmsDrafts.feature_2_title}
                      onChange={(e) => handleCmsChange('feature_2_title', e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <textarea
                      rows={2}
                      value={cmsDrafts.feature_2_desc}
                      onChange={(e) => handleCmsChange('feature_2_desc', e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded text-slate-700 text-[11px] focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-900 block">Card 3 Title</label>
                    <input
                      type="text"
                      value={cmsDrafts.feature_3_title}
                      onChange={(e) => handleCmsChange('feature_3_title', e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <textarea
                      rows={2}
                      value={cmsDrafts.feature_3_desc}
                      onChange={(e) => handleCmsChange('feature_3_desc', e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded text-slate-700 text-[11px] focus:outline-none focus:border-emerald-600"
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 font-serif">Certification & Trust Badge Manager</h2>
                <p className="text-xs text-slate-600">Manage bio-security licenses and automatically flag expired health certificates.</p>
              </div>

              <button
                onClick={() => setIsAddBadgeModal(true)}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{badge.name}</div>
                        <div className="text-xs text-emerald-800 font-semibold">{badge.issuer}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      badge.status === 'expired' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {badge.status === 'expired' ? '⚠️ EXPIRED — FLAGGED' : 'VALID & DISPLAYED'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 font-mono pt-2 border-t border-slate-100">
                    <div className="text-slate-600">License #: {badge.number}</div>
                    <div className="text-slate-900 font-bold">Expiry Date: {badge.expiryDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. AUDIT LOGS */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-emerald-950 font-serif">Security & System Audit Log</h2>
              <p className="text-xs text-slate-600">Full audit trail of price modifications, content updates, and Net-30 credit limit grants.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-[#062316] text-amber-300 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">User Role</th>
                    <th className="p-3.5">Action Category</th>
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
                <div className="text-[11px] text-slate-600">{selectedOrderModal.email}</div>
                <div className="text-[10px] text-emerald-900 font-mono font-bold">Fulfillment: {selectedOrderModal.fulfillment}</div>
              </div>

              {/* Weight Adjustment History if present */}
              {selectedOrderModal.weightAdjustments?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1 text-amber-900">
                  <div className="font-bold text-xs">Weight Adjustment Record</div>
                  {selectedOrderModal.weightAdjustments.map((wa: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[11px] font-mono font-medium">
                      <span>Est: {wa.estWeightKg}kg → Actual: {wa.actualWeightKg}kg</span>
                      <strong className="text-amber-900">{wa.adjAmountKsh} Ksh ({wa.status})</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery Slots */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-950 text-xs">Assigned Vehicle Slots</div>
                {Object.entries(selectedOrderModal.deliverySlots || {}).map(([grp, slot]: any) => (
                  <div key={grp} className="flex justify-between text-[11px] text-slate-700 font-mono">
                    <span className="uppercase font-semibold">{grp}:</span>
                    <strong className="text-emerald-950 font-bold">{slot}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Total: Ksh {selectedOrderModal.grandTotal?.toLocaleString()}</span>
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
                {isAddingNewProduct ? 'Add New Product SKU' : `Edit Product: ${selectedProductModal.name}`}
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-slate-800 font-bold mb-1">Wholesale Price (Ksh)</label>
                  <input
                    type="number"
                    value={productForm.wholesalePrice}
                    onChange={(e) => setProductForm({ ...productForm, wholesalePrice: Number(e.target.value) })}
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
                    <option value="live-birds">Live Birds</option>
                    <option value="fresh-poultry">Fresh & Whole Poultry</option>
                    <option value="processed">Processed & Value-Added</option>
                    <option value="eggs">Eggs</option>
                    <option value="farm-supplies">Farm Supplies</option>
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
                  checked={productForm.showOnStorefront ?? productForm.category !== 'farm-supplies'}
                  onChange={(e) => setProductForm({ ...productForm, showOnStorefront: e.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-emerald-700"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-900">Show on storefront</span>
                  <span className="block text-xs text-slate-600">Turn this off to keep the product in the CMS without offering it for sale.</span>
                </span>
              </label>

              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                Wholesale minimums are applied automatically: 10 for chicken and 5 for egg products.
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

              {/* Ship-Week Stock Availability */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-amber-950">Ship-Week Status</div>
                  <div className="text-[11px] text-amber-900">Current Week: {productForm.currentShipWeek || 'Week of Aug 25 - 31'}</div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isSoldOutForWeek || false}
                    onChange={(e) => setProductForm({ ...productForm, isSoldOutForWeek: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded accent-rose-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Sold Out for Ship-Week ("Notify Me" mode)</span>
                </label>
              </div>

              {/* Product Image Section */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-slate-900 font-bold">Main Product Image URL</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {productForm.image ? (
                      <img src={productForm.image} alt="SKU Preview" className="w-full h-full object-cover" />
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

      {/* MODAL 3: PUBLISH CMS DRAFTS CONFIRMATION MODAL */}
      {cmsPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-950">
              <Sparkles className="w-6 h-6 shrink-0 text-amber-500" />
              <h3 className="font-serif text-lg font-bold">Publish Website Copy to Live Site</h3>
            </div>

            <p className="text-slate-600">
              You are about to push draft copy updates live to all customers. This action will update hero headlines, top announcement bars, and value proposition cards instantly.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px] text-slate-800">
              <div>Headline: "{cmsDrafts.hero_headline}"</div>
              <div>Top Banner: "{cmsDrafts.announcement_bar}"</div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setCmsPublishModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Keep Draft
              </button>
              <button
                onClick={handlePublishCmsChanges}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-5 py-2 rounded-xl shadow-xs cursor-pointer"
              >
                Publish Live Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD TRACEABILITY BATCH MODAL */}
      {isAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-emerald-950">Create Traceability Batch ID</h3>
              <button onClick={() => setIsAddBatchModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Batch ID Code</label>
                <input
                  type="text"
                  value={newBatch.batchId}
                  onChange={(e) => setNewBatch({ ...newBatch, batchId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Breed / Cut Description</label>
                <input
                  type="text"
                  value={newBatch.breedOrCut}
                  onChange={(e) => setNewBatch({ ...newBatch, breedOrCut: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Lab Test & Health Clearance</label>
                <input
                  type="text"
                  value={newBatch.labTestStatus}
                  onChange={(e) => setNewBatch({ ...newBatch, labTestStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 font-mono text-[11px] focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setIsAddBatchModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleSaveBatch} className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer">Save Batch ID</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD TRUST BADGE MODAL */}
      {isAddBadgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-emerald-950">Add Trust Certification Badge</h3>
              <button onClick={() => setIsAddBadgeModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Certification Name</label>
                <input
                  type="text"
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                  placeholder="e.g. KEBS Food Quality Standard"
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">License / Registration #</label>
                <input
                  type="text"
                  value={newBadge.number}
                  onChange={(e) => setNewBadge({ ...newBadge, number: e.target.value })}
                  placeholder="e.g. KEBS/PV-9011/2026"
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newBadge.expiryDate}
                  onChange={(e) => setNewBadge({ ...newBadge, expiryDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setIsAddBadgeModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleSaveBadge} className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer">Save Badge</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
