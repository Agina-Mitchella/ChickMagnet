export type BuyerType = 'retail' | 'farmer' | 'wholesale';

export type MainCategory = 
  | 'live-birds' 
  | 'fresh-poultry' 
  | 'processed' 
  | 'eggs' 
  | 'farm-supplies';

export type SubCategory =
  // Live Birds
  | 'day-old-chicks'
  | 'growers-broilers'
  | 'layers'
  | 'breeding-stock'
  | 'heritage-ornamental'
  // Fresh & Whole Poultry
  | 'whole-dressed'
  | 'cuts'
  | 'bone-in-boneless'
  | 'giblets-offal'
  // Processed
  | 'raw-cuts'
  | 'sausages'
  // Eggs
  | 'table-eggs'
  | 'fertile-eggs'
  | 'specialty-eggs'
  // Farm Supplies
  | 'feed'
  | 'vaccines-meds'
  | 'equipment'
  | 'biosecurity';

export type FulfillmentType = 
  | 'live-climate' 
  | 'chilled-express' 
  | 'frozen-deep' 
  | 'dry-ambient';

export interface VaccinationRecord {
  vaccine: string;
  dateAdministered: string;
}

export interface LiveBirdProductData {
  breed: string;
  liveCategory: 'chick' | 'grower' | 'layer' | 'breeding' | 'heritage';
  ageWeeks: number;
  weightRangeKg: { min: number; max: number };
  sex: 'male' | 'female' | 'unsexed';
  vaccinationRecord: VaccinationRecord[];
  sourceFarmId: string;
  batchId: string;
  minOrderQty: number;
  mortalityPolicy: 'replace' | 'credit' | 'none';
  pricePerBird?: number;
  pricePerKg?: number;
  transportZoneAvailability: string[];
}

export interface FreshPoultryProductData {
  cutType: string;
  boneStatus: 'bone-in' | 'boneless';
  skinStatus: 'skin-on' | 'skinless';
  weightEstKg: number;
  weightTolerancePercent: number; // e.g. 10 (±10%)
  pricePerKg: number;
  slaughterDate: string;
  packDate: string;
  bestBeforeDate: string;
  halalCertified: boolean;
  certificationDocs: string[];
  batchId: string;
  sourceFarmId: string;
  storageTemp: 'chilled' | 'frozen';
}

export interface ProcessedProductData {
  fixedWeightG: number;
  ingredientsList: string[];
  allergens: string[];
  priceFixed: number;
  bestBeforeDate: string;
  storageTemp: 'chilled' | 'frozen';
  batchId: string;
}

export interface EggProductData {
  eggType: 'table' | 'fertile' | 'specialty';
  gradeSize: 'small' | 'medium' | 'large' | 'jumbo';
  countPerPack: number;
  layDate: string;
  daysSinceLaid: number;
  fertilityWindowDays?: number; // for fertile hatching eggs
  hatchViabilityPercent?: number;
  price: number;
}

export interface FarmSupplyProductData {
  supplyCategory: 'feed' | 'vaccine' | 'equipment' | 'biosecurity';
  unit: string;
  priceFixed: number;
  stockQty: number;
  requiresPrescription: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatarColor: string;
  verifiedBuyer: boolean;
  buyerType?: BuyerType;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  category: MainCategory;
  subCategory: SubCategory;
  image: string;
  images?: string[];
  sellerName: string;
  sellerId: string;
  sellerBadge: string;
  stock: number;
  tags: string[];
  badge?: string; // "Halal", "Free-Range", "NCD Vaccinated", "Fresh Today"
  fulfillmentType: FulfillmentType;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  unit?: string;
  minOrderQty?: number;
  
  // Specific payload types
  liveData?: LiveBirdProductData;
  freshData?: FreshPoultryProductData;
  processedData?: ProcessedProductData;
  eggData?: EggProductData;
  supplyData?: FarmSupplyProductData;
  
  reviewsList?: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSex?: 'male' | 'female' | 'unsexed';
  selectedAgeWeeks?: number;
  fulfillmentGroup: FulfillmentType;
  estimatedPriceRange?: { min: number; max: number };
}

export interface FarmSeller {
  id: string;
  name: string;
  slug: string;
  location: string;
  region: string;
  establishedYear: number;
  biosecurityLevel: string; // e.g. "Level 3 Bio-Secure"
  certifications: string[]; // e.g. ["Halal", "KEBS", "DVS", "ISO 22000"]
  kebsLicenseNo: string;
  dvsCertNo: string;
  rating: number;
  reviewsCount: number;
  description: string;
  heroImage: string;
  avatarImage: string;
  specialties: string[];
  deliveryZones: string[];
}

export interface MortalityClaim {
  id: string;
  orderId: string;
  batchId: string;
  breed: string;
  affectedQty: number;
  incidentDate: string;
  photoEvidenceUrl: string;
  description: string;
  status: 'pending_review' | 'approved_credit' | 'approved_replacement';
  refundAmount?: number;
  claimDate: string;
}

export interface BatchTraceabilityRecord {
  batchId: string;
  farmName: string;
  location: string;
  breedOrCut: string;
  hatchOrSlaughterDate: string;
  feedSupplier: string;
  vaccinationHistory: VaccinationRecord[];
  labTestStatus: string;
  kebsLicenseNo: string;
  dvsCertNo: string;
  veterinarySignOff: string;
  temperatureLog: string;
}

export interface WholesaleStandingOrder {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  itemsSummary: string;
  nextDeliveryDate: string;
  monthlySpendKsh: number;
  paymentTerms: 'NET-30 Invoiced';
  status: 'active' | 'paused';
}

export interface User {
  email: string;
  name: string;
  avatarEmoji?: string;
  role: 'BUYER' | 'FARMER' | 'WHOLESALE' | 'KEEPER' | 'ADMIN';
  buyerType: BuyerType;
  shopSlug?: string;
  shopName?: string;
  shopStatus?: 'draft' | 'pending_payout' | 'launched' | null;
  net30Approved?: boolean;
  creditLimitKsh?: number;
}
