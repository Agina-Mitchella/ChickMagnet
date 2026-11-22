import { handleRequest } from '@vercel/react-router/entry.server';
import type { AppLoadContext, EntryContext } from 'react-router';

const CANONICAL_ORIGIN = 'https://www.chickmagnet.xyz';

function securityHeaders(nonce: string, enableSignupForms = false): Record<string, string> {
  const klaviyoCdn = enableSignupForms ? ' https://static.klaviyo.com/onsite/js/' : '';
  const klaviyoScripts = enableSignupForms ? ' https://static-tracking.klaviyo.com/onsite/js/' : '';
  const klaviyoConnections = enableSignupForms
    ? ' https://a.klaviyo.com https://fast.a.klaviyo.com https://static-forms.klaviyo.com https://api-js.datadome.co/js/'
    : '';
  const captchaFrames = enableSignupForms ? ' https://*.captcha-delivery.com' : '';
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      `script-src 'self' 'nonce-${nonce}' https://apis.google.com https://accounts.google.com${klaviyoCdn}${klaviyoScripts}`,
      `style-src 'self' 'unsafe-inline'${klaviyoCdn}`,
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com",
      `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com${klaviyoConnections}`,
      ...(enableSignupForms ? ["worker-src 'self' blob:"] : []),
      `frame-src 'self' https://*.firebaseapp.com https://accounts.google.com${captchaFrames}`,
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

function applyResponseHeaders(response: Response, nonce: string, enableSignupForms = false): Response {
  for (const [key, value] of Object.entries(securityHeaders(nonce, enableSignupForms))) {
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

  const enableSignupForms = requestUrl.origin === CANONICAL_ORIGIN
    && response.headers.get('Content-Type')?.startsWith('text/html');
  return applyResponseHeaders(response, nonce, enableSignupForms);
}
