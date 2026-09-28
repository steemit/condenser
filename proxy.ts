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
// NOTE: "already set is not overridden" is a send-payload implementation
// detail, not a documented contract — every Next MAJOR upgrade must
// re-verify the middleware-header override mechanism empirically before
// trusting this overlay again (see docs/ROUTE_MAP.md, "Keeping this in
// sync").
//
// HTML-only: RSC-family requests are excluded from the overlay (audit
// follow-up, BLOCKER). The overlay must never hand a cacheable
// Cache-Control to a React "flight" request, because render-time RSC
// machinery can turn such a response into a same-key poison of the HTML
// cache copy:
//
//   1. A client that is not the Next router (curl, a script, an attacker)
//      sends GET /<tag>/@user/<permlink> with `RSC: 1` and no `?_rsc=`
//      cache-buster.
//   2. At middleware time the response is a plain 200 rewrite, so the
//      status>=300 guard below never fires — the redirect does not exist
//      yet — and the overlay used to stamp `public, max-age=300` on it.
//   3. Next's render-time RSC hash validation (base-server.js,
//      experimental.validateRSCRequestHeaders, default-on in Next 16) sees
//      the flight request with a missing `_rsc` hash and answers with a
//      307 empty-body redirect to the same URL plus `?_rsc=<expected>`.
//   4. That 307 carries the middleware-stamped `public, max-age=300`
//      (send-payload does not override an already-set header), and the
//      edge cache key contains neither the RSC header nor any working Vary
//      dimension — nginx does not vary its cache key on request headers,
//      so a `Vary: RSC` on the response would be decorative.
//   5. nginx therefore stores the 307 empty body under the exact key the
//      anonymous HTML copy uses; the next anonymous HTML GET of that URL
//      is served the cached 307 instead of the page (reproduced
//      end-to-end on a production build: RSC:1 request first, then a plain
//      anonymous GET returns the cached 307 empty body).
//
// NEXT 16 RUNTIME CAVEAT (verified empirically, see the PR follow-up): in
// production the Node middleware adapter STRIPS the flight markers before
// the middleware sees the request — next/dist/server/web/adapter.js
// ("Headers should only be stripped for middleware") deletes every
// FLIGHT_HEADERS entry and the `_rsc` search parameter from the
// middleware-visible request and re-applies them to the render request
// afterwards. On a production build, a request carrying `RSC: 1` that the
// render-time validation 307s shows `request.headers.get('rsc') === null`
// inside this proxy. The guard below is therefore inert for that vector on
// Next 16.3.x; it is still the correct, portable guard (live in the unit
// layer where requests reach proxy() verbatim, and on any runtime where
// the markers reach the middleware). The load-bearing fix for the 307
// poison is at the edge, where nginx CAN see the RSC header: the openresty
// cache gate must bypass RSC-carrying requests and/or
// `proxy_ignore_headers Cache-Control` must keep non-200 responses out of
// the cache (tracked in the openresty repository — dependency noted in the
// PR body and docs/ROUTE_MAP.md).
//
// Alignment constraints (deliberately tight):
//  - The path regex mirrors the lua gate character-for-character, INCLUDING
//    the lowercase-only tag segment [a-z0-9%.-] — deliberately narrower than
//    branch 2's [^/]+ below: a wider match would hand `public` to paths the
//    edge never caches (e.g. an uppercase-tag /Tag/@user/permlink), leaving
//    browsers caching pages nginx does not. The DECODED pathname is tested,
//    matching nginx $uri (decoded) semantics.
//  - The gate regex intentionally also covers /@user/<profile-section>
//    (e.g. /@alice/blog): `@[^/]+/.+` naturally includes two-segment
//    profile paths, and the lua gate admits them the same way — the
//    overlay matches that overlap on purpose.
//  - GET only: the edge gate itself only admits GET (a HEAD bypasses to the
//    uncached /upstream; proxy_cache_convert_head only serves HEADs from the
//    stored GET copy afterwards), so any other method keeps Next's default.
//  - Proxy-issued redirects (trailing-slash 308s, .html aliases) are
//    skipped via the status guard — they are already 3xx at middleware
//    time. Render-time redirects cannot be caught that way: the RSC 307 is
//    covered by the flight exclusion above, and the page-level
//    canonicalization redirect of no-category post pages keeps the
//    overlay's header (a per-URL-stable redirect; the openresty
//    `proxy_ignore_headers Cache-Control` change is what keeps non-200s
//    out of the edge cache).
//  - Any Cookie header — not just a session cookie — opts out, mirroring the
//    gate; those responses get an explicit `private, no-store`.
//  - Responses this proxy rewrites to /404 (GDPR guard, internal-target
//    guard, unroutable forms) are NOT overlaid even when the gate regex
//    matches (audit follow-up, MAJOR): nginx honors an explicit upstream
//    Cache-Control for non-200 statuses too — `proxy_cache_valid 200 5m`
//    alone does not stop a `public, max-age=300` 404 from being stored —
//    so a public 404 would enter the edge cache and browsers would hold
//    the not-found view for the 5-minute window. Skipping the overlay
//    keeps Next's no-store default on those responses (and only the
//    openresty-side `proxy_ignore_headers Cache-Control` change makes
//    non-200s uncacheable in general).
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
// Exported for the freeze tests in __tests__/proxy.test.ts: the source is
// snapshot-asserted character-for-character so the JS side cannot drift
// from the paired lua gate in limit_req.lua.
export const ANON_POST_PAGE_GATE_RE = /^\/(?:[a-z0-9%.-]+\/)?@[^/]+\/.+/;

