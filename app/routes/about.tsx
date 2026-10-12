import type { MetaFunction } from 'react-router';
import AboutLore from '../../src/components/AboutLore';
import PublicPageChrome from '../components/PublicPageChrome';
import { breadcrumbSchema, buildMeta, organizationSchema, previewAwareRobots } from '../lib/seo';

export const meta: MetaFunction = () => buildMeta({
  title: 'About ChickMagnet | Poultry Farm in Kisii',
  description: 'ChickMagnet started in Kisii in 2022 to make it easier to buy dependable chicken, eggs and poultry products directly from the farm.',
  canonicalPath: '/about',
  robots: previewAwareRobots(),
  schemas: [
    organizationSchema(),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'About ChickMagnet', path: '/about' },
    ]),
  ],
});

export default function AboutRoute() {
  return (
    <PublicPageChrome>
      <main>
        <AboutLore />
      </main>
    </PublicPageChrome>
  );
}
