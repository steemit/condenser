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

/** Plain redirect URL for a pathname, preserving the request's query string. */
function redirectUrl(request: NextRequest, pathname: string): URL {
  return new URL(pathname + request.nextUrl.search, request.url);
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
    return securityRedirect(redirectUrl(request, alias));
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
  if (pathname !== '/' && pathname.endsWith('/')) {
    return securityRedirect(
      redirectUrl(request, pathname.replace(/\/+$/, '') || '/')
    );
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

