/* global describe, it, expect */
import isStaticAssetPath from '../utils/StaticAssetPath';

describe('isStaticAssetPath', () => {
    it('matches the statically served prefixes', () => {
        expect(isStaticAssetPath('/assets')).toBe(true);
        expect(isStaticAssetPath('/assets/app.39fcc5ea914458e035a1.js')).toBe(
            true
        );
        expect(isStaticAssetPath('/assets/app-53c898c3315c287aaefe.css')).toBe(
            true
        );
        expect(isStaticAssetPath('/images/logo.png')).toBe(true);
        expect(isStaticAssetPath('/javascripts/foo.js')).toBe(true);
        expect(isStaticAssetPath('/favicons/favicon.ico')).toBe(true);
    });

    it('does not swallow lookalike application routes', () => {
        // koa-mount matches on segment boundaries; so must the guard,
        // or /assetsfoo would be answered 404 without ever rendering
        expect(isStaticAssetPath('/assetsfoo')).toBe(false);
        expect(isStaticAssetPath('/assetsX/app.js')).toBe(false);
        expect(isStaticAssetPath('/imagesfoo.png')).toBe(false);
    });

    it('excludes prefixes mounted later in the chain', () => {
        // /static and /.well-known are mounted after the guard; their
        // files must keep reaching their own mounts
        expect(isStaticAssetPath('/static/app.css')).toBe(false);
        expect(isStaticAssetPath('/.well-known/healthcheck.json')).toBe(false);
    });

    it('leaves application routes alone', () => {
        expect(isStaticAssetPath('/')).toBe(false);
        expect(isStaticAssetPath('/trending')).toBe(false);
        expect(isStaticAssetPath('/trending/my')).toBe(false);
        expect(isStaticAssetPath('/@ety001')).toBe(false);
        expect(isStaticAssetPath('/favicon.ico')).toBe(false);
    });

    it('matches case-sensitively like koa-mount', () => {
        // /Assets is not one of the mounts, so it falls through to the
        // SSR catch-all and renders the app shell — intentional
        expect(isStaticAssetPath('/Assets/app.js')).toBe(false);
    });

    it('rejects non-string or empty inputs', () => {
        expect(isStaticAssetPath(null)).toBe(false);
        expect(isStaticAssetPath(undefined)).toBe(false);
        expect(isStaticAssetPath('')).toBe(false);
    });
});
