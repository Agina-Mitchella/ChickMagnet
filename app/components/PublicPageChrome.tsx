import type { ReactNode } from 'react';

const brandLogo = '/images/chickmagnet-logo.webp';

export default function PublicPageChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-emerald-950">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            aria-label="ChickMagnet home"
            className="flex h-12 items-center rounded-2xl bg-emerald-950 px-3 shadow-sm"
          >
              <img src={brandLogo} alt="ChickMagnet" width="240" height="108" className="h-10 w-auto max-w-[150px] object-contain" />
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-1 text-sm font-bold sm:gap-2">
            <a className="rounded-full px-3 py-2 hover:bg-stone-100 sm:px-4" href="/shop">Shop</a>
            <a className="hidden rounded-full px-4 py-2 hover:bg-stone-100 sm:inline-flex" href="/wholesale">Wholesale</a>
            <a className="rounded-full px-3 py-2 hover:bg-stone-100 sm:px-4" href="/about">About</a>
            <a className="hidden rounded-full px-4 py-2 hover:bg-stone-100 md:inline-flex" href="/faqs">FAQs</a>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-emerald-900 bg-[#071c13] text-emerald-100">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          <section className="sm:col-span-2">
            <img src={brandLogo} alt="ChickMagnet" width="240" height="108" className="h-12 w-auto max-w-[210px] object-contain" />
            <p className="mt-5 max-w-lg text-sm leading-6 text-emerald-100/70">
              Chicken, eggs and poultry products sold directly by ChickMagnet for retail and commercial wholesale orders.
            </p>
            <p className="mt-4 text-sm leading-6 text-emerald-100/70">
              Kisii-Tanzania Highway, next to Fairmont International School, Suneka, Kisii County. Look for the black gate.
            </p>
          </section>
          <nav aria-label="Shop links">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-amber-300">Shop</h2>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-emerald-100/75">
              <a href="/shop">All products</a>
              <a href="/shop/live-chicken">Live chicken</a>
              <a href="/shop/fresh-chicken">Fresh chicken</a>
              <a href="/shop/eggs">Eggs</a>
            </div>
          </nav>
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-amber-300">Contact</h2>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-emerald-100/75">
              <a href="tel:+254700356023">+254 700 356 023</a>
              <a className="break-all" href="mailto:logansteve@gmail.com">logansteve@gmail.com</a>
              <a href="/faqs">Frequently asked questions</a>
              <a href="/guides/chicken-prices-by-age">Chicken prices by age</a>
            </div>
          </section>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-emerald-100/55">
          © {new Date().getFullYear()} ChickMagnet. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
