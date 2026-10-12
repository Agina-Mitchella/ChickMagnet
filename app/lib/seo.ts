import type { MetaDescriptor } from 'react-router';
import type { Product } from '../../src/types';
import { getAbsoluteUrl, getProductPath, SITE_ORIGIN } from '../../src/utils/productSeo';
import { getUnitPrice } from '../../src/utils/orderRules';

export const DEFAULT_SHARE_IMAGE = getAbsoluteUrl('/images/hero-commercial-farm-desktop.jpg');

type SeoInput = {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  robots?: string;
  type?: 'website' | 'product' | 'article';
  schemas?: Array<Record<string, unknown>>;
};

export function buildMeta({
  title,
  description,
  canonicalPath,
  image = DEFAULT_SHARE_IMAGE,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  type = 'website',
  schemas = [],
}: SeoInput): MetaDescriptor[] {
  const canonical = getAbsoluteUrl(canonicalPath);
  const shareImage = image.startsWith('http') ? image : getAbsoluteUrl(image);

  return [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: robots },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:site_name', content: 'ChickMagnet' },
    { property: 'og:locale', content: 'en_KE' },
    { property: 'og:type', content: type },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: shareImage },
    { property: 'og:image:alt', content: title },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: shareImage },
    { name: 'twitter:image:alt', content: title },
    ...schemas.map(schema => ({ 'script:ld+json': schema } as MetaDescriptor)),
  ];
}

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${SITE_ORIGIN}/#organization`,
    name: 'ChickMagnet',
    url: `${SITE_ORIGIN}/`,
    logo: getAbsoluteUrl('/chickmagnet-favicon.png'),
    image: DEFAULT_SHARE_IMAGE,
    description: 'Chicken, eggs and poultry products sold directly by ChickMagnet for retail and commercial wholesale orders.',
    email: 'logansteve@gmail.com',
    telephone: '+254700356023',
    currenciesAccepted: 'KES',
    paymentAccepted: 'M-Pesa',
    areaServed: { '@type': 'Country', name: 'Kenya' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+254700356023',
      email: 'logansteve@gmail.com',
      areaServed: 'KE',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kisii-Tanzania Highway, next to Fairmont International School',
      addressLocality: 'Suneka',
      addressRegion: 'Kisii County',
      addressCountry: 'KE',
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '15:00',
    }],
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: Product): Record<string, unknown> {
  const ageOptions = product.variantsConfig?.ageOptions ?? [];
  const prices = ageOptions.map(option => option.price).filter(Number.isFinite);
  const url = getAbsoluteUrl(getProductPath(product));
  const offer = prices.length > 1
    ? {
        '@type': 'AggregateOffer',
        priceCurrency: 'KES',
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: prices.length,
        url,
        seller: { '@id': `${SITE_ORIGIN}/#organization` },
      }
    : {
        '@type': 'Offer',
        priceCurrency: 'KES',
        price: getUnitPrice(product, product.salesChannels?.includes('retail') ? 'retail' : 'wholesale'),
        url,
        seller: { '@id': `${SITE_ORIGIN}/#organization` },
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.seoDescription || product.description,
    image: [getAbsoluteUrl(product.seoImage || product.image)],
    sku: product.id,
    brand: { '@type': 'Brand', name: 'ChickMagnet' },
    offers: offer,
  };
}

export function previewAwareRobots(hasSearchParams = false): string {
  const isPreview = typeof process !== 'undefined'
    && Boolean(process.env.VERCEL_ENV)
    && process.env.VERCEL_ENV !== 'production';

  if (isPreview || hasSearchParams) {
    return 'noindex, follow';
  }
  return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
}
