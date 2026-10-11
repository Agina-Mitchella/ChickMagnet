import type { Product } from '../types';

interface StorefrontCopy {
  sourceName: string;
  legacyNames?: string[];
  name: string;
  description: string;
}

const STOREFRONT_COPY: Record<string, StorefrontCopy> = {
  'prod-layer-pullet': {
    sourceName: 'Improved Kienyeji Point-of-Lay Pullets (18 Weeks)',
    legacyNames: ['Kienyeji Point-of-Lay Pullets (18 Weeks)'],
    name: 'Improved Kienyeji Chickens (18 Weeks)',
    description: 'Improved Kienyeji chickens, approximately 18 weeks old.'
  },
  'prod-kuroiler-rooster': {
    sourceName: 'Kienyeji & Kuroiler Stud Roosters (24 Weeks, 3.2kg+)',
    legacyNames: ['Kienyeji Breeding Roosters (Active Studs, 24 Weeks)'],
    name: 'Kuroiler Chickens (24 Weeks)',
    description: 'Kuroiler chickens, approximately 24 weeks old.'
  },
  'prod-rainbow-rooster-chicks': {
    sourceName: 'Rainbow Rooster Day-Old Chicks (Vaccinated at Hatch)',
    legacyNames: ['Rainbow Rooster Day-Old Chicks (Vaccinated)'],
    name: 'Rainbow Day-Old Chicks',
    description: 'Day-old Rainbow chicks for retail and wholesale orders.'
  },
  'prod-improved-kienyeji-dressed': {
    sourceName: 'Dressed Improved Kienyeji Whole Bird (Air-Chilled, 1.3-1.6kg)',
    legacyNames: ['Dressed Improved Kienyeji (Gutted & Chilled, 1.3-1.6kg)'],
    name: 'Whole Improved Kienyeji Chicken (1.3–1.6 kg)',
    description: 'Whole Improved Kienyeji chicken, cleaned and chilled.'
  },
  'prod-boneless-breast-skinless': {
    sourceName: 'Prime Boneless Skinless Chicken Breast (1kg Vacuum Pack)',
    legacyNames: ['Prime Boneless Skinless Chicken Breast (1kg Pack)'],
    name: 'Boneless Skinless Chicken Breast (1 kg)',
    description: 'Boneless, skinless chicken breast packed in a 1 kg portion.'
  },
  'prod-jumbo-golden-table-eggs': {
    sourceName: 'Kienyeji Golden Yolk Farm Eggs (Tray of 30)',
    name: 'Kienyeji Table Eggs (Tray of 30)',
    description: 'A tray of 30 Kienyeji table eggs.'
  },
  'prod-fertile-hatching-eggs-kuroiler': {
    sourceName: 'Fertile Improved Kienyeji Hatching Eggs (Tray of 30)',
    name: 'Improved Kienyeji Hatching Eggs (Tray of 30)',
    description: 'A tray of 30 Improved Kienyeji hatching eggs.'
  },
  'prod-fresh-wings-1kg': {
    sourceName: 'Prime Air-Chilled Chicken Wings (1kg Pack)',
    name: 'Chicken Wings (1 kg)',
    description: 'Fresh chicken wings packed in a 1 kg portion.'
  },
  'prod-fresh-drumsticks-1kg': {
    sourceName: 'Tender Air-Chilled Chicken Drumsticks (1kg Pack)',
    name: 'Chicken Drumsticks (1 kg)',
    description: 'Fresh chicken drumsticks packed in a 1 kg portion.'
  },
  'prod-sasso-chicks': {
    sourceName: 'Sasso French Dual-Purpose Day-Old Chicks (Vaccinated)',
    name: 'Sasso Day-Old Chicks',
    description: 'Day-old Sasso chicks for retail and wholesale orders.'
  },
  'prod-cobb500-broiler-chicks': {
    sourceName: 'Cobb 500 Fast Broiler Chicks (33-Day FCR Champion)',
    name: 'Cobb 500 Day-Old Chicks',
    description: 'Day-old Cobb 500 broiler chicks for retail and wholesale orders.'
  },
  'prod-kenbro-pullet': {
    sourceName: 'Kenbro Dual-Purpose Point-of-Lay Pullets (18 Weeks)',
    name: 'Kenbro Chickens (18 Weeks)',
    description: 'Kenbro chickens, approximately 18 weeks old.'
  },
  'prod-black-australorp-chicks': {
    sourceName: 'Black Australorp Heritage Day-Old Chicks (World Record Layer)',
    name: 'Black Australorp Day-Old Chicks',
    description: 'Day-old Black Australorp chicks for retail and wholesale orders.'
  },
  'prod-grower-broilers': {
    sourceName: 'Started Broiler Growers (4 Weeks, Off-Heat, 1.2kg)',
    name: 'Broiler Chickens (4 Weeks)',
    description: 'Four-week-old broiler chickens.'
  },
  'prod-fresh-gizzards-1kg': {
    sourceName: 'Farm-Fresh Cleaned Chicken Gizzards (1kg Vacuum Pack)',
    name: 'Cleaned Chicken Gizzards (1 kg)',
    description: 'Cleaned chicken gizzards packed in a 1 kg portion.'
  },
  'prod-fresh-thighs-1kg': {
    sourceName: 'Juicy Farm-Fresh Chicken Thighs & Quarters (1kg Skin-On)',
    name: 'Chicken Thighs and Quarters (1 kg)',
    description: 'Skin-on chicken thighs and quarters packed in a 1 kg portion.'
  },
  'prod-whole-dressed-broiler': {
    sourceName: 'Whole Dressed Tender Broiler (1.2-1.4kg, Air-Chilled Halal)',
    name: 'Whole Broiler Chicken (1.2–1.4 kg)',
    description: 'Whole broiler chicken, cleaned and chilled.'
  },
  'prod-whole-dressed-chicken': {
    sourceName: 'Whole Dressed Farm Broiler (1.4kg - 1.6kg)',
    name: 'Whole Broiler Chicken (1.4–1.6 kg)',
    description: 'Whole broiler chicken, cleaned and chilled.'
  },
  'prod-artisan-chicken-sausages': {
    sourceName: 'Artisan Farmhouse Chicken Sausages (500g / 8 Pcs, Garden Herbs)',
    name: 'Chicken Sausages (500 g)',
    description: 'Eight chicken sausages packed in a 500 g portion.'
  },
  'prod-smoked-chicken-breast': {
    sourceName: 'Hickory-Smoked Chicken Breast Fillets (400g Sliced Pack)',
    name: 'Smoked Chicken Breast (400 g)',
    description: 'Sliced smoked chicken breast packed in a 400 g portion.'
  },
  'prod-fertile-hatching-eggs-sasso': {
    sourceName: 'Fertile Sasso Dual-Purpose Hatching Eggs (Tray of 30, 92%+ Fertility)',
    name: 'Sasso Hatching Eggs (Tray of 30)',
    description: 'A tray of 30 Sasso hatching eggs.'
  },
  'prod-jumbo-quail-eggs': {
    sourceName: 'Specialty Farm-Fresh Quail Eggs (Pack of 30, Nutrient-Dense)',
    name: 'Quail Eggs (Pack of 30)',
    description: 'A pack of 30 quail eggs.'
  },
  'prod-organic-omega3-table-eggs': {
    sourceName: 'Pasture-Raised Omega-3 Golden Eggs (Tray of 30, Flaxseed Fortified)',
    name: 'Omega-3 Table Eggs (Tray of 30)',
    description: 'A tray of 30 Omega-3 table eggs.'
  }
};

const CURRENT_STOREFRONT_CATEGORIES = new Set<Product['category']>([
  'live-birds',
  'fresh-poultry',
  'processed',
  'eggs'
]);

export function isCurrentStorefrontProduct(product: Product): boolean {
  if (typeof product.showOnStorefront === 'boolean') {
    return product.showOnStorefront;
  }

  return CURRENT_STOREFRONT_CATEGORIES.has(product.category);
}

export function applyStorefrontCopy(product: Product): Product {
  const copy = STOREFRONT_COPY[product.id];
  if (!copy || ![copy.sourceName, ...(copy.legacyNames ?? [])].includes(product.name)) {
    return product;
  }

  return {
    ...product,
    name: copy.name,
    description: copy.description
  };
}
