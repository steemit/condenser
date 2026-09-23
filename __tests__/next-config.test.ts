import { describe, expect, it } from 'vitest';
import nextConfig, { securityHeaders } from '../next.config';

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

  it('keeps the CSP free of directives that need nonce infrastructure', () => {
    const csp = headerMap()['Content-Security-Policy'];
    expect(csp).toBeDefined();
    // Only the nonce-less directives are allowed in this baseline; adding
    // script-src/style-src/img-src without nonce plumbing would break the
    // app (see audit N-02 follow-up notes).
    const directives = (csp ?? '')
      .split(';')
      .map((d) => d.trim().split(/\s+/)[0])
      .filter(Boolean)
      .sort();
    expect(directives).toEqual([
      'base-uri',
      'form-action',
      'frame-ancestors',
      'object-src',
    ]);
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });
});
