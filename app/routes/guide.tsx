import { data, type LoaderFunctionArgs, type MetaFunction, useLoaderData } from 'react-router';
import { GUIDE_DEFINITIONS } from '../content/guides';
import PublicPageChrome from '../components/PublicPageChrome';
import { loadPublicCatalogue, publicCatalogueCacheHeaders } from '../lib/catalog.server';
import { breadcrumbSchema, buildMeta, previewAwareRobots } from '../lib/seo';

export async function loader({ params }: LoaderFunctionArgs) {
  const slug = params.slug?.toLowerCase();
  if (!slug) throw new Response('Guide not found', { status: 404 });

  if (slug === 'chicken-prices-by-age') {
    const products = await loadPublicCatalogue();
    const dayOld = products.find(product => product.slug === 'improved-kienyeji-day-old-chicks');
    const oneToTwoWeeks = products.find(product => product.slug === 'improved-kienyeji-chicks-1-to-2-weeks');
    const threeToEighteenWeeks = products.find(product => product.slug === 'improved-kienyeji-chickens-3-to-18-weeks');
    const prices = [
      ...(dayOld ? [{ label: 'Day-old', price: dayOld.price }] : []),
      ...(oneToTwoWeeks?.variantsConfig?.ageOptions ?? []).map(option => ({ label: option.label, price: option.price })),
      ...(threeToEighteenWeeks?.variantsConfig?.ageOptions ?? []).map(option => ({ label: option.label, price: option.price })),
    ];

    return data({
      guide: {
        slug,
        title: 'Improved Kienyeji chicken prices by age',
        description: 'Current ChickMagnet prices for Improved Kienyeji chicks and growers from day-old to 18 weeks.',
        eyebrow: 'Current price guide',
        indexable: true,
        reviewNote: undefined,
        sections: [],
      },
      prices,
    }, { headers: publicCatalogueCacheHeaders });
  }

  const guide = GUIDE_DEFINITIONS[slug];
  if (!guide) throw new Response('Guide not found', { status: 404 });
  return { guide, prices: [] as Array<{ label: string; price: number }> };
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData) return [];
  const guide = loaderData.guide;
  return buildMeta({
    title: `${guide.title} | ChickMagnet`,
    description: guide.description,
    canonicalPath: `/guides/${guide.slug}`,
    type: 'article',
    robots: guide.indexable ? previewAwareRobots() : 'noindex, follow',
    schemas: [breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: guide.title, path: `/guides/${guide.slug}` },
    ])],
  });
};

export default function GuideRoute() {
  const { guide, prices } = useLoaderData<typeof loader>();

  return (
    <PublicPageChrome>
      <main className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <article>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">{guide.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-emerald-950 sm:text-6xl">
            {guide.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{guide.description}</p>

          {guide.reviewNote ? (
            <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              {guide.reviewNote}
            </p>
          ) : null}

          {prices.length > 0 ? (
            <section className="mt-10" aria-labelledby="price-table-title">
              <h2 id="price-table-title" className="text-2xl font-black tracking-[-0.03em]">Current prices</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Prices are per chicken. Commercial orders have a minimum of 10 chickens of one breed and one age. Delivery is quoted separately.
              </p>
              <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-emerald-950 text-white">
                    <tr><th className="px-5 py-4 text-sm">Age</th><th className="px-5 py-4 text-right text-sm">Price per chicken</th></tr>
                  </thead>
                  <tbody>
                    {prices.map((price, index) => (
                      <tr key={price.label} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <th scope="row" className="px-5 py-3.5 text-sm font-bold">{price.label}</th>
                        <td className="px-5 py-3.5 text-right text-sm font-black">Ksh {price.price.toLocaleString('en-KE')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <div className="mt-12 space-y-10">
            {guide.sections.map(section => (
              <section key={section.heading}>
                <h2 className="text-2xl font-black tracking-[-0.03em] text-emerald-950">{section.heading}</h2>
                <p className="mt-3 text-base leading-7 text-slate-700">{section.body}</p>
                {section.bullets?.length ? (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-slate-700">
                    {section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <a href="/shop" className="mt-12 inline-flex rounded-full bg-amber-400 px-5 py-3 text-sm font-black text-emerald-950">
            Explore products
          </a>
        </article>
      </main>
    </PublicPageChrome>
  );
}
