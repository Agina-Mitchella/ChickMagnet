import { useState } from 'react';
import { ChevronDown, HelpCircle, ShoppingBag } from 'lucide-react';

const faqs = [
  {
    question: 'What does ChickMagnet sell?',
    answer: 'ChickMagnet currently sells chicken and eggs for retail and commercial wholesale orders.'
  },
  {
    question: 'What is the minimum wholesale order?',
    answer: 'Wholesale chicken orders start at 10 units. Wholesale egg orders start at 5 packs or trays, depending on the product.'
  },
  {
    question: 'Can the product range change?',
    answer: 'Yes. Products are added, updated, or removed from the catalog as availability changes.'
  },
  {
    question: 'How do I place an order?',
    answer: 'Choose Retail or Commercial Wholesale, add your products to the cart, and complete checkout.'
  }
];

export default function AboutLore() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 text-emerald-950 sm:px-6 lg:px-8">
      <section id="about" className="rounded-3xl bg-[#123524] p-8 text-amber-50 sm:p-12">
        <div className="max-w-2xl space-y-4">
          <h1 className="font-serif text-3xl font-black text-amber-300 sm:text-4xl">
            About ChickMagnet
          </h1>
          <p className="text-sm leading-relaxed text-emerald-100 sm:text-base">
            ChickMagnet sells chicken and eggs directly to retail and commercial wholesale customers.
          </p>
        </div>
      </section>

      <section id="quality-guarantees" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
          <div>
            <h2 className="font-serif text-xl font-bold">Ordering from ChickMagnet</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Browse the current catalog, choose the order type that applies to you, and add the quantity you need. Product availability, pricing, and delivery charges are shown during ordering.
            </p>
          </div>
        </div>
      </section>

      <section id="faqs" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-800" />
          <h2 className="font-serif text-xl font-bold">Frequently asked questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 bg-slate-50 p-4 text-left text-sm font-bold text-emerald-950 hover:bg-slate-100"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index ? (
                <p className="border-t border-slate-200 p-4 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
