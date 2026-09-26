// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { proxy } from '../proxy';

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

});
