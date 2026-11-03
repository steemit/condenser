// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { proxy } from '../proxy';
import { classifyProxyResult, testCases } from '../scripts/test-proxy-routes';

/**
 * CSP nonce plumbing through the route proxy (audit N-02 follow-up).
 *
 * Next.js's render pipeline reads the nonce from the request's
 * Content-Security-Policy header (proxy.ts sets it via
 * NextResponse.next/rewrite({ request: { headers } })), which surfaces
 * internally as `x-middleware-request-*` response headers — asserted here to
 * pin that plumbing. The response-side header is what browsers enforce.
 */
function request(pathname: string): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${pathname}`));
}

function nonceFrom(csp: string): string | null {
  return csp.match(/'nonce-([^']+)'/)?.[1] ?? null;
}

describe('proxy CSP plumbing', () => {
  it('sets a nonce-based Content-Security-Policy on pass-through responses', () => {
    const response = proxy(request('/trending'));
    const csp = response.headers.get('Content-Security-Policy');
    expect(csp).toBeTruthy();
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toContain("frame-ancestors 'self'");
  });

  it('exposes the nonce to the render pipeline via request headers', () => {
    const response = proxy(request('/trending'));
    const csp = response.headers.get('Content-Security-Policy') ?? '';
    const nonce = nonceFrom(csp);
    expect(nonce).toBeTruthy();
    // The request-header override that NextResponse.next({ request })
    // installs — this is what app/layout.tsx reads back via headers().
    expect(response.headers.get('x-middleware-request-x-nonce')).toBe(nonce);
    expect(response.headers.get('x-middleware-request-content-security-policy')).toBe(
      csp
    );
  });

  it('also stamps rewritten routes (the response of a rewrite carries the CSP)', () => {
    const response = proxy(request('/@alice'));
    expect(response.headers.get('x-middleware-rewrite')).toContain(
      '/user/alice'
    );
    const csp = response.headers.get('Content-Security-Policy') ?? '';
    expect(nonceFrom(csp)).toBeTruthy();
    expect(response.headers.get('x-middleware-request-x-nonce')).toBe(
      nonceFrom(csp)
    );
  });

  it('generates a fresh nonce per request (no reuse across documents)', () => {
    const first = proxy(request('/trending')).headers.get(
      'Content-Security-Policy'
    );
    const second = proxy(request('/trending')).headers.get(
      'Content-Security-Policy'
    );
    expect(nonceFrom(first ?? '')).not.toBe(nonceFrom(second ?? ''));
  });

  it('overwrites a client-forged nonce instead of trusting it', () => {
    const forged = new NextRequest(new URL('http://localhost:3000/trending'), {
      headers: { 'x-nonce': 'FORGED', 'Content-Security-Policy': "script-src 'unsafe-inline'" },
    });
    const response = proxy(forged);
    const csp = response.headers.get('Content-Security-Policy') ?? '';
    expect(csp).not.toContain('FORGED');
    // The forged policy is fully replaced: no inline scripts sneak through
    // (style-src-attr 'unsafe-inline' is part of the generated policy).
    const scriptSrc = csp.match(/script-src ([^;]+);/)?.[1] ?? '';
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(response.headers.get('x-middleware-request-x-nonce')).toBe(
      nonceFrom(csp)
    );
  });

  it('redirects legacy .html aliases with the full security header set (308)', () => {
    const response = proxy(request('/login.html'));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login');
    // next.config headers() does not reach proxy-issued redirects — the
    // baseline set must ride along explicitly (audit N-02 follow-up).
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin'
    );
    expect(response.headers.get('Strict-Transport-Security')).toContain(
      'max-age=31536000'
    );
    expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe(
      'same-origin'
    );
    expect(nonceFrom(response.headers.get('Content-Security-Policy') ?? '')).toBeTruthy();
  });

  it('issues the trailing-slash 308 itself, preserving the query string', () => {
    const response = proxy(request('/trending/?foo=bar'));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/trending?foo=bar'
    );
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(
      nonceFrom(response.headers.get('Content-Security-Policy') ?? '')
    ).toBeTruthy();
  });

  it('does not redirect the root path or paths without a trailing slash', () => {
    expect(proxy(request('/')).headers.get('location')).toBeNull();
    expect(proxy(request('/trending')).headers.get('location')).toBeNull();
  });

  it('never emits a cross-origin Location from the trailing-slash 308 (open redirect)', () => {
    // WHATWG URL parses `//evil.example/x/` as protocol-relative, and treats
    // a backslash as a path separator under http(s), so feeding a
    // request-controlled pathname into new URL(pathname, base) would emit a
    // Location pointing at the attacker's origin. redirectUrl() must reject
    // anything that escapes the request origin → 404 rewrite instead.
    const sameOrigin = 'http://localhost:3000';
    for (const hostile of [
      '//evil.example/x/',
      '/\\evil.example/x/',
      '\\\\evil.example/x/',
      '//evil.example:8080/x/',
    ]) {
      const response = proxy(request(hostile));
      const location = response.headers.get('location');
      if (location !== null) {
        // Any redirect that does fire must stay on the request's origin.
        expect(new URL(location).origin).toBe(sameOrigin);
      } else {
        // Unroutable form: rewritten to the 404 page.
        expect(response.headers.get('x-middleware-rewrite')).toBe(
          `${sameOrigin}/404`
        );
      }
    }
  });
});

