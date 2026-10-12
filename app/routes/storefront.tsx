import { data, type LinksFunction, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import App from '../../src/App.tsx';
import type { BuyerType, MainCategory } from '../../src/types';
import { getProductPath } from '../../src/utils/productSeo';
import { isProductAvailableForBuyer } from '../../src/utils/storefrontProducts';
import { loadPublicCatalogue, publicCatalogueCacheHeaders } from '../lib/catalog.server';
import { breadcrumbSchema, buildMeta, organizationSchema, previewAwareRobots } from '../lib/seo';

export const links: LinksFunction = () => [
  {
    rel: 'preload',
    as: 'image',
    href: '/images/hero-commercial-farm-mobile.avif',
    type: 'image/avif',
    media: '(max-width: 639px)',
    fetchPriority: 'high',
  },
  {
    rel: 'preload',
    as: 'image',
    href: '/images/hero-commercial-farm-desktop.avif',
    type: 'image/avif',
    media: '(min-width: 640px)',
    fetchPriority: 'high',
  },
];

const ROUTE_CONTENT: Record<string, {
  title: string;
  description: string;
  canonicalPath: string;
  category: MainCategory | 'all';
  buyerType: BuyerType;
}> = {
  '/': {
    title: 'ChickMagnet | Chicken and Eggs in Kenya',
    description: 'Buy live chicken, fresh chicken and eggs directly from ChickMagnet for retail or commercial wholesale orders in Kenya.',
    canonicalPath: '/',
    category: 'all',
    buyerType: 'retail',
  },
  '/shop': {
    title: 'Shop Chicken and Eggs in Kenya | ChickMagnet',
    description: 'Browse ChickMagnet live chicken, fresh chicken, chicken cuts and eggs for retail orders in Kenya.',
    canonicalPath: '/shop',
    category: 'all',
    buyerType: 'retail',
  },
  '/shop/live-chicken': {
    title: 'Live Chicken for Sale in Kenya | ChickMagnet',
    description: 'Browse mature Improved Kienyeji, Sasso, Kenbro, Kuroiler, broiler chicken and turkey sold directly by ChickMagnet.',
    canonicalPath: '/shop/live-chicken',
    category: 'live-birds',
    buyerType: 'retail',
  },
  '/shop/fresh-chicken': {
    title: 'Fresh Chicken and Chicken Cuts in Kenya | ChickMagnet',
    description: 'Shop whole dressed chicken and fresh chicken cuts sold by weight directly from ChickMagnet.',
    canonicalPath: '/shop/fresh-chicken',
    category: 'fresh-poultry',
    buyerType: 'retail',
  },
  '/shop/eggs': {
    title: 'Fresh Eggs by the Tray in Kenya | ChickMagnet',
    description: 'Buy fresh eggs by the tray directly from ChickMagnet for homes and commercial buyers in Kenya.',
    canonicalPath: '/shop/eggs',
    category: 'eggs',
    buyerType: 'retail',
  },
  '/wholesale': {
    title: 'Wholesale Chicks and Poultry in Kenya | ChickMagnet',
    description: 'Order Improved Kienyeji, Sasso, Kenbro and Kuroiler chicks for commercial wholesale, with a minimum of 10 chickens per breed and age.',
    canonicalPath: '/wholesale',
    category: 'all',
    buyerType: 'wholesale',
  },
};

function resolveWholesaleCategory(value: string | null): MainCategory | 'all' {
  if (value === 'live-chicken') return 'live-birds';
  if (value === 'eggs') return 'eggs';
  return 'all';
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const route = ROUTE_CONTENT[url.pathname] ?? ROUTE_CONTENT['/shop'];
  const category = route.buyerType === 'wholesale'
    ? resolveWholesaleCategory(url.searchParams.get('category'))
    : route.category;
  const searchQuery = url.searchParams.get('q')?.trim() ?? '';
  const products = await loadPublicCatalogue();
  const visibleProducts = products.filter(product => {
    const categoryMatches = category === 'all' || product.category === category;
    return categoryMatches && isProductAvailableForBuyer(product, route.buyerType);
  });
  const schemas: Array<Record<string, unknown>> = [
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      ...(route.canonicalPath === '/' ? [] : [{ name: route.title.split(' | ')[0], path: route.canonicalPath }]),
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: visibleProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url: `https://www.chickmagnet.xyz${getProductPath(product)}`,
      })),
    },
  ];
  if (route.canonicalPath === '/') schemas.unshift(organizationSchema());

  return data({
    ...route,
    category,
    products,
    searchQuery,
    schemas,
    robots: previewAwareRobots(url.searchParams.size > 0),
  }, { headers: publicCatalogueCacheHeaders });
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData) return [];
  return buildMeta({
    title: loaderData.title,
    description: loaderData.description,
    canonicalPath: loaderData.canonicalPath,
    robots: loaderData.robots,
    schemas: loaderData.schemas,
  });
};

export default function StorefrontRoute({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>>['data'] }) {
  return (
    <App
      key={`${loaderData.buyerType}:${loaderData.category}:${loaderData.searchQuery}`}
      initialProducts={loaderData.products}
      initialPage="shop"
      initialBuyerType={loaderData.buyerType}
      initialCategory={loaderData.category}
      initialSearchQuery={loaderData.searchQuery}
    />
  );
}
