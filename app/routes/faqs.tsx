import type { MetaFunction } from 'react-router';
import FAQSection from '../../src/components/FAQSection';
import PublicPageChrome from '../components/PublicPageChrome';
import { breadcrumbSchema, buildMeta, previewAwareRobots } from '../lib/seo';

export const meta: MetaFunction = () => buildMeta({
  title: 'Chicken Orders, Delivery and Payment FAQs | ChickMagnet',
  description: 'Answers about ChickMagnet breeds, chicks, wholesale minimums, delivery, M-Pesa confirmation and the quality guarantee.',
  canonicalPath: '/faqs',
  robots: previewAwareRobots(),
  schemas: [breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Frequently asked questions', path: '/faqs' },
  ])],
});

export default function FaqRoute() {
  return (
    <PublicPageChrome>
      <main className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-10 max-w-3xl sm:mb-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">Before you order</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.045em] text-emerald-950 sm:text-6xl">
            Chicken ordering questions, answered.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Start here if you are choosing a breed, preparing for chicks, ordering in bulk or arranging delivery.
          </p>
        </header>
        <FAQSection
          title="Questions buyers ask before ordering"
          description="Clear answers about products, farm care, minimum orders, delivery, payment and what happens after you order."
          forceLight
        />
      </main>
    </PublicPageChrome>
  );
}
