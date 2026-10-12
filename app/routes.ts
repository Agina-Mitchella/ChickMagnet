import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('./routes/storefront.tsx', { id: 'home' }),
  route('shop', './routes/storefront.tsx', { id: 'shop' }),
  route('shop/live-chicken', './routes/storefront.tsx', { id: 'shop-live-chicken' }),
  route('shop/fresh-chicken', './routes/storefront.tsx', { id: 'shop-fresh-chicken' }),
  route('shop/eggs', './routes/storefront.tsx', { id: 'shop-eggs' }),
  route('wholesale', './routes/storefront.tsx', { id: 'wholesale' }),
  route('products/:slug', './routes/product.tsx'),
  route('about', './routes/about.tsx'),
  route('faqs', './routes/faqs.tsx'),
  route('guides/:slug', './routes/guide.tsx'),
  route('robots.txt', './routes/robots.ts'),
  route('sitemap.xml', './routes/sitemap.ts'),
  route('*', './routes/not-found.tsx'),
] satisfies RouteConfig;
