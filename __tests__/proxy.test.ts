// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { FLIGHT_HEADERS } from 'next/dist/client/components/app-router-headers';

import {
  ANON_POST_PAGE_GATE_RE,
  RSC_FAMILY_REQUEST_HEADERS,
  proxy,
} from '../proxy';
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
 * Anonymous post-page cache eligibility (openresty alignment).
 *
 * Mirrors the edge gate in steemit/openresty #21/#22
 * (scripts/lua/condenser/{dev,production}/limit_req.lua): GET + post-page
 * path + no Cookie → `public, max-age=300` (the /upstream_cached
 * proxy_cache honors Cache-Control, which is why the header must exist);
 * any Cookie → explicit `private, no-store`; everything else untouched —
 * Next's dynamic-render default is applied outside the proxy. The header is
 * set on the middleware response (next()/rewrite()), which Next merges into
 * the final response BEFORE the render and whose default Cache-Control only
 * applies when none is present — same mechanism as the CSP above.
 *
 * Two exclusions (audit follow-up): RSC-family (flight) requests keep the
 * default (HTML-only semantics — see proxy.ts for the 307-poison attack
 * chain and the Next 16 runtime caveat that the middleware adapter strips
 * the flight markers in production), and /404 rewrites keep it too (nginx
 * honors an explicit upstream Cache-Control on non-200s, so a public 404
 * would enter the edge cache and browsers).
 */
describe('proxy anonymous post-page cache eligibility (openresty gate alignment)', () => {
  // Next's RequestInit (signal non-null etc.) — not the DOM lib's.
  type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];
  const req = (pathname: string, init?: NextRequestInit) =>
    new NextRequest(new URL(`http://localhost:3000${pathname}`), init);

  it('marks both anonymous post-page shapes public (5-minute edge TTL parity)', () => {
    expect(proxy(req('/@alice/my-post')).headers.get('Cache-Control')).toBe(
      'public, max-age=300'
    );
    expect(
      proxy(req('/hive-123/@alice/my-post')).headers.get('Cache-Control')
    ).toBe('public, max-age=300');
  });

  it('query strings stay eligible (the gate hashes $request_uri as-is)', () => {
    expect(
      proxy(req('/@alice/my-post?sort=new')).headers.get('Cache-Control')
    ).toBe('public, max-age=300');
  });

  it('treats %40-encoded @ like the decoded form (nginx $uri is decoded)', () => {
    expect(
      proxy(req('/%40alice/my-post')).headers.get('Cache-Control')
    ).toBe('public, max-age=300');
  });

  it('counts an empty Cookie header as anonymous (lua: http_cookie ~= "")', () => {
    expect(
      proxy(req('/@alice/my-post', { headers: { cookie: '' } })).headers.get(
        'Cache-Control'
      )
    ).toBe('public, max-age=300');
  });

  it('gives cookie-carrying post-page GETs an explicit private, no-store', () => {
    expect(
      proxy(req('/@alice/my-post', { headers: { cookie: 'sid=abc' } })).headers.get(
        'Cache-Control'
      )
    ).toBe('private, no-store');
    expect(
      proxy(
        req('/hive-123/@alice/my-post', { headers: { cookie: 'NEXT_LOCALE=zh' } })
      ).headers.get('Cache-Control')
    ).toBe('private, no-store');
  });

  it('leaves non-post pages on the dynamic-render default (no proxy header)', () => {
    expect(proxy(req('/trending')).headers.get('Cache-Control')).toBeNull();
    expect(proxy(req('/trending/hive-123')).headers.get('Cache-Control')).toBeNull();
    // Profile root has no segment after @user; the gate regex needs /.+.
    expect(proxy(req('/@alice')).headers.get('Cache-Control')).toBeNull();
    expect(proxy(req('/')).headers.get('Cache-Control')).toBeNull();
  });

  it('GET only — other methods keep the default', () => {
    expect(
      proxy(req('/@alice/my-post', { method: 'POST' })).headers.get('Cache-Control')
    ).toBeNull();
    expect(
      proxy(req('/@alice/my-post', { method: 'HEAD' })).headers.get('Cache-Control')
    ).toBeNull();
  });

  it('uppercases the tag segment out of eligibility (lua charset is [a-z0-9%.-])', () => {
    expect(
      proxy(req('/Hive-123/@alice/my-post')).headers.get('Cache-Control')
    ).toBeNull();
    expect(
      proxy(req('/TRENDING/@alice/my-post')).headers.get('Cache-Control')
    ).toBeNull();
  });

  it('username and permlink casing stay eligible (lua: @[^/]+ and .+)', () => {
    expect(
      proxy(req('/hive-123/@Alice/My-Post')).headers.get('Cache-Control')
    ).toBe('public, max-age=300');
  });

  it('skips proxy-issued redirects (already 3xx at middleware time)', () => {
    const redirect = proxy(req('/@alice/my-post/')); // trailing slash → 308
    expect(redirect.status).toBe(308);
    expect(redirect.headers.get('Cache-Control')).toBeNull();
  });

  it('never overlays RSC-family requests (HTML-only semantics)', () => {
    // Flight fetch without the cache-buster: the shape Next's render-time
    // hash validation (validateRSCRequestHeaders) turns into a 307. The
    // overlay must leave Next's no-store default in place, or the 307
    // would carry `public` into the edge cache under the HTML copy's key.
    expect(
      proxy(req('/@alice/my-post', { headers: { RSC: '1' } })).headers.get(
        'Cache-Control'
      )
    ).toBeNull();
    expect(
      proxy(
        req('/hive-123/@alice/my-post', { headers: { RSC: '1' } })
      ).headers.get('Cache-Control')
    ).toBeNull();
    // Normal flight fetch (cache-buster query present, 200 answer): also
    // excluded — conservatively skipping the whole RSC family keeps the
    // overlay's "HTML-only" semantics, and the edge key would otherwise
    // hold flight copies alongside HTML ones.
    expect(
      proxy(
        req('/@alice/my-post?_rsc=x', { headers: { RSC: '1' } })
      ).headers.get('Cache-Control')
    ).toBeNull();
    // Query-only shape (cache-buster without any flight header).
    expect(
      proxy(req('/@alice/my-post?_rsc=x')).headers.get('Cache-Control')
    ).toBeNull();
    // Every flight marker header individually opts out.
    for (const header of RSC_FAMILY_REQUEST_HEADERS) {
      expect(
        proxy(req('/@alice/my-post', { headers: { [header]: '1' } })).headers.get(
          'Cache-Control'
        )
      ).toBeNull();
    }
  });

  it('covers profile-section paths too (the lua gate admits them as well)', () => {
    // `@[^/]+/.+` naturally includes two-segment profile paths; the lua
    // gate caches them the same way, so the overlay must not be narrower.
    expect(proxy(req('/@alice/blog')).headers.get('Cache-Control')).toBe(
      'public, max-age=300'
    );
    expect(proxy(req('/@alice/comments')).headers.get('Cache-Control')).toBe(
      'public, max-age=300'
    );
  });

  it('falls back to the raw pathname when decoding throws (still public)', () => {
    // `/@alice/100%` holds a malformed escape: decodeURIComponent throws,
    // decodePathnameSafe falls back to the raw pathname, which still
    // matches the gate regex (nginx 400s these before its gate runs, so
    // no cached copy can diverge).
    expect(proxy(req('/@alice/100%')).headers.get('Cache-Control')).toBe(
      'public, max-age=300'
    );
  });

  it('never overlays responses rewritten to /404 (nginx honors explicit CC on non-200s)', () => {
    // GDPR guard: the gate regex matches, but a `public` 404 would be
    // stored by the edge (explicit upstream Cache-Control applies to
    // non-200s too) and held by browsers for the 5-minute window.
    expect(
      proxy(req('/@xondra/some-post')).headers.get('Cache-Control')
    ).toBeNull();
    expect(
      proxy(req('/hive-123/@xondra/some-post')).headers.get('Cache-Control')
    ).toBeNull();
    // Still a /404 rewrite — asserted so the skip is provably about the
    // rewrite target, not the path shape.
    expect(
      proxy(req('/@xondra/some-post')).headers.get('x-middleware-rewrite')
    ).toContain('/404');
  });
});