/** 5 minutes — must match the edge's `proxy_cache_valid 200 5m`. */
const ANONYMOUS_PAGE_CACHE_CONTROL = 'public, max-age=300';
/** Explicit opt-out for cookie-carrying post-page GETs (gate bypasses too). */
const COOKIED_PAGE_CACHE_CONTROL = 'private, no-store';

/**
 * Request markers of the React Server Components ("flight") family, frozen
 * against Next 16's FLIGHT_HEADERS
 * (next/dist/client/components/app-router-headers.js): `rsc`,
 * `next-router-state-tree`, `next-router-prefetch`,
 * `next-router-segment-prefetch`, `next-hmr-refresh` — plus the `_rsc`
 * cache-busting query parameter. A test asserts set equality with the
 * installed Next's FLIGHT_HEADERS, so a Next upgrade that changes the list
 * fails loudly instead of silently widening cache eligibility. See the
 * "HTML-only" comment block above for why these requests must never carry
 * the overlay (including the Next 16 runtime caveat: the middleware
 * adapter strips these markers before proxy() runs).
 */
export const RSC_FAMILY_REQUEST_HEADERS = [
  'rsc',
  'next-router-state-tree',
  'next-router-prefetch',
  'next-router-segment-prefetch',
  'next-hmr-refresh',
] as const;
const RSC_FAMILY_QUERY_PARAM = '_rsc';

/** True when the request belongs to the RSC/flight family (see above). */
function isRscFamilyRequest(request: NextRequest): boolean {
  // The query check covers flight fetches whose only marker is the
  // cache-buster (?_rsc=<hash>).
  if (request.nextUrl.searchParams.has(RSC_FAMILY_QUERY_PARAM)) return true;
  return RSC_FAMILY_REQUEST_HEADERS.some(
    (header) => request.headers.get(header) !== null
  );
}

/**
 * Pathname of the rewrite target for responses this proxy rewrote, or null
 * for pass-throughs/redirects. Reads the same `x-middleware-rewrite`
 * response header Next's own middleware adapter parses after the middleware
 * returns, so the signal is authoritative at this point in the chain.
 */
function rewriteTargetPathname(response: NextResponse): string | null {
  const rewrite = response.headers.get('x-middleware-rewrite');
  if (rewrite === null) return null;
  try {
    return new URL(rewrite).pathname;
  } catch {
    return null;
  }
}

/**
 * decodeURIComponent for pathnames, falling back to the raw (still-encoded)
 * input when the path holds malformed percent escapes — nginx answers those
 * with a 400 before its cache gate runs, so the fallback can never diverge
 * from any cached copy. Shared by BOTH decode sites: the route resolver's
 * %40 handling and the cache-eligibility overlay's full decode (nginx $uri
 * semantics) — keep the two call sites on this one helper.
 */
function decodePathnameSafe(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

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
  // HTML-only: never overlay RSC-family (flight) requests — they keep
  // Next's default no-store, which nginx refuses to cache (attack chain
  // and Next 16 runtime caveat in the block comment above).
  if (isRscFamilyRequest(request)) return;
  // /404 rewrites (GDPR guard, internal-target guard, unroutable forms)
  // keep Next's default too: nginx honors an explicit upstream
  // Cache-Control on non-200s, so a public 404 would be edge-cached.
  if (rewriteTargetPathname(response) === '/404') return;
  // nginx $uri is decoded; mirror that before testing the gate regex.
  const pathname = decodePathnameSafe(request.nextUrl.pathname);
  if (!ANON_POST_PAGE_GATE_RE.test(pathname)) return;
  // lua: has_cookie = ngx.var.http_cookie ~= nil and ngx.var.http_cookie ~= ""
  const hasCookie = (request.headers.get('cookie') ?? '') !== '';
  response.headers.set(
    'Cache-Control',
    hasCookie ? COOKIED_PAGE_CACHE_CONTROL : ANONYMOUS_PAGE_CACHE_CONTROL
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
  // This handles cases where @ might be encoded in the URL. Only %40 triggers
  // a decode here (a full decode would fold %2F into slashes and change
  // routing); the malformed-escape fallback lives in decodePathnameSafe,
  // shared with the cache-eligibility overlay above.
  if (pathname.includes('%40')) {
    pathname = decodePathnameSafe(pathname);
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

