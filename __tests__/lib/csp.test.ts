// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildCspHeaderValue, generateCspNonce } from '@/lib/csp';

/**
 * Parse a CSP header value into directive → sources (first source is the
 * directive name).
 */
function parse(csp: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const directive of csp.split(';').map((d) => d.trim()).filter(Boolean)) {
    const [name, ...sources] = directive.split(/\s+/);
    out[name] = sources;
  }
  return out;
}

describe('lib/csp (audit N-02 follow-up: nonce-based CSP)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('generateCspNonce', () => {
    it('produces unique nonces with healthy entropy', () => {
      const seen = new Set<string>();
      for (let i = 0; i < 100; i++) seen.add(generateCspNonce());
      expect(seen.size).toBe(100);
      for (const nonce of seen) {
        // base64 of a 128-bit UUID: 22+ chars of base64 alphabet.
        expect(nonce).toMatch(/^[A-Za-z0-9+/]{20,}={0,2}$/);
      }
    });
  });

  describe('buildCspHeaderValue', () => {
    it('embeds the nonce in script-src and style-src and keeps strict-dynamic', () => {
      const csp = buildCspHeaderValue('NONCE123');
      const d = parse(csp);
      expect(d['script-src']).toContain("'nonce-NONCE123'");
      expect(d['script-src']).toContain("'strict-dynamic'");
      expect(d['style-src']).toContain("'nonce-NONCE123'");
    });

    it('never allows unsafe-inline scripts', () => {
      const d = parse(buildCspHeaderValue('N'));
      expect(d['script-src']).not.toContain("'unsafe-inline'");
    });

    it('adds unsafe-eval for scripts only in development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const dev = parse(buildCspHeaderValue('N'));
      expect(dev['script-src']).toContain("'unsafe-eval'");
      expect(dev['connect-src']).toContain('ws:'); // HMR websocket

      vi.stubEnv('NODE_ENV', 'production');
      const prod = parse(buildCspHeaderValue('N'));
      expect(prod['script-src']).not.toContain("'unsafe-eval'");
      expect(prod['connect-src']).not.toContain('ws:');
    });

    it('relaxes style-src to unsafe-inline in dev (devtools injects <style> without nonce)', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const dev = parse(buildCspHeaderValue('N'));
      expect(dev['style-src']).toContain("'unsafe-inline'");
      // A nonce disables 'unsafe-inline' per spec, so dev drops the nonce.
      expect(dev['style-src'].join(' ')).not.toContain("'nonce-");

      vi.stubEnv('NODE_ENV', 'production');
      const prod = parse(buildCspHeaderValue('N'));
      expect(prod['style-src']).toContain("'nonce-N'");
      expect(prod['style-src']).not.toContain("'unsafe-inline'");
    });

    it('keeps the nonce-free baseline directives from the audit-N-02 fix', () => {
      const d = parse(buildCspHeaderValue('N'));
      expect(d['frame-ancestors']).toEqual(["'self'"]);
      expect(d['object-src']).toEqual(["'none'"]);
      expect(d['base-uri']).toEqual(["'self'"]);
      expect(d['form-action']).toEqual(["'self'"]);
    });

    it('allows inline style attributes (React style props) but only via style-src-attr', () => {
      const d = parse(buildCspHeaderValue('N'));
      // A nonce in style-src disables 'unsafe-inline' there per spec, so the
      // attribute escape hatch must be its own directive.
      expect(d['style-src-attr']).toEqual(["'unsafe-inline'"]);
      expect(d['style-src']).not.toContain("'unsafe-inline'");
    });

    it('lists the Google fonts stylesheet/font origins', () => {
      const d = parse(buildCspHeaderValue('N'));
      expect(d['style-src']).toContain('https://fonts.googleapis.com');
      expect(d['font-src']).toContain('https://fonts.gstatic.com');
    });

    it('mirrors legacy img-src * data: (post bodies embed third-party images)', () => {
      const d = parse(buildCspHeaderValue('N'));
      expect(d['img-src']).toEqual(['*', 'data:']);
    });

    it('frame-src enumerates the sanitize-config embed whitelist plus TronAd hosts', () => {
      const d = parse(buildCspHeaderValue('N'));
      const frames = d['frame-src'];
      for (const origin of [
        "'self'",
        'https://player.vimeo.com',
        'https://www.youtube.com',
        'https://3speak.online',
        'https://w.soundcloud.com',
        'https://player.twitch.tv',
        'https://emb.d.tube',
        'https://engine.tronads.io',
        'https://test-engine.tronads.io',
      ]) {
        expect(frames).toContain(origin);
      }
      // No blanket https: like the legacy frame-src — this stack has a
      // finite, known set of frame origins.
      expect(frames).not.toContain('https:');
    });

    it('omits GA endpoints when GA is not configured', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('SDC_GOOGLE_ANALYTICS_ID', '');
      const d = parse(buildCspHeaderValue('N'));
      expect(d['script-src'].join(' ')).not.toContain('googletagmanager');
      expect(d['connect-src'].join(' ')).not.toContain('google-analytics');
    });

    it('adds GA script and collect endpoints when GA is configured', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('SDC_GOOGLE_ANALYTICS_ID', 'G-TEST');
      const d = parse(buildCspHeaderValue('N'));
      expect(d['script-src']).toContain('https://www.googletagmanager.com');
      expect(d['connect-src']).toContain('https://www.google-analytics.com');
      expect(d['connect-src']).toContain('https://*.google-analytics.com');
    });

    it('adds the configured upload endpoint origin to connect-src', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv(
        'SDC_UPLOAD_IMAGE_URL',
        'https://upload.example.com/upload/image'
      );
      const d = parse(buildCspHeaderValue('N'));
      expect(d['connect-src']).toContain('https://upload.example.com');
    });

    it('ignores non-http(s) upload endpoints', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('SDC_UPLOAD_IMAGE_URL', 'javascript:alert(1)');
      const d = parse(buildCspHeaderValue('N'));
      expect(d['connect-src'].join(' ')).not.toContain('javascript');
    });
  });
});
