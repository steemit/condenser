/* global describe, it, expect */
import isSafeRedirectTarget from '../utils/RedirectTarget';
import { routeRegex } from '../../app/ResolveRoute';

describe('isSafeRedirectTarget', () => {
    it('rejects protocol-relative targets', () => {
        expect(isSafeRedirectTarget('//evil.com')).toBe(false);
        expect(isSafeRedirectTarget('%2F%2Fevil.com')).toBe(false);
        expect(isSafeRedirectTarget('///evil.com')).toBe(false);
    });

    it('rejects backslash forms the browser treats as authority', () => {
        // `\` is normalized to `/` before URL parsing, so these are
        // protocol-relative in every browser even though no literal
        // `//` appears — the gap reported by the security team.
        expect(isSafeRedirectTarget('/\\evil.com')).toBe(false);
        expect(isSafeRedirectTarget('\\evil.com')).toBe(false);
        expect(isSafeRedirectTarget('/\\/\\evil.com')).toBe(false);
        expect(isSafeRedirectTarget('/\\//evil.com')).toBe(false);
        // tabs/newlines are stripped by the URL parser just like by browsers
        expect(isSafeRedirectTarget('/\t/evil.com')).toBe(false);
        expect(isSafeRedirectTarget('/\\\nevil.com')).toBe(false);
        expect(isSafeRedirectTarget('/\r/evil.com')).toBe(false);
    });

    it('rejects unrooted inputs that normalize into protocol-relative', () => {
        // Browsers strip leading tab/newline/space before resolving the
        // Location header, so these all become `//evil.com` downstream;
        // the rooted check (`raw[0] === '/'`) must reject them before
        // any parsing happens.
        expect(isSafeRedirectTarget('\t//evil.com')).toBe(false);
        expect(isSafeRedirectTarget('\n/\\evil.com')).toBe(false);
        expect(isSafeRedirectTarget(' //evil.com')).toBe(false);
        // Fail-closed boundary: even a benign normalized target is
        // rejected while the raw input is not rooted. Middleware
        // output always starts with '/', so this never fires in
        // practice — if it ever did, the request just skips the
        // redirect and continues normal handling.
        expect(isSafeRedirectTarget('\t/trending')).toBe(false);
    });

    it('rejects scheme-prefixed targets', () => {
        expect(isSafeRedirectTarget('http://evil.com')).toBe(false);
        expect(isSafeRedirectTarget('https:evil')).toBe(false);
        // eslint-disable-next-line no-script-url
        expect(isSafeRedirectTarget('javascript:alert(1)')).toBe(false);
        expect(isSafeRedirectTarget('%68ttp%3a%2f%2fevil.com')).toBe(false);
        expect(isSafeRedirectTarget('https://steemit.com.example.com')).toBe(
            false
        );
    });

    it('accepts same-origin relative paths', () => {
        expect(isSafeRedirectTarget('/foo/bar')).toBe(true);
        expect(isSafeRedirectTarget('/')).toBe(true);
        expect(isSafeRedirectTarget('/path?x=1#frag')).toBe(true);
        expect(isSafeRedirectTarget('/trending?next=%2Fhot')).toBe(true);
        // encoded slashes stay path content on this host — the browser
        // never decodes them into an authority, so this is same-origin
        expect(isSafeRedirectTarget('/%2F%2Fevil.com')).toBe(true);
        expect(isSafeRedirectTarget('/%5Cevil.com')).toBe(true);
    });

    it('rejects non-string or empty inputs', () => {
        expect(isSafeRedirectTarget(null)).toBe(false);
        expect(isSafeRedirectTarget(undefined)).toBe(false);
        expect(isSafeRedirectTarget('')).toBe(false);
    });

    it('tolerates malformed percent sequences as plain path content', () => {
        // '%' alone is not decoded into anything by the URL parser;
        // it stays in the path on this origin
        expect(isSafeRedirectTarget('/%')).toBe(true);
        expect(isSafeRedirectTarget('%2F%2F')).toBe(false);
    });

    it('routeRegex does not swallow path separators into <tag>', () => {
        // These previously matched Post with tag=/evil.com (the [\w\W]
        // class matches every char), reached the lowercase-normalization
        // 301 in server.js and redirected off-site once any uppercase
        // char was present.
        expect(routeRegex.Post.test('//evil.com/@a/b')).toBe(false);
        expect(routeRegex.Post.test('/\\evil.com/@a/b')).toBe(false);
        expect(routeRegex.Post.test('/\\/\\evil.com/@a/b')).toBe(false);
        expect(routeRegex.PostJson.test('//evil.com/@a/b.json')).toBe(false);
        expect(routeRegex.CategoryFilters.test('/trending//evil.com')).toBe(
            false
        );
    });

    it('routeRegex still matches legitimate tag routes', () => {
        expect(routeRegex.Post.test('/hive-148441/@ety001/some-post')).toBe(
            true
        );
        expect(routeRegex.Post.test('/photography/@ety001/some-post')).toBe(
            true
        );
        // uppercase tags must keep matching so the 301 lowercase
        // normalization in server.js still fires
        expect(routeRegex.Post.test('/HIVE-148441/@a/B')).toBe(true);
        expect(routeRegex.CategoryFilters.test('/trending/HIVE-148441')).toBe(
            true
        );
        expect(routeRegex.CategoryFilters.test('/trending')).toBe(true);
        expect(routeRegex.CommunityRoles.test('/roles/hive-123')).toBe(true);
    });
});
