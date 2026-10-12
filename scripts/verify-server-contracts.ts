import assert from 'node:assert/strict';
import type { EntryContext } from 'react-router';
import entryServer from '../app/entry.server';
import { resolveCatalogueRefresh, type CatalogueCache } from '../app/lib/catalog.server';
import { resolveProductBySlug } from '../app/lib/product-route.server';
import type { Product } from '../src/types';

const redirectContext = {} as EntryContext;
const hostileHostRedirect = await entryServer(
  new Request('https://attacker.example/shop/?campaign=chickmagnet'),
  200,
  new Headers(),
  redirectContext,
);
assert.equal(hostileHostRedirect.status, 308);
assert.equal(
  hostileHostRedirect.headers.get('Location'),
  '/shop?campaign=chickmagnet',
  'Path canonicalization must never reuse an untrusted request authority.',
);
assert.match(
  hostileHostRedirect.headers.get('Content-Security-Policy') || '',
  /default-src 'self'/,
  'Early redirects must retain the standard security headers.',
);

const apexRedirect = await entryServer(
  new Request('https://chickmagnet.xyz/about/?source=direct'),
  200,
  new Headers(),
  redirectContext,
);
assert.equal(apexRedirect.status, 308);
assert.equal(
  apexRedirect.headers.get('Location'),
  'https://www.chickmagnet.xyz/about?source=direct',
  'The apex redirect must use the fixed canonical origin and normalized path.',
);

const publishedProduct = {
  id: 'published-product',
  name: 'Published Product',
  slug: 'published-product',
  previousSlugs: ['previous-product'],
  catalogStatus: 'published',
  showOnStorefront: true,
} as Product;

const archivedProduct = {
  ...publishedProduct,
  id: 'archived-product',
  slug: 'archived-product',
  previousSlugs: [],
  catalogStatus: 'archived',
  showOnStorefront: false,
} as Product;

const redirectResolution = resolveProductBySlug([publishedProduct], 'previous-product');
assert.deepEqual(redirectResolution, {
  type: 'redirect',
  location: '/products/published-product',
});

assert.throws(
  () => resolveProductBySlug([archivedProduct], 'archived-product'),
  error => error instanceof Response && error.status === 410,
  'Archived products must return 410.',
);

const cachedProducts = [publishedProduct];
const freshCache: CatalogueCache = { products: cachedProducts, refreshedAt: 1_000 };
let refreshCalls = 0;
const cachedResolution = await resolveCatalogueRefresh(freshCache, async () => {
  refreshCalls += 1;
  return [];
}, 1_001);
assert.equal(refreshCalls, 0, 'A fresh catalogue cache must not trigger a Firestore read.');
assert.equal(cachedResolution.cache, freshCache);

const staleCache: CatalogueCache = { products: cachedProducts, refreshedAt: 0 };
const staleResolution = await resolveCatalogueRefresh(staleCache, async () => {
  throw new Error('Simulated Firestore outage');
}, 600_000);
assert.equal(staleResolution.cache, staleCache);
assert.equal(staleResolution.products, cachedProducts);

const originalConsoleError = console.error;
console.error = () => undefined;
try {
  await assert.rejects(
    () => resolveCatalogueRefresh(undefined, async () => {
      throw new Error('Simulated cold Firestore outage');
    }),
    error => (
      error instanceof Response
      && error.status === 503
      && error.headers.get('Retry-After') === '60'
    ),
    'An uncached catalogue failure must return a retryable 503.',
  );
} finally {
  console.error = originalConsoleError;
}

console.log('Server status and catalogue cache contracts passed.');
