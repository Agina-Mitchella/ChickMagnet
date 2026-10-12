import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';
import type { LinksFunction, MetaFunction } from 'react-router';
import stylesheet from '../src/index.css?url';

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/chickmagnet-favicon.png?v=3', type: 'image/png' },
  { rel: 'apple-touch-icon', href: '/chickmagnet-favicon.png?v=3' },
  { rel: 'manifest', href: '/site.webmanifest' },
];

export const meta: MetaFunction = () => [
  { title: 'ChickMagnet | Chicken and Eggs in Kenya' },
  {
    name: 'description',
    content: 'Buy live chicken, fresh chicken and eggs directly from ChickMagnet in Kenya.',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fffdf9" />
        <meta name="color-scheme" content="light dark" />
        <link rel="stylesheet" href={stylesheet} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const title = status === 404
    ? 'Page not found'
    : status === 410
      ? 'Product no longer available'
      : status === 503
        ? 'Store temporarily unavailable'
        : 'Something went wrong';
  const message = status === 404
    ? 'The page may have moved, or the address may be incorrect.'
    : status === 410
      ? 'This product has been removed from the ChickMagnet catalogue.'
      : status === 503
        ? 'We could not confirm the current catalogue. Please try again shortly.'
        : 'Please return to the shop and try again.';

  return (
    <main className="grid min-h-screen place-items-center bg-[#fffdf9] px-5 text-emerald-950">
      <section className="max-w-xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">Error {status}</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{message}</p>
        <a className="mt-7 inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-black text-white" href="/shop">
          Return to products
        </a>
      </section>
    </main>
  );
}
