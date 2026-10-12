import type { MetaFunction } from 'react-router';
import PublicPageChrome from '../components/PublicPageChrome';
import { buildMeta } from '../lib/seo';

export function loader() {
  throw new Response('Page not found', { status: 404 });
}

export const meta: MetaFunction = () => buildMeta({
  title: 'Page Not Found | ChickMagnet',
  description: 'The requested ChickMagnet page could not be found.',
  canonicalPath: '/404',
  robots: 'noindex, nofollow',
});

export default function NotFoundRoute() {
  return (
    <PublicPageChrome>
      <main className="grid min-h-[60vh] place-items-center px-5 py-16 text-center">
        <section>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">404</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Page not found</h1>
          <p className="mt-4 text-slate-600">The page may have moved, or the address may be incorrect.</p>
          <a href="/shop" className="mt-7 inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-black text-white">Return to products</a>
        </section>
      </main>
    </PublicPageChrome>
  );
}
