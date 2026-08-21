/* global describe, it, expect */
import isSafeRedirectTarget from '../utils/RedirectTarget';

describe('isSafeRedirectTarget', () => {
    it('rejects protocol-relative targets', () => {
        expect(isSafeRedirectTarget('//evil.com')).toBe(false);
        expect(isSafeRedirectTarget('%2F%2Fevil.com')).toBe(false);
        expect(isSafeRedirectTarget('/%2F%2Fevil.com')).toBe(false);
        expect(isSafeRedirectTarget('///evil.com')).toBe(false);
    });

    it('rejects scheme-prefixed targets', () => {
        expect(isSafeRedirectTarget('http://evil.com')).toBe(false);
        expect(isSafeRedirectTarget('https:evil')).toBe(false);
        // eslint-disable-next-line no-script-url
        expect(isSafeRedirectTarget('javascript:alert(1)')).toBe(false);
        // scheme check runs after decoding too
        expect(isSafeRedirectTarget('%68ttp%3a%2f%2fevil.com')).toBe(false);
    });

    it('accepts same-origin relative paths', () => {
        expect(isSafeRedirectTarget('/foo/bar')).toBe(true);
        expect(isSafeRedirectTarget('/')).toBe(true);
        expect(isSafeRedirectTarget('/path?x=1#frag')).toBe(true);
        // encoded characters that decode to harmless path content
        expect(isSafeRedirectTarget('/trending?next=%2Fhot')).toBe(true);
    });

    it('rejects non-string or empty inputs', () => {
        expect(isSafeRedirectTarget(null)).toBe(false);
        expect(isSafeRedirectTarget(undefined)).toBe(false);
        expect(isSafeRedirectTarget('')).toBe(false);
    });

    it('falls back to the raw token when decoding fails', () => {
        // '%' alone is malformed; the raw form still decides
        expect(isSafeRedirectTarget('/%')).toBe(true);
        expect(isSafeRedirectTarget('%2F%2F')).toBe(false);
    });
});
