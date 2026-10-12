import type { LoaderFunctionArgs } from 'react-router';

const ROBOTS = `User-agent: *
Allow: /
Disallow: /account
Disallow: /admin
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /api/

Sitemap: https://www.chickmagnet.xyz/sitemap.xml
`;

export function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  return new Response(request.method === 'HEAD' ? null : ROBOTS, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
