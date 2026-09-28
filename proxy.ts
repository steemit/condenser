/**
 * Next.js Proxy
 * Handles route resolution for dynamic paths
 * Since Next.js doesn't allow different slug names at the same level,
 * we use proxy to rewrite routes to a unified structure
 * 
 * Note: This replaces the deprecated middleware.ts convention
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildCspHeaderValue, generateCspNonce } from './lib/csp';
import { isGdprUser } from './lib/gdpr-user-list';
import {
  INTERNAL_AT_EXEMPT_RE,
  INTERNAL_TARGET_RE,
  PROFILE_SECTIONS,
  RESERVED_ROUTES,
  SORT_TYPES,
} from './lib/routes';
import { applySecurityHeaders } from './lib/security-headers';

/** Extra request headers NextResponse constructors accept (per-request nonce). */
type RequestInit = Parameters<typeof NextResponse.next>[0];

// Known static asset extensions served from public/ (or framework internals).
// Anything else with a dot (usernames, permlinks) must continue routing.
const STATIC_ASSET_RE =
  /\.(ico|png|jpe?g|gif|svg|webp|avif|css|js|map|json|xml|txt|md|webmanifest|woff2?|ttf|eot|mp4|webm|pdf|html?)$/i;

// Internal rewrite targets and the @-exemption are derived in lib/routes.ts
// from INTERNAL_ROUTE_PREFIXES; see the guard near the end of this file.

// Legacy .html URL aliases (audit N-02 follow-up: redirects issued from
// next.config redirects() carry no security headers — Next's redirects()
// has no per-entry headers support — so these are issued here, where the
// full header set plus the per-request CSP apply. They must run BEFORE the
// static-asset skip because .html matches STATIC_ASSET_RE. Same 308 status
// as the previous `permanent: true` next.config redirects.)
const LEGACY_HTML_ALIASES: Record<string, string> = {
  '/login.html': '/login',
  '/faq.html': '/faq',
  '/privacy.html': '/privacy',
  '/tos.html': '/tos',
};

// ---------------------------------------------------------------------------
// Anonymous post-page cache eligibility (openresty sidecar alignment).
//
// The openresty edge in front of this app (steemit/openresty #21/#22,
// scripts/lua/condenser/{dev,production}/limit_req.lua) routes a request to
// its proxy_cache location (/upstream_cached, `proxy_cache_valid 200 5m`)
// only when it is a GET, its path is a post page, and it carries no Cookie
// header at all:
//
//     is_get and ngx.re.find(uri, [[^/(?:[a-z0-9%.-]+/)?@[^/]+/.+]], "jo")
//             and not has_cookie
//
// nginx honors Cache-Control, and Next.js stamps every dynamically rendered
// page with `private, no-cache, no-store, max-age=0, must-revalidate`,
// which nginx refuses to cache — so without this overlay the edge cache's
// hit rate stays at 0%. The overlay below marks exactly the requests the
// edge gate would cache as publicly cacheable (5 minutes, matching the edge
// TTL) and keeps cookie-carrying post-page GETs on an explicit
// `private, no-store`.
//
// Why setting the header here works: middleware response headers are applied
// to the outgoing response before the page renders, and the render path only
// stamps its default Cache-Control when the response does not already carry
// one (next/dist/server/send-payload.js: "If cache control is already set on
// the response we don't override it") — the same mechanism the per-request
// CSP above relies on. Verified against a production build (`next start`):
// anonymous post-page GETs serve `public, max-age=300` while /trending keeps
// Next's default. Caveat: Next's DEV server unconditionally overrides
// Cache-Control with `no-cache, must-revalidate` (base-server.js, dev-only
// branch), so the overlay is invisible under `next dev` — it only matters
// for production builds, which is what the edge fronts anyway.
//
// Alignment constraints (deliberately tight):
//  - The path regex mirrors the lua gate character-for-character, INCLUDING
//    the lowercase-only tag segment [a-z0-9%.-] — deliberately narrower than
//    branch 2's [^/]+ below: a wider match would hand `public` to paths the
//    edge never caches (e.g. an uppercase-tag /Tag/@user/permlink), leaving
//    browsers caching pages nginx does not. The DECODED pathname is tested,
//    matching nginx $uri (decoded) semantics.
//  - GET only: the edge gate itself only admits GET (a HEAD bypasses to the
//    uncached /upstream; proxy_cache_convert_head only serves HEADs from the
//    stored GET copy afterwards), so any other method keeps Next's default.
//  - Proxy-issued redirects (trailing-slash 308s, .html aliases) are
//    skipped: the edge never caches them (proxy_cache_valid is 200-only)
//    and permanent redirects have their own caching semantics.
//  - Any Cookie header — not just a session cookie — opts out, mirroring the
//    gate; those responses get an explicit `private, no-store`.
//  - Responses the proxy rewrites to /404 (GDPR users, unroutable forms)
//    still carry `public` when the gate regex matches: nginx does not cache
//    non-200s, so at worst a browser holds the not-found view for the same
//    5-minute window the page cache itself uses.
//
// CSP nonce tradeoff: within the 5-minute TTL every visitor served from the
// shared edge copy sees the SAME nonce (the copy's CSP header and rendered
// scripts come from one response, so the copy stays internally coherent).
// That is a semantic weakening of the nonce defense-in-depth layer only —
// the primary XSS defense is the render pipeline (markdown-it → HtmlReady →
// sanitize-html, covered by the 66-case XSS suite) — and matches what
// legacy accepted in #4032 when it made anonymous post pages cacheable.
// Anonymous documents hold no personalized state (observer=null; the app
// personalizes only through /api, which is never cached).
// ---------------------------------------------------------------------------
const ANON_POST_PAGE_GATE_RE = /^\/(?:[a-z0-9%.-]+\/)?@[^/]+\/.+/;

