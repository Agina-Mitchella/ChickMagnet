import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore/lite';
import firebaseConfig from '../../firebase-applet-config.json';
import { STOREFRONT_PRODUCTS } from '../../src/data/storefrontCatalog';
import type { Product } from '../../src/types';
import { normalizeProductSeo } from '../../src/utils/productSeo';
import { applyStorefrontCopy, isCurrentStorefrontProduct } from '../../src/utils/storefrontProducts';

const APP_NAME = 'chickmagnet-public-ssr';
const FRESH_CACHE_MS = 5 * 60 * 1000;

export type CatalogueCache = {
  products: Product[];
  refreshedAt: number;
};

let catalogueCache: CatalogueCache | undefined;

function getPublicFirestore() {
  const firebaseApp = getApps().some(candidate => candidate.name === APP_NAME)
    ? getApp(APP_NAME)
    : initializeApp(firebaseConfig, APP_NAME);
  return getFirestore(firebaseApp);
}

function serializeUpdatedAt(value: unknown): Product['updatedAt'] {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const dateValue = (value as { toDate: () => Date }).toDate();
    return dateValue.toISOString();
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = Number((value as { seconds: unknown }).seconds);
    if (Number.isFinite(seconds)) return new Date(seconds * 1000).toISOString();
  }
  return undefined;
}

function mergeCatalogue(overrides: Map<string, Partial<Product>>): Product[] {
  const merged = STOREFRONT_PRODUCTS.map(defaultProduct => {
    const override = overrides.get(defaultProduct.id);
    overrides.delete(defaultProduct.id);
    return normalizeProductSeo(applyStorefrontCopy({
      ...defaultProduct,
      ...override,
      id: defaultProduct.id,
      updatedAt: serializeUpdatedAt(override?.updatedAt) ?? defaultProduct.updatedAt,
    }));
  });

  for (const [id, override] of overrides) {
    const isArchived = override.catalogStatus === 'archived';
    if ((!isArchived && override.showOnStorefront !== true) || !override.name || !override.description) continue;
    const product = normalizeProductSeo(applyStorefrontCopy({ ...override, id } as Product));
    if (isArchived || isCurrentStorefrontProduct(product)) merged.push(product);
  }

  const slugOwners = new Map<string, string>();
  for (const product of merged) {
    const existingOwner = slugOwners.get(product.slug);
    if (existingOwner && existingOwner !== product.id) {
      throw new Error(`Duplicate public product slug: ${product.slug}`);
    }
    slugOwners.set(product.slug, product.id);
  }

  return merged.sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0));
}

async function refreshCatalogue(): Promise<Product[]> {
  const snapshot = await getDocs(collection(getPublicFirestore(), 'products'));
  const overrides = new Map(
    snapshot.docs.map(document => [document.id, document.data() as Partial<Product>]),
  );
  return mergeCatalogue(overrides);
}

export async function resolveCatalogueRefresh(
  cache: CatalogueCache | undefined,
  refresh: () => Promise<Product[]>,
  now = Date.now(),
): Promise<{ products: Product[]; cache: CatalogueCache }> {
  if (cache && now - cache.refreshedAt < FRESH_CACHE_MS) {
    return { products: cache.products, cache };
  }

  try {
    const products = await refresh();
    return { products, cache: { products, refreshedAt: now } };
  } catch (error) {
    if (cache) return { products: cache.products, cache };

    console.error('Unable to load the current public catalogue.', error);
    throw new Response('The current catalogue could not be confirmed.', {
      status: 503,
      headers: { 'Retry-After': '60' },
    });
  }
}

export async function loadPublicCatalogue(options: { includeArchived?: boolean } = {}): Promise<Product[]> {
  const resolved = await resolveCatalogueRefresh(catalogueCache, refreshCatalogue);
  catalogueCache = resolved.cache;
  const products = resolved.products;

  return products.filter(product => {
    if (options.includeArchived) return true;
    return product.catalogStatus !== 'archived'
      && product.showOnStorefront !== false
      && isCurrentStorefrontProduct(product);
  });
}

export const publicCatalogueCacheHeaders = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
  'Vary': 'Accept-Encoding',
};
