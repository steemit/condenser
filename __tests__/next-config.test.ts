import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';
import { securityHeaders } from '../lib/security-headers';

type NextConfigLike = {
  poweredByHeader?: boolean;
  headers?: () => Promise<Array<{ source: string; headers: unknown[] }>>;
};

const config = nextConfig as NextConfigLike;

const headerMap = (): Record<string, string> =>
  Object.fromEntries(securityHeaders.map((h) => [h.key, h.value]));

describe('next.config security headers (audit N-02)', () => {
  it('disables the X-Powered-By response header', () => {
    expect(config.poweredByHeader).toBe(false);
  });

  it('applies the security headers to every route', async () => {
    const rules = (await config.headers?.()) ?? [];
    const catchAll = rules.find((r) => r.source === '/:path*');
    expect(catchAll).toBeDefined();
    expect(catchAll?.headers).toBe(securityHeaders);
  });

  it('sets the full baseline header set with expected values', () => {
    const headers = headerMap();
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe(
      'strict-origin-when-cross-origin'
    );
    expect(headers['Permissions-Policy']).toBe(
      'camera=(), microphone=(), geolocation=()'
    );
    expect(headers['Strict-Transport-Security']).toBe(
      'max-age=31536000; includeSubDomains'
    );
  });

  it('keeps the nonce-based CSP out of the static table (proxy.ts owns it)', () => {
    // The CSP is per-request (nonce) and set by proxy.ts; a static CSP here
    // would either break the app (script-src without the request nonce) or
    // be enforced twice against documents. Directives that need no nonce
    // live in the proxy-built policy (lib/csp.ts), asserted in
    // __tests__/lib/csp.test.ts.
    expect(headerMap()['Content-Security-Policy']).toBeUndefined();
  });
});
