import assert from 'node:assert/strict';

const baseUrl = process.env.SEO_BASE_URL || 'http://127.0.0.1:3000';

async function request(path, options = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    redirect: 'manual',
    ...options,
  });
  const body = options.method === 'HEAD' ? '' : await response.text();
  return { response, body };
}

function expectHtmlPage({ response, body }, { status = 200, title, canonical, text }) {
  assert.equal(response.status, status, `Expected HTTP ${status}, received ${response.status}`);
  assert.match(response.headers.get('content-type') || '', /^text\/html\b/i);
  assert.match(body, /<html[^>]+lang="en-KE"/i);
  assert.match(body, /<meta[^>]+name="description"/i);
  assert.match(body, /<meta[^>]+property="og:title"/i);
  assert.match(body, /<meta[^>]+name="twitter:card"/i);
  assert.match(body, /<meta[^>]+name="twitter:image:alt"/i);
  assert.match(body, /<h1\b/i, 'Each indexable HTML page must have a primary heading.');
  assert.match(body, new RegExp(`<title>${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`, 'i'));
  assert.match(body, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i'));
  assert.ok(body.includes(text), `Expected server-rendered text: ${text}`);
  assert.doesNotMatch(body, /<meta[^>]+name="keywords"/i, 'Keyword meta tags should not be emitted.');
}

const home = await request('/');
expectHtmlPage(home, {
  title: 'ChickMagnet | Chicken and Eggs in Kenya',
  canonical: 'https://www.chickmagnet.xyz/',
  text: 'Quality and Affordable Poultry Products For Wholesale and Retail',
});
assert.match(home.body, /href="\/products\/[^"]+"/i, 'Home page must expose crawlable product links.');
assert.match(home.body, /href="\/guides\/chicken-prices-by-age"/i, 'Home page must link to the indexed price guide.');
assert.match(home.body, /"@type":\["Organization","LocalBusiness"\]/, 'Home page must include organization data.');
assert.match(home.body, /"email":"logansteve@gmail\.com"/, 'Organization data must expose a valid email address.');
assert.doesNotMatch(home.body, /"email":"mailto:/, 'Schema email values must not use a mailto URI.');
assert.match(home.body, /<meta[^>]+name="theme-color"[^>]+content="#fffdf9"/i);
assert.match(home.body, /<meta[^>]+name="color-scheme"[^>]+content="light dark"/i);

const about = await request('/about');
expectHtmlPage(about, {
  title: 'About ChickMagnet | Poultry Farm in Kisii',
  canonical: 'https://www.chickmagnet.xyz/about',
  text: 'Good chicken should not be hard to find.',
});

const faqs = await request('/faqs');
expectHtmlPage(faqs, {
  title: 'Chicken Orders, Delivery and Payment FAQs | ChickMagnet',
  canonical: 'https://www.chickmagnet.xyz/faqs',
  text: 'Frequently asked questions',
});
assert.ok(
  faqs.body.includes('ChickMagnet follows a veterinarian-certified vaccination schedule.'),
  'The FAQ must preserve the veterinarian-certified ChickMagnet vaccination claim.',
);
assert.ok(faqs.body.includes('fowl typhoid at week 8'));

const liveChicken = await request('/shop/live-chicken');
expectHtmlPage(liveChicken, {
  title: 'Live Chicken for Sale in Kenya | ChickMagnet',
  canonical: 'https://www.chickmagnet.xyz/shop/live-chicken',
  text: 'Mature Improved Kienyeji Chicken',
});

const filteredShop = await request('/shop?q=eggs');
assert.equal(filteredShop.response.status, 200);
assert.match(filteredShop.body, /<meta[^>]+name="robots"[^>]+content="noindex, follow"/i);
assert.match(filteredShop.body, /<link[^>]+rel="canonical"[^>]+href="https:\/\/www\.chickmagnet\.xyz\/shop"/i);
assert.ok(filteredShop.body.includes('Fresh Eggs'));

for (const [path, expectedProduct] of [
  ['/shop?q=turkey', 'Mature Turkey'],
  ['/shop?q=drumstick', 'Chicken Drumsticks'],
  ['/wholesale?q=sasso', 'Sasso Day-Old Chicks'],
  ['/wholesale?q=8+weeks', 'Improved Kienyeji Chickens (3 to 18 Weeks)'],
]) {
  const result = await request(path);
  assert.equal(result.response.status, 200);
  assert.ok(result.body.includes(expectedProduct), `${path} must show ${expectedProduct}.`);
  assert.match(result.body, /<meta[^>]+name="robots"[^>]+content="noindex, follow"/i);
}

const sitemap = await request('/sitemap.xml');
assert.equal(sitemap.response.status, 200);
assert.match(sitemap.response.headers.get('content-type') || '', /^application\/xml\b/i);
assert.match(sitemap.body, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
assert.match(sitemap.body, /<loc>https:\/\/www\.chickmagnet\.xyz\/products\/[^<]+<\/loc>/);
assert.doesNotMatch(sitemap.body, /[?&](?:q|age|category)=/);
assert.doesNotMatch(sitemap.body, /\/(?:account|admin|cart|checkout|orders)(?:<|\/)/);

const sitemapLocations = [...sitemap.body.matchAll(/<loc>(https:\/\/www\.chickmagnet\.xyz\/[^<]*)<\/loc>/g)]
  .map(match => match[1]);
assert.equal(
  sitemapLocations.length,
  new Set(sitemapLocations).size,
  'The sitemap must not contain duplicate URLs.',
);

const sitemapPages = await Promise.all(sitemapLocations.map(async location => ({
  location,
  result: await request(new URL(location).pathname),
})));
for (const { location, result } of sitemapPages) {
  assert.equal(result.response.status, 200, `${location} must return 200.`);
  assert.match(result.response.headers.get('content-type') || '', /^text\/html\b/i);
  assert.match(
    result.body,
    new RegExp(`<link[^>]+rel="canonical"[^>]+href="${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i'),
    `${location} must use a self-referencing canonical URL.`,
  );
  assert.doesNotMatch(
    result.body,
    /<meta[^>]+name="robots"[^>]+content="noindex/i,
    `${location} must be indexable because it appears in the sitemap.`,
  );
}

const productLocation = sitemapLocations.find(location => new URL(location).pathname.startsWith('/products/'));
assert.ok(productLocation, 'Sitemap must contain at least one product URL.');
const productPath = new URL(productLocation).pathname;
const product = await request(productPath);
assert.equal(product.response.status, 200);
assert.match(product.body, /<h1[^>]*>[^<]+<\/h1>/i);
assert.match(product.body, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${productLocation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i'));
assert.match(product.body, /"@type":"Product"/);
assert.match(product.body, /"priceCurrency":"KES"/);
assert.doesNotMatch(product.body, /"aggregateRating"/);
assert.doesNotMatch(product.body, /"availability"/);

const chickProduct = await request('/products/sasso-day-old-chicks');
assert.equal(chickProduct.response.status, 200);
assert.ok(chickProduct.body.includes('Veterinarian-certified vaccination schedule'));
assert.ok(chickProduct.body.includes('Days 18 to 21: Gumboro booster.'));
assert.ok(chickProduct.body.includes('Every hatchery vaccination due on Day 1 is completed and recorded.'));

const productAge = await request(`${productPath}?age=8-weeks`);
assert.equal(productAge.response.status, 200);
assert.match(productAge.body, /<meta[^>]+name="robots"[^>]+content="noindex, follow"/i);
assert.match(productAge.body, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${productLocation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i'));

const previousProductUrl = await request('/products/live-improved-kienyeji-chicken');
assert.equal(previousProductUrl.response.status, 301);
assert.equal(previousProductUrl.response.headers.get('location'), '/products/mature-improved-kienyeji-chicken');

const trailingSlash = await request('/about/');
assert.equal(trailingSlash.response.status, 308);
assert.equal(trailingSlash.response.headers.get('location'), '/about');
assert.match(trailingSlash.response.headers.get('content-security-policy') || '', /default-src 'self'/);

const robots = await request('/robots.txt');
assert.equal(robots.response.status, 200);
assert.match(robots.response.headers.get('content-type') || '', /^text\/plain\b/i);
assert.match(robots.body, /Sitemap: https:\/\/www\.chickmagnet\.xyz\/sitemap\.xml/);
assert.match(robots.body, /Disallow: \/checkout/);

for (const path of ['/missing-page-for-seo-test', '/api/test']) {
  const missing = await request(path);
  assert.equal(missing.response.status, 404, `${path} must return a real 404.`);
  assert.equal(missing.response.headers.get('x-robots-tag'), 'noindex, nofollow');
}

const csp = home.response.headers.get('content-security-policy') || '';
assert.match(csp, /script-src 'self' 'nonce-[^']+'/);
assert.match(csp, /https:\/\/apis\.google\.com/);
assert.equal(home.response.headers.get('x-content-type-options'), 'nosniff');
assert.equal(home.response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');

console.log(`SEO route verification passed against ${baseUrl}`);
