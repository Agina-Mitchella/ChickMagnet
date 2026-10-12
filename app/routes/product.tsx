import { data, redirect, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import App from '../../src/App.tsx';
import type { BuyerType } from '../../src/types';
import { getProductPath } from '../../src/utils/productSeo';
import { loadPublicCatalogue, publicCatalogueCacheHeaders } from '../lib/catalog.server';
import { resolveProductBySlug } from '../lib/product-route.server';
import { breadcrumbSchema, buildMeta, previewAwareRobots, productSchema } from '../lib/seo';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const slug = params.slug?.toLowerCase();
  if (!slug) throw new Response('Product not found', { status: 404 });

  const products = await loadPublicCatalogue({ includeArchived: true });
  const resolution = resolveProductBySlug(products, slug);
  if (resolution.type === 'redirect') throw redirect(resolution.location, 301);
  const product = resolution.product;

  const url = new URL(request.url);
  const requestedAge = url.searchParams.get('age');
  const ageWeeks = requestedAge?.match(/^(\d+)-weeks?$/)?.[1];
  const initialAgeWeeks = ageWeeks ? Number(ageWeeks) : undefined;
  const canonicalPath = getProductPath(product);
  const buyerType: BuyerType = product.salesChannels?.includes('retail') ? 'retail' : 'wholesale';

  return data({
    product,
    products: products.filter(candidate => candidate.catalogStatus !== 'archived' && candidate.showOnStorefront !== false),
    buyerType,
    initialAgeWeeks,
    canonicalPath,
    robots: product.searchVisibility === 'noindex'
      ? 'noindex, follow'
      : previewAwareRobots(url.searchParams.size > 0),
  }, { headers: publicCatalogueCacheHeaders });
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData) return [];
  const product = loaderData.product;
  return buildMeta({
    title: product.seoTitle || `${product.name} | ChickMagnet`,
    description: product.seoDescription || product.description,
    canonicalPath: loaderData.canonicalPath,
    image: product.seoImage || product.image,
    robots: loaderData.robots,
    type: 'product',
    schemas: [
      productSchema(product),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: product.name, path: loaderData.canonicalPath },
      ]),
    ],
  });
};

export default function ProductRoute({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>>['data'] }) {
  return (
    <App
      initialProducts={loaderData.products}
      initialPage="product"
      initialProduct={loaderData.product}
      initialBuyerType={loaderData.buyerType}
      initialAgeWeeks={loaderData.initialAgeWeeks}
    />
  );
}
