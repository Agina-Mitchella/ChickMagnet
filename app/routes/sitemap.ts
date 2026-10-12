import type { LoaderFunctionArgs } from 'react-router';
import { getAbsoluteUrl, getProductPath } from '../../src/utils/productSeo';
import { loadPublicCatalogue } from '../lib/catalog.server';

const STATIC_PATHS = [
  '/',
  '/shop',
  '/shop/live-chicken',
  '/shop/fresh-chicken',
  '/shop/eggs',
  '/wholesale',
  '/about',
  '/faqs',
  '/guides/chicken-prices-by-age',
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function lastModified(productUpdatedAt: unknown): string | undefined {
  if (typeof productUpdatedAt === 'string') {
    const parsed = new Date(productUpdatedAt);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  if (typeof productUpdatedAt === 'object' && productUpdatedAt !== null && 'seconds' in productUpdatedAt) {
    const seconds = Number((productUpdatedAt as { seconds: unknown }).seconds);
    if (Number.isFinite(seconds)) return new Date(seconds * 1000).toISOString();
  }
  return undefined;
}

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  const products = await loadPublicCatalogue();
  const productEntries = products
    .filter(product => product.searchVisibility !== 'noindex' && product.catalogStatus !== 'archived')
    .map(product => ({
      location: getAbsoluteUrl(getProductPath(product)),
      lastmod: lastModified(product.updatedAt),
    }));
  const entries = [
    ...STATIC_PATHS.map(path => ({ location: getAbsoluteUrl(path), lastmod: undefined })),
    ...productEntries,
  ];
  const urls = entries.map(entry => [
    '  <url>',
    `    <loc>${escapeXml(entry.location)}</loc>`,
    ...(entry.lastmod ? [`    <lastmod>${entry.lastmod}</lastmod>`] : []),
    '  </url>',
  ].join('\n')).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(request.method === 'HEAD' ? null : xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  });
}
