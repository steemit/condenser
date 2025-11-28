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

// Reserved routes that should not be treated as categories
const RESERVED_ROUTES = [
  'trending', 'hot', 'created', 'payout', 'payout_comments', 'muted',
  'login', 'search', 'submit', 'about', 'faq', 'privacy', 'support', 'tos',
  'communities', 'tags', 'rewards', 'roles', 'welcome', 'api', '_next'
];

// User profile sections
const SECTIONS = [
  'blog', 'posts', 'comments', 'replies', 'payout', 'feed',
  'followers', 'followed', 'settings', 'notifications', 'communities'
];

// Sort types for category filters (from legacy CategoryFilters regex)
const SORT_TYPES = [
  'hot', 'trending', 'promoted', 'payout', 'payout_comments', 'muted', 'created'
];

export function proxy(request: NextRequest) {
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

  // Skip API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
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
    return NextResponse.next();
  }

  // 2. Pattern: /category/@username/permlink → Post page
  const postWithCategoryMatch = pathname.match(/^\/([^\/]+)\/@([^\/]+)\/([^\/]+)$/);
  if (postWithCategoryMatch) {
    const [, category, username, permlink] = postWithCategoryMatch;
    if (!RESERVED_ROUTES.includes(category.toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = `/post/${category}/${username}/${permlink}`;
      return NextResponse.rewrite(url);
    }
  }

  // 3. Pattern: /@username/feed → User feed
  const userFeedMatch = pathname.match(/^\/@([^\/]+)\/feed\/?$/);
  if (userFeedMatch) {
    const [, username] = userFeedMatch;
    if (!RESERVED_ROUTES.includes(username.toLowerCase())) {
      // Rewrite to user/[username]/[section] route (feed is a section)
      const url = request.nextUrl.clone();
      url.pathname = `/user/${username}/feed`;
      return NextResponse.rewrite(url);
    }
  }

  // 4. Pattern: /@username/<section> → User profile section
  const userSectionMatch = pathname.match(/^\/@([^\/]+)\/([^\/]+)$/);
  if (userSectionMatch) {
    const [, username, section] = userSectionMatch;
    if (!RESERVED_ROUTES.includes(username.toLowerCase()) && 
        SECTIONS.includes(section.toLowerCase())) {
      // Rewrite to user/[username]/[section] route
      const url = request.nextUrl.clone();
      url.pathname = `/user/${username}/${section}`;
      return NextResponse.rewrite(url);
    }
  }

  // 5. Pattern: /@username/<permlink> → Post without category
  const postNoCategoryMatch = pathname.match(/^\/@([^\/]+)\/([^\/]+)$/);
  if (postNoCategoryMatch) {
    const [, username, permlink] = postNoCategoryMatch;
    if (!RESERVED_ROUTES.includes(username.toLowerCase()) && 
        !SECTIONS.includes(permlink.toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = `/post-no-category/${username}/${permlink}`;
      return NextResponse.rewrite(url);
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
      return NextResponse.rewrite(url);
    }
    // Reserved route used as username - should be 404
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // 7. Pattern: /[sort]/[tag] → Category filters (including communities)
  // Examples: /trending/hive-123456, /hot/bitcoin, /created/photography
  const categoryFiltersMatch = pathname.match(/^\/([^\/]+)\/([^\/]+)$/);
  if (categoryFiltersMatch) {
    const [, sort, tag] = categoryFiltersMatch;
    if (SORT_TYPES.includes(sort.toLowerCase()) && !tag.startsWith('@')) {
      // Pass through to [sort]/[tag] route
      return NextResponse.next();
    }
  }

  // Pattern: /[sort] → Category filters without tag
  // Examples: /trending, /hot, /created
  const sortOnlyMatch = pathname.match(/^\/([^\/]+)$/);
  if (sortOnlyMatch) {
    const [, sort] = sortOnlyMatch;
    if (SORT_TYPES.includes(sort.toLowerCase())) {
      // Pass through to [sort] route
      return NextResponse.next();
    }
  }

  // Catch invalid patterns that should be 404 (following legacy behavior)
  
  // Pattern: /category/username/permlink (missing @)
  const invalidThreeSegment = pathname.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
  if (invalidThreeSegment) {
    const [, first, second] = invalidThreeSegment;
    if (!RESERVED_ROUTES.includes(first.toLowerCase()) && !second.startsWith('@')) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // Pattern: /username/something (missing @)  
  const invalidTwoSegment = pathname.match(/^\/([^\/]+)\/([^\/]+)$/);
  if (invalidTwoSegment) {
    const [, first] = invalidTwoSegment;
    if (!RESERVED_ROUTES.includes(first.toLowerCase()) && !first.startsWith('@')) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // Pattern: /username (missing @)
  const invalidSingleSegment = pathname.match(/^\/([^\/]+)$/);
  if (invalidSingleSegment) {
    const [, segment] = invalidSingleSegment;
    if (!RESERVED_ROUTES.includes(segment.toLowerCase()) && !segment.startsWith('@')) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
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