/** 5 minutes — must match the edge's `proxy_cache_valid 200 5m`. */
const ANON_PAGE_CACHE_CONTROL = 'public, max-age=300';
/** Explicit opt-out for cookie-carrying post-page GETs (gate bypasses too). */
const COOKIE_PAGE_CACHE_CONTROL = 'private, no-store';

/**
 * Stamp Cache-Control on post-page GETs per the openresty cache-eligibility
 * gate (see the comment block above). No-op for everything else, leaving
 * Next's dynamic-render default in place.
 */
function applyAnonymousPageCacheControl(
  request: NextRequest,
  response: NextResponse
): void {
  if (request.method !== 'GET' || response.status >= 300) return;
  // nginx $uri is decoded; mirror that before testing the gate regex. On
  // malformed escapes nginx 400s before its gate runs, so falling back to
  // the raw path cannot diverge from any cached copy.
  let pathname = request.nextUrl.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // keep the raw (still-encoded) pathname
  }
  if (!ANON_POST_PAGE_GATE_RE.test(pathname)) return;
  // lua: has_cookie = ngx.var.http_cookie ~= nil and ngx.var.http_cookie ~= ""
  const hasCookie = (request.headers.get('cookie') ?? '') !== '';
  response.headers.set(
    'Cache-Control',
    hasCookie ? COOKIE_PAGE_CACHE_CONTROL : ANON_PAGE_CACHE_CONTROL
  );
}