/**
 * Freeze guards: the cache-eligibility gate regex and the RSC-family marker
 * list are security-relevant constants paired with the openresty lua gate
 * and Next's FLIGHT_HEADERS respectively. Snapshots fail loudly on any
 * accidental widening (a wider gate hands `public` to paths the edge never
 * caches; a stale marker list silently re-admits flight requests).
 */
describe('proxy cache-eligibility freeze guards', () => {
  it('freezes the gate regex source against accidental widening', () => {
    // Must stay character-for-character identical to the lua gate in
    // scripts/lua/condenser/{dev,production}/limit_req.lua. RegExp#source
    // escapes forward slashes, so normalize `\/` back to `/` first.
    const normalized = ANON_POST_PAGE_GATE_RE.source.replace(/\\\//g, '/');
    expect(normalized).toBe('^/(?:[a-z0-9%.-]+/)?@[^/]+/.+');
    expect(ANON_POST_PAGE_GATE_RE.flags).toBe('');
  });

  it('keeps the RSC-family header list equal to the installed Next FLIGHT_HEADERS', () => {
    expect([...RSC_FAMILY_REQUEST_HEADERS].sort()).toEqual(
      [...FLIGHT_HEADERS].sort()
    );
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

// Freeze: the browser-side TTL literal must stay 300s to match the
// edge-side proxy_cache_valid 200 5m (openresty condenser vhosts).
describe('ANONYMOUS_PAGE_CACHE_CONTROL freeze', () => {
  it('pins the public, max-age=300 literal', () => {
    const mod = require('fs');
    const src = mod.readFileSync('proxy.ts', 'utf8');
    expect(src).toContain("ANONYMOUS_PAGE_CACHE_CONTROL = 'public, max-age=300'");
  });
});