/**
 * No Cache-Control from the proxy (audit CD-06).
 *
 * The proxy must never stamp a variant-aware Cache-Control: it runs before
 * the page renders, so it cannot see render-time statuses (404s from
 * notFound(), the RSC 307), and Next 16's middleware adapter strips the
 * flight markers before proxy() runs, so RSC-family requests cannot be
 * identified here either. Every response keeps Next's dynamic-page default
 * (`private, no-cache, no-store, max-age=0, must-revalidate`), which the
 * openresty edge ignores (`proxy_ignore_headers Cache-Control`, openresty
 * #23) — edge storage eligibility is decided entirely edge-side.
 */
describe('proxy never stamps Cache-Control (CD-06)', () => {
  // Next's RequestInit (signal non-null etc.) — not the DOM lib's.
  type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];
  const req = (pathname: string, init?: NextRequestInit) =>
    new NextRequest(new URL(`http://localhost:3000${pathname}`), init);

  it('leaves both post-page shapes on Next default (no proxy header)', () => {
    expect(proxy(req('/@alice/my-post')).headers.get('Cache-Control')).toBeNull();
    expect(
      proxy(req('/hive-123/@alice/my-post')).headers.get('Cache-Control')
    ).toBeNull();
  });

  it('leaves cookie-carrying post-page GETs untouched too', () => {
    expect(
      proxy(req('/@alice/my-post', { headers: { cookie: 'sid=abc' } })).headers.get(
        'Cache-Control'
      )
    ).toBeNull();
    expect(
      proxy(
        req('/hive-123/@alice/my-post', { headers: { cookie: 'NEXT_LOCALE=zh' } })
      ).headers.get('Cache-Control')
    ).toBeNull();
    // Empty Cookie header counts as anonymous edge-side; still no header.
    expect(
      proxy(req('/@alice/my-post', { headers: { cookie: '' } })).headers.get(
        'Cache-Control'
      )
    ).toBeNull();
  });

  it('leaves RSC-family request shapes untouched (whatever status the render later answers)', () => {
    // Flight fetch without the cache-buster: the shape Next's render-time
    // hash validation turns into a 307 — the proxy must not pre-stamp a
    // cacheable header on the rewrite response it hands back.
    expect(
      proxy(req('/@alice/my-post', { headers: { RSC: '1' } })).headers.get(
        'Cache-Control'
      )
    ).toBeNull();
    // Normal flight fetch (cache-buster query present) and the query-only
    // shape, plus the other flight markers.
    expect(
      proxy(
        req('/@alice/my-post?_rsc=x', { headers: { RSC: '1' } })
      ).headers.get('Cache-Control')
    ).toBeNull();
    expect(
      proxy(req('/@alice/my-post?_rsc=x')).headers.get('Cache-Control')
    ).toBeNull();
    for (const header of [
      'next-router-state-tree',
      'next-router-prefetch',
      'next-router-segment-prefetch',
      'next-hmr-refresh',
    ]) {
      expect(
        proxy(req('/@alice/my-post', { headers: { [header]: '1' } })).headers.get(
          'Cache-Control'
        )
      ).toBeNull();
    }
  });

  it('leaves every other page shape untouched (no gate replication at all)', () => {
    // Profile sections, feeds, sort pages, the root.
    expect(proxy(req('/@alice/blog')).headers.get('Cache-Control')).toBeNull();
    expect(proxy(req('/@alice/comments')).headers.get('Cache-Control')).toBeNull();
    expect(proxy(req('/trending')).headers.get('Cache-Control')).toBeNull();
    expect(proxy(req('/trending/hive-123')).headers.get('Cache-Control')).toBeNull();
    expect(proxy(req('/@alice')).headers.get('Cache-Control')).toBeNull();
    expect(proxy(req('/')).headers.get('Cache-Control')).toBeNull();
  });

  it('leaves proxy-issued redirects and /404 rewrites untouched', () => {
    const redirect = proxy(req('/@alice/my-post/')); // trailing slash → 308
    expect(redirect.status).toBe(308);
    expect(redirect.headers.get('Cache-Control')).toBeNull();
    // GDPR guard: a /404 rewrite — asserted so the no-header result is
    // provably about the absence of any stamp, not a different route.
    const gdpr = proxy(req('/@xondra/some-post'));
    expect(gdpr.headers.get('Cache-Control')).toBeNull();
    expect(gdpr.headers.get('x-middleware-rewrite')).toContain('/404');
  });

  it('leaves non-GET methods untouched', () => {
    expect(
      proxy(req('/@alice/my-post', { method: 'POST' })).headers.get('Cache-Control')
    ).toBeNull();
    expect(
      proxy(req('/@alice/my-post', { method: 'HEAD' })).headers.get('Cache-Control')
    ).toBeNull();
  });
});

/**
 * Full route-resolution matrix, previously exercised only by the standalone
 * `pnpm test:proxy` script (scripts/test-proxy-routes.ts) and therefore not
 * part of `pnpm test`. The case table AND the outcome classifier are imported
 * straight from the script — one source of truth, two runners — so every
 * legacy-URL rewrite (user profiles, posts with/without category, %40
 * decoding, GDPR accounts, reserved words, internal-target guards, .html
 * aliases, trailing-slash normalization, open-redirect hostile forms) is now
 * CI-enforced with the exact classification the script reports.
 */
describe('proxy route resolution matrix (scripts/test-proxy-routes.ts table)', () => {
  it.each(testCases)('$path → $expected ($description)', ({ path, expected }) => {
    expect(classifyProxyResult(proxy(request(path)))).toBe(expected);
  });
});
