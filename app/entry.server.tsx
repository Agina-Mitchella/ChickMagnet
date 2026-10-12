import { handleRequest } from '@vercel/react-router/entry.server';
import type { AppLoadContext, EntryContext } from 'react-router';

const CANONICAL_ORIGIN = 'https://www.chickmagnet.xyz';

function securityHeaders(nonce: string): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      `script-src 'self' 'nonce-${nonce}' https://apis.google.com https://accounts.google.com`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com",
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
      "form-action 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

function applyResponseHeaders(response: Response, nonce: string): Response {
  for (const [key, value] of Object.entries(securityHeaders(nonce))) {
    response.headers.set(key, value);
  }

  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else if (response.status >= 400) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

function permanentRedirect(location: string, nonce: string): Response {
  return applyResponseHeaders(new Response(null, {
    status: 308,
    headers: { Location: location },
  }), nonce);
}

export default async function entryServer(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext?: AppLoadContext,
): Promise<Response> {
  const nonce = crypto.randomUUID();
  const requestUrl = new URL(request.url);
  const normalizedPath = requestUrl.pathname.length > 1 && requestUrl.pathname.endsWith('/')
    ? requestUrl.pathname.replace(/\/+$/, '')
    : requestUrl.pathname;

  if (requestUrl.hostname === 'chickmagnet.xyz') {
    const canonicalUrl = new URL(`${normalizedPath}${requestUrl.search}`, CANONICAL_ORIGIN);
    return permanentRedirect(canonicalUrl.toString(), nonce);
  }

  if (normalizedPath !== requestUrl.pathname) {
    return permanentRedirect(`${normalizedPath}${requestUrl.search}`, nonce);
  }

  const response = await handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    routerContext,
    loadContext,
    { nonce },
  );

  return applyResponseHeaders(response, nonce);
}
