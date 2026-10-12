import type { Product } from '../../src/types';
import { getProductPath } from '../../src/utils/productSeo';

export type ProductRouteResolution =
  | { type: 'product'; product: Product }
  | { type: 'redirect'; location: string };

export function resolveProductBySlug(products: Product[], slug: string): ProductRouteResolution {
  const previousSlugMatch = products.find(product => product.previousSlugs?.includes(slug));
  if (previousSlugMatch) {
    return { type: 'redirect', location: getProductPath(previousSlugMatch) };
  }

  const product = products.find(candidate => candidate.slug === slug);
  if (!product) throw new Response('Product not found', { status: 404 });
  if (product.catalogStatus === 'archived' || product.showOnStorefront === false) {
    throw new Response('Product removed', { status: 410 });
  }

  return { type: 'product', product };
}
