import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useDynamicFAQs } from '../utils/cms';

interface FAQSectionProps {
  id?: string;
  title?: string;
  description?: string;
  forceLight?: boolean;
}

export default function FAQSection({
  id = 'faqs',
  title = 'Frequently asked questions',
  description = 'Clear answers about breeds, vaccinations, wholesale orders, delivery and payment.',
  forceLight = false,
}: FAQSectionProps) {
  const { faqs } = useDynamicFAQs();
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-48 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_14px_40px_rgba(18,53,36,0.06)] sm:p-8 lg:p-10 ${forceLight ? '' : 'dark:border-white/10 dark:bg-white/[0.05]'}`}
    >
      <div className="mb-6 max-w-2xl">
        <div className={`flex items-center gap-2 text-amber-700 ${forceLight ? '' : 'dark:text-amber-300'}`}>
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-black uppercase tracking-[0.16em]">Customer guide</span>
        </div>
        <h2 id={`${id}-title`} className={`mt-2 font-serif text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl ${forceLight ? '' : 'dark:text-white'}`}>
          {title}
        </h2>
        <p className={`mt-2 text-sm leading-6 text-slate-600 ${forceLight ? '' : 'dark:text-emerald-100/70'}`}>{description}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
        {faqs.map((faq) => (
          <div key={faq.id} className={`overflow-hidden rounded-2xl border border-slate-200 ${forceLight ? '' : 'dark:border-white/10'}`}>
            <button
              type="button"
              aria-expanded={openFaq === faq.id}
              onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
              className={`flex min-h-20 w-full cursor-pointer items-center justify-between gap-4 bg-slate-50 p-4 text-left text-sm font-bold text-emerald-950 transition-colors hover:bg-slate-100 ${forceLight ? '' : 'dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10'}`}
            >
              <span>
                {faq.category ? (
                  <span className={`mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 ${forceLight ? '' : 'dark:text-amber-300'}`}>{faq.category}</span>
                ) : null}
                {faq.q}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {openFaq === faq.id ? (
              <p className={`border-t border-slate-200 p-4 text-sm leading-6 text-slate-600 ${forceLight ? '' : 'dark:border-white/10 dark:text-emerald-100/70'}`}>
                {faq.a}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
