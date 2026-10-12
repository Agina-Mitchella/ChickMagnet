import type { MainCategory, Product, ProductContentSection, ProductSeoFields } from '../types';

const CATEGORY_PATHS: Record<MainCategory, string> = {
  'live-birds': '/shop/live-chicken',
  'fresh-poultry': '/shop/fresh-chicken',
  eggs: '/shop/eggs',
  processed: '/shop/fresh-chicken',
  'farm-supplies': '/shop',
};

export const SITE_ORIGIN = 'https://www.chickmagnet.xyz';

export function slugifyProductName(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function defaultContentSections(product: Product): ProductContentSection[] {
  if (product.productGuide?.sections.length) {
    return product.productGuide.sections.map((section, index) => ({
      id: slugifyProductName(section.title) || `section-${index + 1}`,
      heading: section.title,
      body: section.summary || '',
      bullets: section.bullets,
    }));
  }

  const sections: ProductContentSection[] = [
    {
      id: 'about',
      heading: 'About this product',
      body: product.description,
    },
  ];

  if (product.category === 'live-birds') {
    sections.push({
      id: 'before-ordering',
      heading: 'Before you order',
      body: 'Prepare clean housing, suitable feed and fresh water before the birds arrive. Ask the ChickMagnet team for the current batch age, care record and vaccination record before confirming your order.',
    });
  } else if (product.category === 'fresh-poultry') {
    sections.push({
      id: 'storage',
      heading: 'Storage and handling',
      body: 'Keep the product chilled, follow the date shown on the pack and cook it thoroughly before serving.',
    });
  } else if (product.category === 'eggs') {
    sections.push({
      id: 'storage',
      heading: 'Storage',
      body: 'Keep the tray clean, dry and away from direct heat. Follow the date and storage guidance on the pack.',
    });
  }

  return sections;
}

export function normalizeProductSeo(product: Product): Product & ProductSeoFields {
  const slug = product.slug?.trim() || slugifyProductName(product.name) || product.id;
  const previousSlugs = Array.from(new Set(
    (product.previousSlugs ?? [])
      .map(previousSlug => slugifyProductName(previousSlug))
      .filter(previousSlug => previousSlug && previousSlug !== slug)
  ));

  return {
    ...product,
    slug,
    previousSlugs,
    seoTitle: product.seoTitle?.trim() || `${product.name} | ChickMagnet`,
    seoDescription: product.seoDescription?.trim() || product.description,
    seoImage: product.seoImage?.trim() || product.image,
    imageAlt: product.imageAlt?.trim() || product.name,
    searchVisibility: product.searchVisibility ?? 'index',
    catalogStatus: product.catalogStatus ?? (product.showOnStorefront === false ? 'archived' : 'published'),
    contentSections: product.contentSections?.length ? product.contentSections : defaultContentSections(product),
  };
}

export function getProductSlug(product: Product): string {
  return normalizeProductSeo(product).slug;
}

export function getProductPath(product: Product): string {
  return `/products/${getProductSlug(product)}`;
}

export function getCategoryPath(category: MainCategory | 'all', wholesale = false): string {
  if (wholesale) {
    if (category === 'all') return '/wholesale';
    const categoryQuery = category === 'live-birds' ? 'live-chicken' : category === 'eggs' ? 'eggs' : 'all';
    return `/wholesale?category=${categoryQuery}`;
  }

  return category === 'all' ? '/shop' : CATEGORY_PATHS[category];
}

export function getAbsoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}

export function validateProductSeo(product: Product, allProducts: Product[]): string[] {
  const normalized = normalizeProductSeo(product);
  const errors: string[] = [];

  if (!normalized.name.trim()) errors.push('Add a product name.');
  if (!normalized.description.trim()) errors.push('Add a product description.');
  if (!normalized.slug || normalized.slug !== slugifyProductName(normalized.slug)) {
    errors.push('Use a lowercase product slug containing words, numbers and hyphens only.');
  }
  if (allProducts.some(candidate => candidate.id !== product.id && getProductSlug(candidate) === normalized.slug)) {
    errors.push('That product URL is already in use.');
  }
  if (!Number.isFinite(normalized.price) || normalized.price <= 0) errors.push('Add a valid product price.');
  if (!normalized.unit?.trim()) errors.push('Add the unit customers are buying, such as bird, tray or kg.');
  if (!normalized.image?.trim()) errors.push('Add a product image.');
  if (!normalized.imageAlt?.trim()) errors.push('Add image alt text.');
  if (!normalized.minOrderQty || normalized.minOrderQty < 1) errors.push('Add a minimum order quantity.');

  return errors;
}
