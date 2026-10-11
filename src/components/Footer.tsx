import React from 'react';
import { ArrowUp, Mail, Phone, ShieldCheck } from 'lucide-react';
import { BuyerType, MainCategory } from '../types';
import { useBrandLogo } from '../utils/cms';

interface FooterProps {
  buyerType: BuyerType;
  onNavigate?: (tab: string, sectionId?: string) => void;
  onSelectCategory: (category: MainCategory | 'all') => void;
}

const SHOP_LINKS: Array<{ label: string; category: MainCategory | 'all' }> = [
  { label: 'All Products', category: 'all' },
  { label: 'Live Chicken', category: 'live-birds' },
  { label: 'Fresh Chicken', category: 'fresh-poultry' },
  { label: 'Eggs', category: 'eggs' },
];

const HELP_LINKS = [
  { label: 'About ChickMagnet', tab: 'about', sectionId: 'about' },
  { label: 'Quality Guarantee', tab: 'about', sectionId: 'quality-guarantees' },
  { label: 'Frequently Asked Questions', tab: 'shop', sectionId: 'faqs' },
];

export default function Footer({ buyerType, onNavigate, onSelectCategory }: FooterProps) {
  const brand = useBrandLogo();
  const visibleShopLinks = SHOP_LINKS.filter(
    link => buyerType !== 'wholesale' || link.category !== 'fresh-poultry'
  );

  return (
    <footer className="w-full border-t border-emerald-900 bg-[#071c13] text-emerald-100">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <section className="flex flex-col justify-between gap-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl supports-[not_(backdrop-filter:blur(1px))]:bg-[#103525] sm:p-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-amber-300">ChickMagnet support</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-3xl">Need help with an order?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/75">
              Contact us for current product availability and help with retail or commercial wholesale orders.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="tel:254700356023"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-emerald-950 transition-colors hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Phone className="h-4 w-4" />
              254700356023
            </a>
            <a
              href="mailto:logansteve@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <Mail className="h-4 w-4 text-amber-300" />
              logansteve@gmail.com
            </a>
          </div>
        </section>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1fr]">
          <section>
            {brand.logoImageUrl ? (
              <img
                src={brand.logoImageUrl}
                alt={brand.brandName || 'ChickMagnet'}
                className="h-12 w-auto max-w-[210px] object-contain"
              />
            ) : (
              <div className="text-2xl font-black text-amber-300">{brand.brandName || 'ChickMagnet'}</div>
            )}
            <p className="mt-5 max-w-sm text-sm leading-6 text-emerald-100/70">
              Chicken, eggs and poultry products sold directly by ChickMagnet for retail and commercial wholesale orders.
            </p>
          </section>

          <FooterColumn title="Shop">
            {visibleShopLinks.map(link => (
              <button
                key={link.category}
                type="button"
                onClick={() => onSelectCategory(link.category)}
                className="text-left text-sm text-emerald-100/75 transition-colors hover:text-amber-300 focus:outline-none focus-visible:text-amber-300"
              >
                {link.label}
              </button>
            ))}
          </FooterColumn>

          <FooterColumn title="Help">
            {HELP_LINKS.map(link => (
              <a
                key={link.sectionId}
                href={link.tab === 'about' ? `/about#${link.sectionId}` : `/#${link.sectionId}`}
                onClick={(event) => {
                  if (!onNavigate) return;
                  event.preventDefault();
                  onNavigate(link.tab, link.sectionId);
                }}
                className="text-left text-sm text-emerald-100/75 transition-colors hover:text-amber-300 focus:outline-none focus-visible:text-amber-300"
              >
                {link.label}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact">
            <a href="tel:254700356023" className="text-sm text-emerald-100/75 transition-colors hover:text-amber-300">
              254700356023
            </a>
            <a href="mailto:logansteve@gmail.com" className="break-all text-sm text-emerald-100/75 transition-colors hover:text-amber-300">
              logansteve@gmail.com
            </a>
          </FooterColumn>
        </div>

        <a
          href="/about#quality-guarantees"
          onClick={(event) => {
            if (!onNavigate) return;
            event.preventDefault();
            onNavigate('about', 'quality-guarantees');
          }}
          className="flex flex-col gap-4 rounded-[1.75rem] border border-amber-300/25 bg-amber-300/[0.08] p-5 transition-colors hover:bg-amber-300/[0.12] sm:flex-row sm:items-center sm:p-6"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-300 text-emerald-950 shadow-lg shadow-black/10">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-lg font-black text-white">7-day money-back guarantee</strong>
            <span className="mt-1 block text-sm leading-6 text-emerald-100/70">
              We guarantee a full refund if any chicks or products are delivered sick, weak or damaged.
            </span>
          </span>
          <span className="text-sm font-black text-amber-300">Read the guarantee</span>
        </a>
      </div>

      <div className="border-t border-white/10 bg-black/10 px-5 py-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 text-xs text-emerald-100/55 sm:flex-row">
          <span>© {new Date().getFullYear()} {brand.brandName || 'ChickMagnet'}. All rights reserved.</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-bold text-amber-300 transition-colors hover:bg-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <ArrowUp className="h-4 w-4" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-amber-300">{title}</h3>
      <div className="mt-4 flex flex-col items-start gap-3">{children}</div>
    </section>
  );
}
