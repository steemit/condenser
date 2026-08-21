/* global describe, it, expect */
const { isSafeRedirectTarget } = require('../server');

describe('isSafeRedirectTarget', () => {
    it('rejects protocol-relative targets', () => {
        expect(isSafeRedirectTarget('//evil.com')).toBe(false);
        expect(isSafeRedirectTarget('%2F%2Fevil.com')).toBe(false);
        expect(isSafeRedirectTarget('/%2F%2Fevil.com')).toBe(false);
    });

    it('rejects scheme-prefixed targets', () => {
        expect(isSafeRedirectTarget('http://evil.com')).toBe(false);
        expect(isSafeRedirectTarget('https:evil')).toBe(false);
        expect(isSafeRedirectTarget('javascript:alert(1)')).toBe(false);
    });

    it('accepts same-origin relative paths', () => {
        expect(isSafeRedirectTarget('/foo/bar')).toBe(true);
        expect(isSafeRedirectTarget('/')).toBe(true);
        expect(isSafeRedirectTarget('/path?x=1#frag')).toBe(true);
    });

    it('rejects non-string or empty inputs', () => {
        expect(isSafeRedirectTarget(null)).toBe(false);
        expect(isSafeRedirectTarget(undefined)).toBe(false);
        expect(isSafeRedirectTarget('')).toBe(false);
    });
});
