import { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import defaultLogoImg from '../assets/images/regenerated_image_1787820822648.png';

export const DEFAULT_BRAND_LOGO_IMAGE = defaultLogoImg;

export type CMSBlockType = 'text' | 'heading' | 'image' | 'button' | 'toggle' | 'datetime' | 'json';

export interface CMSHistoryEntry {
  id: string;
  timestamp: string;
  adminName: string;
  oldValue: string | boolean;
  newValue: string | boolean;
}

export interface CMSBlock {
  id: string;
  pageId: string;
  label: string;
  type: CMSBlockType;
  value: string | boolean;
  characterLimit?: number;
  readOnly?: boolean;
  lastEditedBy: string;
  lastEditedAt: string;
  history: CMSHistoryEntry[];
}

export interface CMSPageMeta {
  id: string;
  title: string;
  category: 'page' | 'global' | 'farm_plan' | 'system';
}

export const CMS_PAGES: CMSPageMeta[] = [
  { id: 'global', title: 'Global Settings & Branding', category: 'global' },
  { id: 'storefront', title: 'Homepage & Hero Banner', category: 'page' },
  { id: 'value-props', title: 'Value Propositions & Pillars', category: 'page' },
  { id: 'about-lore', title: 'About Us & Lore', category: 'page' },
  { id: 'quality-guarantees', title: 'Quality & Biosecurity Guarantees', category: 'page' },
  { id: 'faqs', title: 'Frequently Asked Questions (FAQs)', category: 'page' },
  { id: 'wholesale-portal', title: 'Wholesale & B2B Portal', category: 'page' },
  { id: 'traceability', title: 'Traceability & Claims', category: 'page' },
  { id: 'footer-contact', title: 'Footer & Contact Info', category: 'page' },
  { id: 'farm-plan-financials', title: 'Farm Plan: Financials & Pricing', category: 'farm_plan' },
  { id: 'farm-plan-feed', title: 'Farm Plan: Feed & Inventory', category: 'farm_plan' },
  { id: 'farm-plan-vaccines', title: 'Farm Plan: Vaccination Schedule', category: 'farm_plan' },
  { id: 'farm-plan-housing', title: 'Farm Plan: Housing & Equipment', category: 'farm_plan' },
  { id: 'farm-plan-sops', title: 'Farm Plan: Attendant SOPs', category: 'farm_plan' },
  { id: 'farm-plan-marketing', title: 'Farm Plan: Sales & Pitch', category: 'farm_plan' },
];

export const INITIAL_FAQS = [
  {
    id: 'faq-1',
    q: 'How does ChickMagnet guarantee 100% Live Arrival for Day-Old Chicks?',
    a: 'Chicks are packed in specially ventilated, temperature-insulated transport boxes with extra thermal bedding and nutrient gel. In the rare event of mortality, our 24-48 hour Live Arrival Guarantee provides instant credit or replacement.',
    category: 'Live Chick Transport'
  },
  {
    id: 'faq-2',
    q: 'What bio-security measures are taken at partner hatcheries?',
    a: 'All partner hatcheries undergo monthly blood tests and bio-security audits by certified veterinary officers (DVS & KEBS). Every batch is assigned a unique Batch ID detailing parent flock health, vaccination history, and lay dates.',
    category: 'Biosecurity & Quality'
  },
  {
    id: 'faq-3',
    q: 'How does Wholesale Net-30 work for commercial buyers?',
    a: 'Verified HORECA businesses (hotels, butcheries, institutions) can apply for Net-30 credit terms. Once approved, standing recurring orders are dispatched automatically with 30-day payment invoicing.',
    category: 'Commercial Wholesale'
  },
  {
    id: 'faq-4',
    q: 'How are fresh dressed poultry weights handled for billing?',
    a: 'Fresh dressed birds vary slightly in scale weight. Cards or mobile money payments are pre-authorized, and final billing is automatically adjusted down to the exact packed scale weight at cold-chain packing.',
    category: 'Ordering & Billing'
  }
];

export const INITIAL_VACCINE_SCHEDULE = [
  {
    id: 'vax-1',
    dayOrWeek: 'Day 1',
    vaccine: "Marek's HVT In-Ovo + NCD/IB Spray",
    route: 'Subcutaneous / Spray at Hatchery',
    instructions: 'Administered at partner hatchery facility prior to box sealing.',
    notes: 'Mandatory bio-security clearance before dispatch.'
  },
  {
    id: 'vax-2',
    dayOrWeek: 'Day 7',
    vaccine: 'Gumboro (IBD) Intermediate Plus',
    route: 'Drinking Water (with Skim Milk Stabilizer)',
    instructions: 'Withdraw water for 1.5 hours prior. Mix vaccine with 2g/L skim milk.',
    notes: 'Ensure all birds consume within 2 hours.'
  },
  {
    id: 'vax-3',
    dayOrWeek: 'Day 14',
    vaccine: 'Gumboro (IBD) 2nd Booster',
    route: 'Drinking Water',
    instructions: 'Repeat intermediate plus strain booster for high maternal antibody protection.',
    notes: 'Crucial for 98%+ flock livability.'
  },
  {
    id: 'vax-4',
    dayOrWeek: 'Day 21',
    vaccine: 'Newcastle (Lasota) + Infectious Bronchitis',
    route: 'Ocular Drop / Drinking Water',
    instructions: 'Eye drop preferred for 100% individual coverage, or clean unchlorinated water.',
    notes: 'Provides solid respiratory immunity.'
  },
  {
    id: 'vax-5',
    dayOrWeek: 'Day 28',
    vaccine: 'Deworming (Levamisole) + Multi-Vitamins',
    route: 'Drinking Water',
    instructions: 'Full 24-hour treatment followed by 3 days of stress-pack vitamins.',
    notes: 'Prepares digestive tract for rapid grower transition.'
  },
  {
    id: 'vax-6',
    dayOrWeek: 'Week 6 (Day 42)',
    vaccine: 'Fowl Pox + Fowl Typhoid',
    route: 'Wing Web Puncture / Intramuscular',
    instructions: 'Wing web stab applicator for Fowl Pox; 0.5ml breast IM for Typhoid.',
    notes: 'Lifetime protection for adult layers & kienyeji growers.'
  }
];

export const INITIAL_HOUSING_SPECS = [
  {
    id: 'spec-1',
    label: 'Brooder Floor Space',
    value: '300 sq ft (28 m²)',
    note: 'Initial brooding density of 20 chicks/m², expanding to 10 birds/m² by week 3.'
  },
  {
    id: 'spec-2',
    label: 'Feeder Ratio',
    value: '1 Tube Feeder per 35-40 birds',
    note: '15-16 standard 10kg feeders distributed evenly.'
  },
  {
    id: 'spec-3',
    label: 'Drinker Ratio',
    value: '1 Bell Drinker per 45-50 birds',
    note: '12 automatic bell drinkers with fresh water line.'
  },
  {
    id: 'spec-4',
    label: 'Brooding Temperature',
    value: 'Week 1: 35°C → Week 4: 21°C',
    note: 'Drop temperature 3°C weekly until ambient temperature is reached.'
  },
  {
    id: 'spec-5',
    label: 'Litter Management',
    value: '5-8 cm Dry Pine Shavings',
    note: 'Turn litter every 2 days; rake out wet drinker spots immediately.'
  },
  {
    id: 'spec-6',
    label: 'Biosecurity Footbath',
    value: '2% Virkon-S / Formalin Solution',
    note: 'Mandatory shoe dip at pen entrance, refreshed twice weekly.'
  }
];

export const INITIAL_DAILY_SOPS = [
  {
    id: 'sop-1',
    time: '06:00 AM',
    task: 'Morning Vitality Check & Ventilation Inspection',
    details: 'Step through footbath, inspect flock activity, record any overnight mortalities, open side curtains for fresh air flow.',
    critical: true
  },
  {
    id: 'sop-2',
    time: '06:30 AM',
    task: 'Drinker Sanitization & Fresh Feed Top-Up',
    details: 'Thoroughly scrub all bell drinkers, refill with fresh water (add vitamins/electrolytes if scheduled), distribute morning starter/grower feed.',
    critical: true
  },
  {
    id: 'sop-3',
    time: '12:00 PM',
    task: 'Midday Temperature & Litter Rake',
    details: 'Check brooder thermometer, adjust curtains to prevent heat stress, rake around waterers to keep shavings bone-dry.',
    critical: false
  },
  {
    id: 'sop-4',
    time: '05:30 PM',
    task: 'Evening Feed Check & Curtains Draw',
    details: 'Top up feeders for nighttime intake, draw curtains to maintain warmth, ensure brooding heat sources are active.',
    critical: true
  },
  {
    id: 'sop-5',
    time: '09:00 PM',
    task: 'Night Brooder Heat & Distribution Check',
    details: 'Verify chicks are evenly ringed under heat lamps (no piling/chilling), lock predator-proof double doors.',
    critical: true
  }
];

export const DEFAULT_CMS_BLOCKS: CMSBlock[] = [
  // 1. GLOBAL SETTINGS & BRANDING
  {
    id: 'global_logo_type',
    pageId: 'global',
    label: 'Brand Logo Display Mode (emoji or image)',
    type: 'text',
    value: 'image',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_logo_display_mode',
    pageId: 'global',
    label: 'Logo Layout Mode (image_only, image_with_text, emoji_with_text)',
    type: 'text',
    value: 'image_only',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_logo_emoji',
    pageId: 'global',
    label: 'Brand Logo Icon / Emoji',
    type: 'text',
    value: '🐔',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_logo_image_url',
    pageId: 'global',
    label: 'Brand Logo Image (URL or Data URI)',
    type: 'image',
    value: defaultLogoImg,
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_platform_name',
    pageId: 'global',
    label: 'Platform Brand Name',
    type: 'heading',
    value: 'ChickMagnet',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_tagline',
    pageId: 'global',
    label: 'Platform Tagline',
    type: 'text',
    value: 'Direct-from-Hatchery Day-Old Chicks, Bio-Secure Poultry & Wholesale Cold-Chain',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_announcement_bar',
    pageId: 'global',
    label: 'Header Top Announcement Bar',
    type: 'text',
    value: '🚚 Daily Climate-Controlled Dispatches across Kenya • 100% Live Arrival & Bio-Secure Certified • Call/WhatsApp: +254 700 123 456',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_contact_phone',
    pageId: 'global',
    label: 'Support Phone Number',
    type: 'text',
    value: '+254 700 123 456',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_contact_email',
    pageId: 'global',
    label: 'Support Email Address',
    type: 'text',
    value: 'info@chickmagnet.co.ke',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_contact_location',
    pageId: 'global',
    label: 'Headquarters Physical Location',
    type: 'text',
    value: 'Kisii Hub, Kisii-Kilgoris Road, Kenya',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_emergency_vet_phone',
    pageId: 'global',
    label: 'Emergency Veterinary Hotline',
    type: 'text',
    value: '+254 722 999 888',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'global_vet_license',
    pageId: 'global',
    label: 'Regulatory License & Certifications',
    type: 'text',
    value: 'DVS-NAI-9921 / KEBS/PV-88392/2025',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 2. STOREFRONT HOMEPAGE & HERO BANNER
  {
    id: 'hero_headline',
    pageId: 'storefront',
    label: 'Hero Main Headline',
    type: 'heading',
    value: 'Your Favorite Marketplace for Premium Poultry & Hatchery Supplies',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'hero_subhead',
    pageId: 'storefront',
    label: 'Hero Sub-headline Description',
    type: 'text',
    value: 'Bio-secure vaccinated day-old chicks with 100% Live Arrival Guarantee, fresh dressed whole birds, premium feeds, and dedicated HORECA procurement across East Africa.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'hero_badge_text',
    pageId: 'storefront',
    label: 'Hero Badge Chip Text',
    type: 'text',
    value: '100% NPIP Bio-Secure Verified Stock',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'hero_primary_cta',
    pageId: 'storefront',
    label: 'Hero Primary CTA Button Text',
    type: 'button',
    value: 'Explore Verified Catalog',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'hero_image_url',
    pageId: 'storefront',
    label: 'Hero Banner Image URL',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'catalog_section_title',
    pageId: 'storefront',
    label: 'Catalog Section Title',
    type: 'heading',
    value: 'All Poultry & Farm Listings',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'retail_tab_label',
    pageId: 'storefront',
    label: 'Retail Tab Switcher Label',
    type: 'text',
    value: 'Retail & Homesteaders',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'wholesale_tab_label',
    pageId: 'storefront',
    label: 'Wholesale Tab Switcher Label',
    type: 'text',
    value: 'Commercial Wholesale (Net-30)',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 3. VALUE PROPOSITIONS & GUARANTEE PILLARS (4 CARDS)
  {
    id: 'feature_1_icon',
    pageId: 'value-props',
    label: 'Pillar 1 Icon / Emoji',
    type: 'text',
    value: '🐥',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'feature_1_title',
    pageId: 'value-props',
    label: 'Pillar 1 Title',
    type: 'heading',
    value: '100% Live Arrival Guarantee',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'feature_1_desc',
    pageId: 'value-props',
    label: 'Pillar 1 Description',
    type: 'text',
    value: 'Ventilated, temperature-stabilized vehicles designed specifically for day-old chicks, reducing transit stress and mortality.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  {
    id: 'feature_2_icon',
    pageId: 'value-props',
    label: 'Pillar 2 Icon / Emoji',
    type: 'text',
    value: '❄️',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'feature_2_title',
    pageId: 'value-props',
    label: 'Pillar 2 Title',
    type: 'heading',
    value: 'Cold-Chain Precision (0-4°C)',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'feature_2_desc',
    pageId: 'value-props',
    label: 'Pillar 2 Description',
    type: 'text',
    value: 'Air-chilled fresh dressed poultry (0-4°C) and frozen cuts (-18°C) delivered with scale-weight accuracy and cold-chain integrity.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  {
    id: 'feature_3_icon',
    pageId: 'value-props',
    label: 'Pillar 3 Icon / Emoji',
    type: 'text',
    value: '📜',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'feature_3_title',
    pageId: 'value-props',
    label: 'Pillar 3 Title',
    type: 'heading',
    value: 'Bio-Secure Batch Traceability',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'feature_3_desc',
    pageId: 'value-props',
    label: 'Pillar 3 Description',
    type: 'text',
    value: 'Every hatch and slaughter lot features a unique Batch ID detailing vaccination records, farm location, lay dates, and lab clearances.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  {
    id: 'feature_4_icon',
    pageId: 'value-props',
    label: 'Pillar 4 Icon / Emoji',
    type: 'text',
    value: '🏢',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'feature_4_title',
    pageId: 'value-props',
    label: 'Pillar 4 Title',
    type: 'heading',
    value: 'HORECA & B2B Net-30',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'feature_4_desc',
    pageId: 'value-props',
    label: 'Pillar 4 Description',
    type: 'text',
    value: 'Dedicated commercial procurement for hotels, restaurants, and butcheries with standing recurring contracts and automated invoicing.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 4. ABOUT US & LORE STORY
  {
    id: 'about_hero_badge',
    pageId: 'about-lore',
    label: 'About Hero Badge',
    type: 'text',
    value: '📍 Headquartered in Kisii, Kenya • KEBS & DVS Bio-Secure Certified',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'about_hero_title',
    pageId: 'about-lore',
    label: 'About Hero Title',
    type: 'heading',
    value: "ChickMagnet: Kisii's Premier Modern Poultry & Hatchery Hub",
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'about_hero_body',
    pageId: 'about-lore',
    label: 'About Main Narrative Text',
    type: 'text',
    value: 'Based in Kisii, Kenya, ChickMagnet connects vetted commercial hatcheries, smallholder poultry farmers, and top HORECA buyers across East Africa. From day-old chick climate transport originating from our Kisii hatchery facilities to chilled dressed chicken weight-tolerance packing, every transaction is backed by batch traceability and bio-security clearance.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 5. QUALITY & BIOSECURITY GUARANTEES
  {
    id: 'quality_section_badge',
    pageId: 'quality-guarantees',
    label: 'Quality Section Badge',
    type: 'text',
    value: 'Unified Assurance Policy',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_section_title',
    pageId: 'quality-guarantees',
    label: 'Quality Section Title',
    type: 'heading',
    value: 'Quality, Biosecurity & Live Arrival Guarantees',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_section_subtitle',
    pageId: 'quality-guarantees',
    label: 'Quality Section Subtitle',
    type: 'text',
    value: 'Consolidated standards governing live chick transit, hatchery bio-security, KEBS/DVS certifications, and climate transport schedules.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_live_guarantee_title',
    pageId: 'quality-guarantees',
    label: 'Live Arrival Guarantee Title',
    type: 'heading',
    value: '48-Hour Live Arrival Guarantee',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_live_guarantee_body',
    pageId: 'quality-guarantees',
    label: 'Live Arrival Guarantee Policy Text',
    type: 'text',
    value: 'We guarantee 100% viable live arrival for all day-old chick and pullet shipments. If any loss occurs during transit or within 24–48 hours of box opening, submit photo evidence to receive immediate account credit or replacement stock.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_coldchain_title',
    pageId: 'quality-guarantees',
    label: 'Cold-Chain Guarantee Title',
    type: 'heading',
    value: 'Cold-Chain Integrity (0–4°C)',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_coldchain_body',
    pageId: 'quality-guarantees',
    label: 'Cold-Chain Policy Text',
    type: 'text',
    value: 'Fresh dressed whole broilers and kienyeji chickens are chilled immediately after veterinary inspection. Scale weights are recorded at packing, ensuring exact billing down to the gram.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_biosecurity_title',
    pageId: 'quality-guarantees',
    label: 'Biosecurity Standards Title',
    type: 'heading',
    value: 'Biosecurity & NPIP / DVS Standards',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_biosecurity_body',
    pageId: 'quality-guarantees',
    label: 'Biosecurity Standards Policy Text',
    type: 'text',
    value: 'Parent flocks undergo monthly serological testing for Salmonella pullorum, Avian Influenza, and Mycoplasma. Hatched chicks receive in-ovo Marek\'s and spray Newcastle vaccines before leaving bio-isolated facilities.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_weight_accuracy_title',
    pageId: 'quality-guarantees',
    label: 'Tare-Weight Accuracy Title',
    type: 'heading',
    value: 'Tare-Weight Accuracy & Auto Reconcile',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'quality_weight_accuracy_body',
    pageId: 'quality-guarantees',
    label: 'Tare-Weight Accuracy Policy Text',
    type: 'text',
    value: 'Pre-authorized digital card/M-Pesa payments are adjusted down upon final dispatch weighing, guaranteeing you only pay for the exact grams delivered.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 6. FAQS DATA (JSON)
  {
    id: 'faqs_data_json',
    pageId: 'faqs',
    label: 'Structured FAQs List (JSON)',
    type: 'json',
    value: JSON.stringify(INITIAL_FAQS),
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 7. WHOLESALE & B2B PORTAL
  {
    id: 'wholesale_portal_title',
    pageId: 'wholesale-portal',
    label: 'Wholesale Portal Title',
    type: 'heading',
    value: 'ChickMagnet Wholesale & HORECA Portal',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'wholesale_portal_subtitle',
    pageId: 'wholesale-portal',
    label: 'Wholesale Portal Subtitle',
    type: 'text',
    value: 'Net-30 Invoiced Accounts • Standing Order Subscriptions • Bulk Tier Savings',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'wholesale_credit_limit_amount',
    pageId: 'wholesale-portal',
    label: 'Approved Commercial Credit Limit (Ksh)',
    type: 'text',
    value: '500,000',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'wholesale_terms_summary',
    pageId: 'wholesale-portal',
    label: 'Wholesale Terms Summary',
    type: 'text',
    value: 'Net-30 Invoicing Terms Active • 0% Interest',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 8. TRACEABILITY & CLAIMS PORTAL
  {
    id: 'traceability_portal_title',
    pageId: 'traceability',
    label: 'Traceability Portal Title',
    type: 'heading',
    value: 'Bio-Secure Batch Traceability & Lab Clearance Portal',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'traceability_portal_subtitle',
    pageId: 'traceability',
    label: 'Traceability Portal Subtitle',
    type: 'text',
    value: 'Inspect parent flock origins, vaccination logbooks, hatch dates, temperature telemetry, and government veterinary certifications for any batch.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'claims_portal_title',
    pageId: 'traceability',
    label: 'Mortality Claims Portal Title',
    type: 'heading',
    value: 'Mortality Claim & Live Arrival Assurance Protocol',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'claims_portal_subtitle',
    pageId: 'traceability',
    label: 'Mortality Claims Portal Subtitle',
    type: 'text',
    value: 'Submit transit loss documentation within 24-48 hours of dispatch for instant credit review or replacement fulfillment.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 9. FOOTER & CONTACT INFO
  {
    id: 'footer_contact_headline',
    pageId: 'footer-contact',
    label: 'Footer Contact Us Headline',
    type: 'heading',
    value: 'Contact Us',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'footer_contact_description',
    pageId: 'footer-contact',
    label: 'Footer Contact Description',
    type: 'text',
    value: 'Have inquiries about day-old chick availability, custom incubator setups, or commercial wholesale orders in Kisii? Get in touch with us directly.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'footer_contact_name',
    pageId: 'footer-contact',
    label: 'Footer Contact Person Name',
    type: 'text',
    value: 'Steve Logarn Ositu',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'footer_contact_location',
    pageId: 'footer-contact',
    label: 'Footer Location Label',
    type: 'text',
    value: 'Kisii, Kenya',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'footer_phone',
    pageId: 'footer-contact',
    label: 'Footer Direct Phone Number',
    type: 'text',
    value: '254700356023',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'footer_email',
    pageId: 'footer-contact',
    label: 'Footer Direct Email',
    type: 'text',
    value: 'manyaos7@gmail.com',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'footer_copyright_notice',
    pageId: 'footer-contact',
    label: 'Footer Copyright Notice Text',
    type: 'text',
    value: 'ChickMagnet Hatchery Ltd (Kisii, Kenya). All rights reserved.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 10. FARM PLAN MASTER PARAMETERS & FINANCIALS
  {
    id: 'fp_farm_title',
    pageId: 'farm-plan-financials',
    label: 'Farm Plan Command Title',
    type: 'heading',
    value: '600-Flock Improved Kienyeji Operational Command',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_farm_subtitle',
    pageId: 'farm-plan-financials',
    label: 'Farm Plan Command Subtitle',
    type: 'text',
    value: 'Real-time target pricing matrix, feed inventory SOP, vaccination calendar, and daily attendant checklists based on your master farm plan.',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_farm_location',
    pageId: 'farm-plan-financials',
    label: 'Farm Location Name',
    type: 'text',
    value: 'Naivasha Farm',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_initial_placed',
    pageId: 'farm-plan-financials',
    label: 'Initial Placed Flock Count (birds)',
    type: 'text',
    value: '600',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_current_live',
    pageId: 'farm-plan-financials',
    label: 'Current Live Birds Count',
    type: 'text',
    value: '570',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_mortality_count',
    pageId: 'farm-plan-financials',
    label: 'Mortality Count to Date',
    type: 'text',
    value: '30',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_sunk_cost',
    pageId: 'farm-plan-financials',
    label: 'Sunk Cash Invested (Ksh)',
    type: 'text',
    value: '346788',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_future_buffer_pct',
    pageId: 'farm-plan-financials',
    label: 'Future Mortality Buffer (%)',
    type: 'text',
    value: '5',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_remaining_cost_r',
    pageId: 'farm-plan-financials',
    label: 'Remaining Cost R per Bird (Ksh)',
    type: 'text',
    value: '500',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_target_profit_tier_1',
    pageId: 'farm-plan-financials',
    label: 'Profit Target Tier 1 (Ksh)',
    type: 'text',
    value: '69000',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_target_profit_tier_2',
    pageId: 'farm-plan-financials',
    label: 'Profit Target Tier 2 (Ksh)',
    type: 'text',
    value: '80000',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_target_profit_tier_3',
    pageId: 'farm-plan-financials',
    label: 'Profit Target Tier 3 (Ksh)',
    type: 'text',
    value: '104000',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_active_profit_target',
    pageId: 'farm-plan-financials',
    label: 'Selected Active Profit Target (Ksh)',
    type: 'text',
    value: '80000',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 11. FARM PLAN FEED & INVENTORY
  {
    id: 'fp_starter_bags_on_hand',
    pageId: 'farm-plan-feed',
    label: 'Starter Feed 50kg Bags on Hand',
    type: 'text',
    value: '5.5',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_starter_kg_per_bag',
    pageId: 'farm-plan-feed',
    label: 'Kg per Feed Bag',
    type: 'text',
    value: '50',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_starter_daily_intake_kg',
    pageId: 'farm-plan-feed',
    label: 'Daily Feed Intake per Bird (kg)',
    type: 'text',
    value: '0.035',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_feed_supplier',
    pageId: 'farm-plan-feed',
    label: 'Feed Brand & Supplier Name',
    type: 'text',
    value: 'Ungwa Bio-Feeds Starter & ChickMagnet Grower',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_cost_starter_bag',
    pageId: 'farm-plan-feed',
    label: 'Cost per 50kg Starter Bag (Ksh)',
    type: 'text',
    value: '3600',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_cost_grower_bag',
    pageId: 'farm-plan-feed',
    label: 'Cost per 50kg Grower Bag (Ksh)',
    type: 'text',
    value: '3100',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_cost_finisher_bag',
    pageId: 'farm-plan-feed',
    label: 'Cost per 50kg Finisher Bag (Ksh)',
    type: 'text',
    value: '2950',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_target_fcr',
    pageId: 'farm-plan-feed',
    label: 'Target Feed Conversion Ratio (FCR)',
    type: 'text',
    value: '2.1',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 12. FARM PLAN MARKETING & PITCH
  {
    id: 'fp_harvest_days',
    pageId: 'farm-plan-marketing',
    label: 'Harvesting Schedule Days',
    type: 'text',
    value: 'Friday and Saturday',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_weight_min',
    pageId: 'farm-plan-marketing',
    label: 'Minimum Dressed Weight (kg)',
    type: 'text',
    value: '1.3',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_weight_max',
    pageId: 'farm-plan-marketing',
    label: 'Maximum Dressed Weight (kg)',
    type: 'text',
    value: '1.6',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_delivery_radius_km',
    pageId: 'farm-plan-marketing',
    label: 'Delivery Radius (km)',
    type: 'text',
    value: '25',
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_pitch_script_template',
    pageId: 'farm-plan-marketing',
    label: 'Sales Pitch Template Script',
    type: 'text',
    value: "Hi, we're supplying improved kienyeji birds from {location}. We harvest every {harvest_days}, dressed or live. Average dressed weight is {weight_min}–{weight_max} kg, with excellent flavor and consistent quality. Intro price is Ksh. {price} per bird. Can I book you for 50–100 birds? We deliver within {radius} km.",
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },

  // 13. FARM PLAN SCHEDULES (JSON)
  {
    id: 'fp_vaccination_schedule_json',
    pageId: 'farm-plan-vaccines',
    label: 'Vaccination & Health Schedule (JSON)',
    type: 'json',
    value: JSON.stringify(INITIAL_VACCINE_SCHEDULE),
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_housing_specs_json',
    pageId: 'farm-plan-housing',
    label: 'Housing & Equipment Specifications (JSON)',
    type: 'json',
    value: JSON.stringify(INITIAL_HOUSING_SPECS),
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  },
  {
    id: 'fp_daily_sops_json',
    pageId: 'farm-plan-sops',
    label: 'Attendant Daily SOPs & Timetable (JSON)',
    type: 'json',
    value: JSON.stringify(INITIAL_DAILY_SOPS),
    lastEditedBy: 'System Core',
    lastEditedAt: '2026-08-05 00:00',
    history: [],
  }
];

const LOCAL_STORAGE_KEY = 'chickmagnet_cms_blocks';

export const compressImageDataUrl = (dataUrl: string, maxDim: number = 1600): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl) {
      resolve(dataUrl);
      return;
    }

    // Preserve vector SVGs without canvas conversion to keep perfect scalability
    if (
      dataUrl.startsWith('data:image/svg+xml') ||
      dataUrl.includes('image/svg+xml') ||
      dataUrl.includes('<svg') ||
      dataUrl.endsWith('.svg')
    ) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;

      if (!naturalWidth || !naturalHeight) {
        resolve(dataUrl);
        return;
      }

      // If already within dimensions and under 2MB, avoid recompression
      if (naturalWidth <= maxDim && naturalHeight <= maxDim && dataUrl.length < 2 * 1024 * 1024) {
        resolve(dataUrl);
        return;
      }

      // Proportional scale factor that strictly preserves aspect ratio
      const scale = Math.min(maxDim / naturalWidth, maxDim / naturalHeight, 1);
      const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
      const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const isPng = dataUrl.startsWith('data:image/png');
      const isJpeg = dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg');

      let mimeType = 'image/png';
      if (isJpeg) {
        mimeType = 'image/jpeg';
      } else if (!isPng) {
        mimeType = 'image/webp';
      }

      try {
        const compressed = canvas.toDataURL(mimeType, mimeType === 'image/jpeg' ? 0.92 : undefined);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
};

export const getStoredCMSData = (): CMSBlock[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return DEFAULT_CMS_BLOCKS;
    const parsed: CMSBlock[] = JSON.parse(saved);
    
    // Merge defaults to guarantee all new keys are present
    const merged = [...DEFAULT_CMS_BLOCKS];
    parsed.forEach((storedBlock) => {
      const idx = merged.findIndex((b) => b.id === storedBlock.id);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...storedBlock };
      } else {
        merged.push(storedBlock);
      }
    });
    return merged;
  } catch (e) {
    console.error('Failed to parse CMS blocks from localStorage', e);
    return DEFAULT_CMS_BLOCKS;
  }
};

export const saveStoredCMSData = (blocks: CMSBlock[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blocks));
    window.dispatchEvent(new Event('sol_cms_updated'));
  } catch (e) {
    console.error('Failed to save CMS blocks to localStorage', e);
  }
};

export const updateCMSBlock = async (
  blockId: string,
  newValue: string | boolean,
  adminName: string = 'Admin'
) => {
  const currentBlocks = getStoredCMSData();
  const blockIndex = currentBlocks.findIndex((b) => b.id === blockId);
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  let updatedBlock: CMSBlock;

  if (blockIndex >= 0) {
    const existing = currentBlocks[blockIndex];
    const historyEntry: CMSHistoryEntry = {
      id: 'h_' + Date.now(),
      timestamp: now,
      adminName,
      oldValue: existing.value,
      newValue,
    };
    updatedBlock = {
      ...existing,
      value: newValue,
      lastEditedBy: adminName,
      lastEditedAt: now,
      history: [historyEntry, ...(existing.history || [])].slice(0, 20),
    };
    currentBlocks[blockIndex] = updatedBlock;
  } else {
    // Create new block
    updatedBlock = {
      id: blockId,
      pageId: 'global',
      label: blockId,
      type: typeof newValue === 'boolean' ? 'toggle' : 'text',
      value: newValue,
      lastEditedBy: adminName,
      lastEditedAt: now,
      history: [
        {
          id: 'h_' + Date.now(),
          timestamp: now,
          adminName,
          oldValue: '',
          newValue,
        },
      ],
    };
    currentBlocks.push(updatedBlock);
  }

  saveStoredCMSData(currentBlocks);

  // Sync to Firestore in background
  try {
    const blockDocRef = doc(db, 'cms_blocks', blockId);
    await setDoc(
      blockDocRef,
      {
        id: updatedBlock.id,
        pageId: updatedBlock.pageId,
        label: updatedBlock.label,
        type: updatedBlock.type,
        value: updatedBlock.value,
        lastEditedBy: updatedBlock.lastEditedBy,
        lastEditedAt: updatedBlock.lastEditedAt,
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `cms_blocks/${blockId}`);
  }
};

export const getCMSValue = (blockId: string, fallback?: string): string => {
  const blocks = getStoredCMSData();
  const found = blocks.find((b) => b.id === blockId);
  if (found && typeof found.value === 'string') {
    return found.value;
  }
  if (fallback !== undefined) return fallback;
  const def = DEFAULT_CMS_BLOCKS.find((b) => b.id === blockId);
  return def && typeof def.value === 'string' ? def.value : '';
};

export const getCMSToggle = (blockId: string, fallback: boolean = false): boolean => {
  const blocks = getStoredCMSData();
  const found = blocks.find((b) => b.id === blockId);
  if (found && typeof found.value === 'boolean') {
    return found.value;
  }
  const def = DEFAULT_CMS_BLOCKS.find((b) => b.id === blockId);
  return def && typeof def.value === 'boolean' ? def.value : fallback;
};

export function useCMSBlock(blockId: string, fallback?: string): string {
  const [val, setVal] = useState<string>(() => getCMSValue(blockId, fallback));

  useEffect(() => {
    const handleUpdate = () => {
      setVal(getCMSValue(blockId, fallback));
    };
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [blockId, fallback]);

  return val;
}

export function useCMSToggle(blockId: string, fallback: boolean = false): boolean {
  const [val, setVal] = useState<boolean>(() => getCMSToggle(blockId, fallback));

  useEffect(() => {
    const handleUpdate = () => {
      setVal(getCMSToggle(blockId, fallback));
    };
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [blockId, fallback]);

  return val;
}

// ----------------------------------------------------
// DYNAMIC FAQS HOOK & HANDLERS
// ----------------------------------------------------
export interface FAQItem {
  id: string;
  q: string;
  a: string;
  category?: string;
}

export const getStoredFAQs = (): FAQItem[] => {
  try {
    const raw = getCMSValue('faqs_data_json');
    if (!raw) return INITIAL_FAQS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_FAQS;
  } catch (e) {
    return INITIAL_FAQS;
  }
};

export const saveStoredFAQs = async (faqs: FAQItem[], adminName: string = 'Admin') => {
  await updateCMSBlock('faqs_data_json', JSON.stringify(faqs), adminName);
};

export function useDynamicFAQs() {
  const [faqs, setFaqs] = useState<FAQItem[]>(getStoredFAQs);

  useEffect(() => {
    const handleUpdate = () => {
      setFaqs(getStoredFAQs());
    };
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addFaq = async (newFaq: Omit<FAQItem, 'id'>, adminName?: string) => {
    const item: FAQItem = {
      ...newFaq,
      id: 'faq-' + Date.now()
    };
    const updated = [...faqs, item];
    setFaqs(updated);
    await saveStoredFAQs(updated, adminName);
  };

  const updateFaq = async (id: string, updatedFields: Partial<FAQItem>, adminName?: string) => {
    const updated = faqs.map(f => f.id === id ? { ...f, ...updatedFields } : f);
    setFaqs(updated);
    await saveStoredFAQs(updated, adminName);
  };

  const deleteFaq = async (id: string, adminName?: string) => {
    const updated = faqs.filter(f => f.id !== id);
    setFaqs(updated);
    await saveStoredFAQs(updated, adminName);
  };

  return {
    faqs,
    addFaq,
    updateFaq,
    deleteFaq
  };
}

// ----------------------------------------------------
// FARM PLAN COMPREHENSIVE DATA MODEL & HOOK
// ----------------------------------------------------
export interface FarmPlanData {
  farmTitle: string;
  farmSubtitle: string;
  farmLocation: string;
  initialPlaced: number;
  currentLive: number;
  mortalityCount: number;
  sunkCost: number;
  futureBufferPct: number;
  remainingCostR: number;
  targetProfitTier1: number;
  targetProfitTier2: number;
  targetProfitTier3: number;
  activeProfitTarget: number;
  
  // Computed values
  conservativeSaleable: number;
  totalRemainingCost: number;
  requiredTotalRevenue: number;
  requiredPricePerBird: number;
  mortalityPct: number;

  // Feed
  starterBagsOnHand: number;
  starterKgPerBag: number;
  starterDailyIntakeKg: number;
  starterKgOnHand: number;
  starterDaysCovered: number;
  feedSupplier: string;
  costStarterBag: number;
  costGrowerBag: number;
  costFinisherBag: number;
  targetFCR: number;

  // Marketing & Sales
  harvestDays: string;
  weightMin: number;
  weightMax: number;
  deliveryRadiusKm: number;
  pitchScriptTemplate: string;
  pitchScript: string;

  // Structured Schedules
  vaccinationSchedule: {
    id: string;
    dayOrWeek: string;
    vaccine: string;
    route: string;
    instructions: string;
    notes: string;
  }[];
  housingSpecs: {
    id: string;
    label: string;
    value: string;
    note: string;
  }[];
  dailySops: {
    id: string;
    time: string;
    task: string;
    details: string;
    critical: boolean;
  }[];
}

export const getStoredFarmPlan = (): FarmPlanData => {
  const farmTitle = getCMSValue('fp_farm_title', '600-Flock Improved Kienyeji Operational Command');
  const farmSubtitle = getCMSValue('fp_farm_subtitle', 'Real-time target pricing matrix, feed inventory SOP, vaccination calendar, and daily attendant checklists based on your master farm plan.');
  const farmLocation = getCMSValue('fp_farm_location', 'Naivasha Farm');
  
  const initialPlaced = Number(getCMSValue('fp_initial_placed', '600')) || 600;
  const currentLive = Number(getCMSValue('fp_current_live', '570')) || 570;
  const mortalityCount = Number(getCMSValue('fp_mortality_count', '30')) || 30;
  const sunkCost = Number(getCMSValue('fp_sunk_cost', '346788')) || 346788;
  const futureBufferPct = Number(getCMSValue('fp_future_buffer_pct', '5')) || 5;
  const remainingCostR = Number(getCMSValue('fp_remaining_cost_r', '500')) || 500;
  const targetProfitTier1 = Number(getCMSValue('fp_target_profit_tier_1', '69000')) || 69000;
  const targetProfitTier2 = Number(getCMSValue('fp_target_profit_tier_2', '80000')) || 80000;
  const targetProfitTier3 = Number(getCMSValue('fp_target_profit_tier_3', '104000')) || 104000;
  const activeProfitTarget = Number(getCMSValue('fp_active_profit_target', '80000')) || 80000;

  // Computed calculations
  const bufferMargin = futureBufferPct / 100;
  const conservativeSaleable = Math.round(currentLive * (1 - bufferMargin));
  const totalRemainingCost = conservativeSaleable * remainingCostR;
  const requiredTotalRevenue = sunkCost + activeProfitTarget + totalRemainingCost;
  const requiredPricePerBird = conservativeSaleable > 0 ? Math.round(requiredTotalRevenue / conservativeSaleable) : 0;
  const mortalityPct = initialPlaced > 0 ? Number(((mortalityCount / initialPlaced) * 100).toFixed(1)) : 0;

  // Feed
  const starterBagsOnHand = Number(getCMSValue('fp_starter_bags_on_hand', '5.5')) || 5.5;
  const starterKgPerBag = Number(getCMSValue('fp_starter_kg_per_bag', '50')) || 50;
  const starterDailyIntakeKg = Number(getCMSValue('fp_starter_daily_intake_kg', '0.035')) || 0.035;
  const starterKgOnHand = starterBagsOnHand * starterKgPerBag;
  const dailyIntakeFlock = currentLive * starterDailyIntakeKg;
  const starterDaysCovered = dailyIntakeFlock > 0 ? Math.round(starterKgOnHand / dailyIntakeFlock) : 0;

  const feedSupplier = getCMSValue('fp_feed_supplier', 'Ungwa Bio-Feeds Starter & ChickMagnet Grower');
  const costStarterBag = Number(getCMSValue('fp_cost_starter_bag', '3600')) || 3600;
  const costGrowerBag = Number(getCMSValue('fp_cost_grower_bag', '3100')) || 3100;
  const costFinisherBag = Number(getCMSValue('fp_cost_finisher_bag', '2950')) || 2950;
  const targetFCR = Number(getCMSValue('fp_target_fcr', '2.1')) || 2.1;

  // Marketing
  const harvestDays = getCMSValue('fp_harvest_days', 'Friday and Saturday');
  const weightMin = Number(getCMSValue('fp_weight_min', '1.3')) || 1.3;
  const weightMax = Number(getCMSValue('fp_weight_max', '1.6')) || 1.6;
  const deliveryRadiusKm = Number(getCMSValue('fp_delivery_radius_km', '25')) || 25;
  const pitchScriptTemplate = getCMSValue(
    'fp_pitch_script_template',
    "Hi, we're supplying improved kienyeji birds from {location}. We harvest every {harvest_days}, dressed or live. Average dressed weight is {weight_min}–{weight_max} kg, with excellent flavor and consistent quality. Intro price is Ksh. {price} per bird. Can I book you for 50–100 birds? We deliver within {radius} km."
  );

  const pitchScript = pitchScriptTemplate
    .replace('{location}', farmLocation)
    .replace('{harvest_days}', harvestDays)
    .replace('{weight_min}', weightMin.toString())
    .replace('{weight_max}', weightMax.toString())
    .replace('{price}', requiredPricePerBird.toString())
    .replace('{radius}', deliveryRadiusKm.toString());

  // Schedules JSON parsing
  let vaccinationSchedule = INITIAL_VACCINE_SCHEDULE;
  try {
    const rawVax = getCMSValue('fp_vaccination_schedule_json');
    if (rawVax) vaccinationSchedule = JSON.parse(rawVax);
  } catch (e) {}

  let housingSpecs = INITIAL_HOUSING_SPECS;
  try {
    const rawHousing = getCMSValue('fp_housing_specs_json');
    if (rawHousing) housingSpecs = JSON.parse(rawHousing);
  } catch (e) {}

  let dailySops = INITIAL_DAILY_SOPS;
  try {
    const rawSops = getCMSValue('fp_daily_sops_json');
    if (rawSops) dailySops = JSON.parse(rawSops);
  } catch (e) {}

  return {
    farmTitle,
    farmSubtitle,
    farmLocation,
    initialPlaced,
    currentLive,
    mortalityCount,
    sunkCost,
    futureBufferPct,
    remainingCostR,
    targetProfitTier1,
    targetProfitTier2,
    targetProfitTier3,
    activeProfitTarget,
    conservativeSaleable,
    totalRemainingCost,
    requiredTotalRevenue,
    requiredPricePerBird,
    mortalityPct,
    starterBagsOnHand,
    starterKgPerBag,
    starterDailyIntakeKg,
    starterKgOnHand,
    starterDaysCovered,
    feedSupplier,
    costStarterBag,
    costGrowerBag,
    costFinisherBag,
    targetFCR,
    harvestDays,
    weightMin,
    weightMax,
    deliveryRadiusKm,
    pitchScriptTemplate,
    pitchScript,
    vaccinationSchedule,
    housingSpecs,
    dailySops
  };
};

export function useFarmPlanData() {
  const [data, setData] = useState<FarmPlanData>(getStoredFarmPlan);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getStoredFarmPlan());
    };
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateField = async (blockKey: string, value: string | number | boolean | object, adminName: string = 'Admin') => {
    const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await updateCMSBlock(blockKey, strVal, adminName);
    setData(getStoredFarmPlan());
  };

  return {
    data,
    updateField,
    refresh: () => setData(getStoredFarmPlan())
  };
}

// ----------------------------------------------------
// BRAND LOGO & PLATFORM HEADER
// ----------------------------------------------------
export interface BrandLogoConfig {
  logoType: 'emoji' | 'image';
  logoDisplayMode?: 'image_only' | 'image_with_text' | 'emoji_with_text';
  logoEmoji: string;
  logoImageUrl: string;
  brandName: string;
}

export const getStoredBrandLogo = (): BrandLogoConfig => {
  const blocks = getStoredCMSData();
  const logoTypeBlock = blocks.find(b => b.id === 'global_logo_type');
  const logoDisplayModeBlock = blocks.find(b => b.id === 'global_logo_display_mode');
  const logoEmojiBlock = blocks.find(b => b.id === 'global_logo_emoji');
  const logoImageBlock = blocks.find(b => b.id === 'global_logo_image_url');
  const brandNameBlock = blocks.find(b => b.id === 'global_platform_name');

  const rawLogoUrl = logoImageBlock?.value as string;
  const logoImageUrl = (!rawLogoUrl || rawLogoUrl === '/logo.svg') ? defaultLogoImg : rawLogoUrl;
  const rawType = logoTypeBlock?.value as 'emoji' | 'image' | undefined;
  const logoType = rawType || 'image';
  const rawDisplayMode = logoDisplayModeBlock?.value as 'image_only' | 'image_with_text' | 'emoji_with_text' | undefined;
  const logoDisplayMode = rawDisplayMode || 'image_only';

  return {
    logoType,
    logoDisplayMode,
    logoEmoji: (logoEmojiBlock?.value as string) || '🐔',
    logoImageUrl,
    brandName: (brandNameBlock?.value as string) || 'ChickMagnet',
  };
};

export const updateBrandLogo = async (config: Partial<BrandLogoConfig>, adminName: string = 'Admin') => {
  if (config.logoType !== undefined) {
    await updateCMSBlock('global_logo_type', config.logoType, adminName);
  }
  if (config.logoDisplayMode !== undefined) {
    await updateCMSBlock('global_logo_display_mode', config.logoDisplayMode, adminName);
  }
  if (config.logoEmoji !== undefined) {
    await updateCMSBlock('global_logo_emoji', config.logoEmoji, adminName);
  }
  if (config.logoImageUrl !== undefined) {
    let finalUrl = config.logoImageUrl;
    if (finalUrl && finalUrl.startsWith('data:image/') && finalUrl.length > 2.5 * 1024 * 1024 && !finalUrl.includes('image/svg+xml')) {
      finalUrl = await compressImageDataUrl(finalUrl, 1600);
    }
    await updateCMSBlock('global_logo_image_url', finalUrl, adminName);
  }
  if (config.brandName !== undefined) {
    await updateCMSBlock('global_platform_name', config.brandName, adminName);
  }
  window.dispatchEvent(new Event('chickmagnet_brand_updated'));
};

export function useBrandLogo(): BrandLogoConfig {
  const [brand, setBrand] = useState<BrandLogoConfig>(getStoredBrandLogo);

  useEffect(() => {
    const handleUpdate = () => {
      setBrand(getStoredBrandLogo());
    };
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('chickmagnet_brand_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('chickmagnet_brand_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return brand;
}
