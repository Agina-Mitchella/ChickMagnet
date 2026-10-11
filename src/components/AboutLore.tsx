import { useEffect } from 'react';
import {
  ArrowRight,
  HeartHandshake,
  Mail,
  MapPin,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import FAQSection from './FAQSection';

const VALUES = [
  {
    title: 'Customers come first',
    description: 'We stay available, give clear updates and deal with problems directly.',
    icon: HeartHandshake,
  },
  {
    title: 'We want to build big',
    description: 'Our ambition is to become one of Kenya’s most trusted chicken providers.',
    icon: Target,
  },
  {
    title: 'We improve the farm daily',
    description: 'Every flock and every order should teach us how to do the work better.',
    icon: TrendingUp,
  },
];

export default function AboutLore() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'About ChickMagnet';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="bg-white text-[#15251d]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <section id="about" className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-amber-700">Our story</p>
            <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-emerald-950 sm:text-6xl lg:text-7xl">
              Good chicken should not be hard to find.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              ChickMagnet started in Kisii in 2022 because too many buyers were paying good money and still guessing what would arrive.
            </p>

            <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-5 border-t border-stone-200 pt-6">
              <Fact label="Year founded" value="2022" />
              <Fact label="Where we started" value="Kisii" />
              <Fact label="Farm capacity" value="1,000 to 5,000 birds" />
            </dl>
          </div>

          <picture>
            <source media="(max-width: 640px)" srcSet="/images/hero-commercial-farm-mobile.jpg" />
            <img
              src="/images/hero-commercial-farm-desktop.jpg"
              alt="A bright commercial poultry house with feeding and watering lines"
              className="h-[430px] w-full rounded-[2rem] object-cover shadow-[0_24px_70px_rgba(18,53,36,0.12)] sm:h-[520px] lg:h-[650px]"
            />
          </picture>
        </section>

        <section className="grid gap-10 border-t border-stone-200 py-16 sm:py-20 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:py-24">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf5ef] text-emerald-900">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.15em] text-amber-700">A note from our founder</p>
            <h2 className="mt-3 text-4xl font-black leading-none tracking-[-0.045em] sm:text-5xl">Why we started.</h2>
          </div>

          <div className="max-w-3xl text-xl leading-9 tracking-[-0.02em] text-slate-800 sm:text-2xl sm:leading-10">
            <p>
              Hi, I’m Steve. Before ChickMagnet, I kept seeing the same problem: a farmer could put good money into an order and still be left wondering about the age, health or quality of the birds that would arrive. A family buying chicken for dinner often knew just as little about where it came from.
            </p>
            <p className="mt-6">
              We started with one farm in the Kisii highlands in 2022 because we wanted to make that experience more dependable. Our farm team cares for the flock, our operators prepare each order, and when you call, you reach people who know the work behind what you are buying.
            </p>
            <p className="mt-6">
              We know an order of chicks can be the beginning of someone’s next flock and a source of income for their family. We know the chicken on a customer’s table has to be worth the money they worked for. That is why quality and service are not slogans to us. They are the reason ChickMagnet exists.
            </p>
            <p className="mt-9 text-base font-black text-emerald-950">
              Steve Logan
              <span className="mt-1 block text-sm font-semibold text-slate-500">Founder, ChickMagnet</span>
            </p>
          </div>
        </section>

        <section aria-labelledby="values-title" className="border-t border-stone-200 py-16 sm:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-amber-700">What matters here</p>
          <h2 id="values-title" className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">How we work.</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
            {VALUES.map(({ title, description, icon: Icon }) => (
              <article key={title}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf5ef] text-emerald-900">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-black tracking-[-0.025em]">{title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-t border-stone-200 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf5ef] text-emerald-900">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-4xl font-black leading-none tracking-[-0.045em] sm:text-5xl">There are people behind every order.</h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-slate-600">
            <p>
              ChickMagnet is run by operators, farm managers and farm workers who care for the birds and prepare each order. Farmers and businesses come to us for chicks and mature chicken. Households come to us for fresh chicken, cuts, eggs and turkey. Whatever the order, the responsibility stays with our team from the farm to handover.
            </p>
            <div className="flex items-start gap-4 border-t border-stone-200 pt-6">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
              <p>Farm visits are welcome when arranged in advance, so the team can prepare and protect the flock.</p>
            </div>
          </div>
        </section>

        <section id="quality-guarantees" className="scroll-mt-48 py-6 sm:py-10">
          <div className="flex flex-col gap-6 rounded-[2rem] border border-amber-300 bg-amber-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div className="flex items-start gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-950 text-amber-300">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">7-day money-back guarantee</h2>
                <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">
                  We guarantee a full refund if any chicks or products are delivered sick, weak or damaged.
                </p>
              </div>
            </div>
            <a
              href="mailto:logansteve@gmail.com"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-950 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Report a problem
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="py-16 text-center sm:py-24">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-amber-700">Here when you need us</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-5xl">Talk to the ChickMagnet team.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            You can reach us 24/7 for availability, payment or delivery questions.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="mailto:logansteve@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-black text-emerald-950 transition-colors hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email the team
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3.5 text-sm font-black text-white transition-colors hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Explore products
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <div className="pb-12 sm:pb-16">
          <FAQSection forceLight />
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-base font-black text-emerald-950">{value}</dd>
    </div>
  );
}
