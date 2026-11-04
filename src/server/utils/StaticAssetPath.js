// Path prefixes served by the koa-static-cache mounts registered at the top
// of server.js (all before the missing-static guard runs). A request under
// one of these prefixes that reaches downstream middleware therefore means
// the requested static file does not exist. `/static` and `/.well-known`
// are mounted later in the chain and ship with the application itself, so
// they are deliberately absent here — guarding them from the top of the
// chain would 404 files that do exist.
const STATIC_PREFIXES = ['/assets', '/images', '/javascripts', '/favicons'];

/**
 * True when `pathname` lives under one of the statically served prefixes.
 * Matching is case-sensitive and stops at segment boundaries, mirroring
 * how koa-mount matches: `/assetsfoo` is an application route, not a
 * missing static file.
 */
export default function isStaticAssetPath(pathname) {
    if (typeof pathname !== 'string' || pathname === '') return false;
    return STATIC_PREFIXES.some(
        prefix => pathname === prefix || pathname.startsWith(prefix + '/')
    );
}
