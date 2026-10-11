import type { BuyerType, Product } from '../types';
import {
  LEGACY_STOREFRONT_PRODUCT_IDS,
  STOREFRONT_PRODUCT_IDS,
} from '../data/storefrontCatalog';

const CURRENT_STOREFRONT_CATEGORIES = new Set<Product['category']>([
  'live-birds',
  'fresh-poultry',
  'eggs',
]);

export function isCurrentStorefrontProduct(product: Product): boolean {
  if (product.showOnStorefront === false) return false;
  if (STOREFRONT_PRODUCT_IDS.has(product.id)) return true;
  if (LEGACY_STOREFRONT_PRODUCT_IDS.has(product.id)) return false;

  return product.showOnStorefront === true
    && CURRENT_STOREFRONT_CATEGORIES.has(product.category);
}

export function isProductAvailableForBuyer(product: Product, buyerType: BuyerType): boolean {
  const channel = buyerType === 'wholesale' ? 'wholesale' : 'retail';
  return !product.salesChannels?.length || product.salesChannels.includes(channel);
}

export function productMatchesSearch(product: Product, rawQuery: string): boolean {
  const query = rawQuery.trim().toLocaleLowerCase();
  if (!query) return true;

  const searchableValues = [
    product.name,
    product.description,
    product.category,
    product.subCategory,
    product.unit,
    ...product.tags,
    ...(product.searchTerms ?? []),
    ...(product.variantsConfig?.ageOptions?.map(option => option.label) ?? []),
  ];

  return searchableValues.some(value => value?.toLocaleLowerCase().includes(query));
}

// CMS products already contain their storefront copy. This compatibility
// export keeps existing callers stable while the old seeded copy layer retires.
export function applyStorefrontCopy(product: Product): Product {
  return product;
}
