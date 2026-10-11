import type { BuyerType, Product } from '../types';
import {
  LEGACY_STOREFRONT_PRODUCT_IDS,
  STOREFRONT_PRODUCTS,
  STOREFRONT_PRODUCT_IDS,
} from '../data/storefrontCatalog';

const CURRENT_STOREFRONT_CATEGORIES = new Set<Product['category']>([
  'live-birds',
  'fresh-poultry',
  'eggs',
]);

const CANONICAL_STOREFRONT_PRODUCTS = new Map(
  STOREFRONT_PRODUCTS.map(product => [product.id, product]),
);

const LEGACY_PRODUCT_NAMES = new Map<string, string>([
  ['Live Improved Kienyeji Chicken', 'Mature Improved Kienyeji Chicken'],
  ['Live Turkey', 'Mature Turkey'],
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

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function productMatchesSearch(product: Product, rawQuery: string): boolean {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;

  const searchableValues = [
    product.name,
    product.description,
    product.category,
    product.unit,
    ...product.tags,
    ...(product.searchTerms ?? []),
    ...(product.variantsConfig?.ageOptions?.map(option => option.label) ?? []),
  ];

  const searchableText = normalizeSearchText(searchableValues.filter(Boolean).join(' '));
  const searchableTokens = searchableText.split(' ');
  const queryTokens = query.split(' ');

  return searchableTokens.some((_, startIndex) => {
    return queryTokens.every((queryToken, offset) => {
      const searchableToken = searchableTokens[startIndex + offset];
      if (!searchableToken) return false;
      if (/^\d+$/.test(queryToken)) return searchableToken === queryToken;
      return searchableToken.startsWith(queryToken);
    });
  });
}

// CMS products already contain their storefront copy. This compatibility
// export keeps existing callers stable while the old seeded copy layer retires.
export function applyStorefrontCopy(product: Product): Product {
  const canonicalProduct = CANONICAL_STOREFRONT_PRODUCTS.get(product.id);
  const migratedName = LEGACY_PRODUCT_NAMES.get(product.name) ?? product.name;

  return {
    ...product,
    name: migratedName,
    productGuide: product.productGuide ?? canonicalProduct?.productGuide,
  };
}