export function proxy(request: NextRequest) {
  // Content-Security-Policy with a per-request nonce (audit N-02 follow-up):
  // the policy is attached to the REQUEST headers — that is how Next.js's
  // render pipeline discovers the nonce and stamps it on the framework /
  // bootstrap scripts it emits — and mirrored onto the response. Both headers
  // are SET (never appended), so a client cannot spoof a nonce past the
  // render pipeline by sending its own. Every route renders per-request
  // (app/layout.tsx `dynamic = 'force-dynamic'`), so no cached or static
  // document can carry a stale nonce.
  const nonce = generateCspNonce();
  const csp = buildCspHeaderValue(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce); // consumed by app/layout.tsx
  requestHeaders.set('Content-Security-Policy', csp);

  const response = resolveRoute(request, {
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', csp);
  // Cache-eligibility overlay AFTER the CSP so the two header overrides
  // stay visually paired (both ride the same middleware-header mechanism).
  applyAnonymousPageCacheControl(request, response);
  return response;
}

/**
 * A redirect the proxy issues itself. next.config headers() does not apply to
 * these responses, so the baseline security headers are set explicitly
 * (audit N-02 follow-up) alongside the per-request CSP the wrapper adds.
 *
 * The destination is a plain URL: NextURL (from nextUrl.clone()) re-applies
 * its trailing-slash normalization when stringified, silently undoing a
 * pathname assignment.
 */
function securityRedirect(url: URL): NextResponse {
  const response = NextResponse.redirect(url, 308);
  applySecurityHeaders(response.headers);
  return response;
}

/**
 * Plain redirect URL for a pathname, preserving the request's query string,
 * or null when the constructed URL would escape the request's origin.
 *
 * The trailing-slash branch feeds this a request-controlled pathname, and
 * WHATWG URL parses `//evil.example/x/` — and `/\evil.example/x/`, since a
 * backslash is a path separator under the special (http/https) schemes — as
 * a protocol-relative URL pointing at the attacker's host. A null return is
 * handled by the callers as an unroutable path (404 rewrite), the same
 * treatment as every other invalid form.
 */
function redirectUrl(request: NextRequest, pathname: string): URL | null {
  let url: URL;
  try {
    url = new URL(pathname + request.nextUrl.search, request.url);
    if (url.origin !== new URL(request.url).origin) return null;
  } catch {
    return null;
  }
  return url;
}

function resolveRoute(request: NextRequest, requestInit: RequestInit) {
  // Get pathname and ensure it's decoded
  // Next.js should decode it automatically, but we handle %40 (@) encoding explicitly
  let { pathname } = request.nextUrl;

  // Decode URL-encoded @ symbols (%40) if present
  // This handles cases where @ might be encoded in the URL
  if (pathname.includes('%40')) {
    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      // If decoding fails, use original pathname
    }
  }

  // Legacy .html aliases (must precede the static-asset skip below).
  const alias = LEGACY_HTML_ALIASES[pathname];
  if (alias) {
    // The alias targets are constants, so this can only fail if the request
    // URL itself is malformed — handled like any unroutable path.
    const target = redirectUrl(request, alias);
    return target
      ? securityRedirect(target)
      : NextResponse.rewrite(new URL('/404', request.url), requestInit);
  }

  // Skip API routes, static files, and the 404 page. Static files are
  // detected by a known asset extension — NOT by any dot, because Steem
  // usernames and permlinks may legitimately contain dots
  // (e.g. /@ety001.test01, /@user/post-v1.2).
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/404' ||
    STATIC_ASSET_RE.test(pathname)
  ) {
    return NextResponse.next(requestInit);
  }

  // GDPR-listed accounts 404 on every route family that exposes them
  // (mirrors legacy ResolveRoute.js GDPRUserList checks): /@user,
  // /@user/<section|permlink|feed> and /category/@user/permlink.
  // A single guard covers all four families because the @-segment is always
  // the first or second path segment in each of them. Dotted usernames
  // (e.g. mateja.klaric) reach this guard too — the static-asset check above
  // only matches known file extensions.
  const gdprMatch = pathname.match(/^\/(?:[^\/]+\/)?@([^\/]+)/);
  if (gdprMatch && isGdprUser(gdprMatch[1])) {
    return NextResponse.rewrite(new URL('/404', request.url), requestInit);
  }

  // Follow legacy route matching order (ResolveRoute.js):
  // 1. Static routes (handled by skip logic above)
  // 1.5. /roles/hive-* → Community roles page
  // 2. /category/@username/permlink → Post page
  // 3. /@username/feed → User feed  
  // 4. /@username/<section> → User profile section
  // 5. /@username/<permlink> → Post without category
  // 6. /@username → User profile root
  // 7. /[sort]/[tag] → Category filters (including communities like hive-*)

  // 1.5. Pattern: /roles/hive-* → Community roles page
  const communityRolesMatch = pathname.match(/^\/roles\/([^\/]+)$/);
  if (communityRolesMatch) {
    // Pass through to roles/[tag] route
    return NextResponse.next(requestInit);
  }

  // 2. Pattern: /category/@username/permlink → Post page
  // No reserved-word check here — see the RESERVED_ROUTES rationale in
  // lib/routes.ts.
  const postWithCategoryMatch = pathname.match(/^\/([^\/]+)\/@([^\/]+)\/([^\/]+)$/);
  if (postWithCategoryMatch) {
    const [, category, username, permlink] = postWithCategoryMatch;
    const url = request.nextUrl.clone();
    url.pathname = `/post/${category}/${username}/${permlink}`;
    return NextResponse.rewrite(url, requestInit);
  }

  // 3. Pattern: /@username/feed → User feed
  const userFeedMatch = pathname.match(/^\/@([^\/]+)\/feed\/?$/);
  if (userFeedMatch) {
    const [, username] = userFeedMatch;
    if (!RESERVED_ROUTES.includes(username.toLowerCase())) {
      // Rewrite to user/[username]/[section] route (feed is a section)
      const url = request.nextUrl.clone();
      url.pathname = `/user/${username}/feed`;
      return NextResponse.rewrite(url, requestInit);
    }
  }

  // 4. Pattern: /@username/<section> → User profile section
  const userSectionMatch = pathname.match(/^\/@([^\/]+)\/([^\/]+)$/);
  if (userSectionMatch) {
    const [, username, section] = userSectionMatch;
    if (!RESERVED_ROUTES.includes(username.toLowerCase()) &&
        PROFILE_SECTIONS.includes(section.toLowerCase())) {
      // Rewrite to user/[username]/[section] route
      const url = request.nextUrl.clone();
      url.pathname = `/user/${username}/${section}`;
      return NextResponse.rewrite(url, requestInit);
    }
  }

  // 5. Pattern: /@username/<permlink> → Post without category
  const postNoCategoryMatch = pathname.match(/^\/@([^\/]+)\/([^\/]+)$/);
  if (postNoCategoryMatch) {
    const [, username, permlink] = postNoCategoryMatch;
    if (!RESERVED_ROUTES.includes(username.toLowerCase()) &&
        !PROFILE_SECTIONS.includes(permlink.toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = `/post-no-category/${username}/${permlink}`;
      return NextResponse.rewrite(url, requestInit);
    }
  }

  // 6. Pattern: /@username → User profile root
  const userProfileMatch = pathname.match(/^\/@([^\/]+)$/);
  if (userProfileMatch) {
    const [, username] = userProfileMatch;
    if (!RESERVED_ROUTES.includes(username.toLowerCase())) {
      // Rewrite to user/[username] route (redirects to user/[username]/blog)
      const url = request.nextUrl.clone();
      url.pathname = `/user/${username}`;
      return NextResponse.rewrite(url, requestInit);
    }
    // Reserved route used as username - should be 404
    return NextResponse.rewrite(new URL('/404', request.url), requestInit);
  }

  // 7. Pattern: /[sort]/[tag] → Category filters (including communities)
  // Examples: /trending/hive-123456, /hot/bitcoin, /created/photography
  const categoryFiltersMatch = pathname.match(/^\/([^\/]+)\/([^\/]+)$/);
  if (categoryFiltersMatch) {
    const [, sort, tag] = categoryFiltersMatch;
    if (SORT_TYPES.includes(sort.toLowerCase()) && !tag.startsWith('@')) {
      // Pass through to [sort]/[tag] route
      return NextResponse.next(requestInit);
    }
  }

  // Pattern: /[sort] → Category filters without tag
  // Examples: /trending, /hot, /created
  const sortOnlyMatch = pathname.match(/^\/([^\/]+)$/);
  if (sortOnlyMatch) {
    const [, sort] = sortOnlyMatch;
    // Literal /404 never reaches here — the static/API skip at the top of
    // proxy() passes it through first.
    if (SORT_TYPES.includes(sort.toLowerCase())) {
      // Pass through to [sort] route
      return NextResponse.next(requestInit);
    }
  }

  // Internal rewrite targets are not addressable. Legacy has no /post,
  // /post-no-category or /user routes — its ResolveRoute.js regexes match
  // at most three segments with an @-prefixed account, so /post/a/b/c,
  // /post-no-category/a/b and /user/alice were all NotFound. Anything under
  // these prefixes that reaches this point was not consumed by the rewrites
  // above and must 404 instead of hitting the underlying App Router routes
  // (which would render a second, uncanonical URL for the same content —
  // e.g. the four-segment /post/<cat>/@user/<permlink> reached
  // /post/[category]/[username]/[permlink] with a 200).
  // @-containing paths are exempt only in the exact trailing-slash Post form
  // (INTERNAL_AT_EXEMPT_RE from lib/routes.ts) so /post/@user/permlink/
  // still normalizes
  // through branch 2; slash-less three-segment @ forms never get here
  // because branch 2 consumes them first (legacy Post regex parity: any
  // [\w.-]{1,32} tag is a category).
  if (
    INTERNAL_TARGET_RE.test(pathname) &&
    !INTERNAL_AT_EXEMPT_RE.test(pathname)
  ) {
    return NextResponse.rewrite(new URL('/404', request.url), requestInit);
  }

  // Catch invalid patterns that should be 404 (following legacy behavior)
  
  // Pattern: /category/username/permlink (missing @)
  const invalidThreeSegment = pathname.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
  if (invalidThreeSegment) {
    const [, first, second] = invalidThreeSegment;
    if (!RESERVED_ROUTES.includes(first.toLowerCase()) && !second.startsWith('@')) {
      return NextResponse.rewrite(new URL('/404', request.url), requestInit);
    }
  }

  // Pattern: /username/something (missing @)  
  const invalidTwoSegment = pathname.match(/^\/([^\/]+)\/([^\/]+)$/);
  if (invalidTwoSegment) {
    const [, first] = invalidTwoSegment;
    if (!RESERVED_ROUTES.includes(first.toLowerCase()) && !first.startsWith('@')) {
      return NextResponse.rewrite(new URL('/404', request.url), requestInit);
    }
  }

  // Pattern: /username (missing @)
  const invalidSingleSegment = pathname.match(/^\/([^\/]+)$/);
  if (invalidSingleSegment) {
    const [, segment] = invalidSingleSegment;
    if (!RESERVED_ROUTES.includes(segment.toLowerCase()) && !segment.startsWith('@')) {
      return NextResponse.rewrite(new URL('/404', request.url), requestInit);
    }
  }

  // Trailing-slash normalization with security headers (audit N-02
  // follow-up): Next's implicit 308 for e.g. `/trending/` carries no security
  // headers (its redirects short-circuit before the next.config headers()
  // table applies), so issue the same 308 here — the proxy runs before route
  // resolution. Placement at the END of the chain keeps every branch that
  // already handles a trailing slash directly (e.g. branch 3's `/@user/feed/`)
  // rewriting without an extra hop; only paths that would otherwise fall
  // through to Next's implicit redirect are affected.
  //
  // redirectUrl() returns null (→ 404) for pathnames that WHATWG URL would
  // parse as a protocol-relative/cross-origin target — e.g. `//evil.example/`
  // or `/\evil.example/` (backslash is a path separator under http(s)) — so
  // the normalization can never be turned into an open redirect.
  if (pathname !== '/' && pathname.endsWith('/')) {
    const target = redirectUrl(
      request,
      pathname.replace(/\/+$/, '') || '/'
    );
    return target
      ? securityRedirect(target)
      : NextResponse.rewrite(new URL('/404', request.url), requestInit);
  }

  return NextResponse.next(requestInit);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

