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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Follow legacy route matching order:
  // 1. Static routes (already handled by skip logic above)
  // 2. /category/@username/permlink → Post page
  // 3. /@username/feed → User feed (if needed)
  // 4. /@username/<section> → User profile section
  // 5. /@username/<permlink> → Post without category
  // 6. /@username → User profile root

  // Pattern: /category/@username/permlink
  // Rewrite to: /post/category/username/permlink (username without @)
  const postWithCategoryMatch = pathname.match(/^\/([^\/]+)\/@([^\/]+)\/([^\/]+)$/);
  if (postWithCategoryMatch) {
    const [, category, username, permlink] = postWithCategoryMatch;
    // Check if category is not a reserved route
    if (!RESERVED_ROUTES.includes(category.toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = `/post/${category}/${username}/${permlink}`;
      return NextResponse.rewrite(url);
    }
  }

  // Pattern: /@username/feed
  // Handle user feed separately (if needed in future)
  const userFeedMatch = pathname.match(/^\/@([^\/]+)\/feed\/?$/);
  if (userFeedMatch) {
    const [, username] = userFeedMatch;
    if (!RESERVED_ROUTES.includes(username.toLowerCase())) {
      // For now, treat feed as a section
      return NextResponse.next();
    }
  }

  // Pattern: /@username/<section>
  // Pass through to [username]/[section] route
  const userProfileSectionMatch = pathname.match(/^\/@([^\/]+)\/([^\/]+)$/);
  if (userProfileSectionMatch) {
    const [, username, secondSegment] = userProfileSectionMatch;
    // If second segment is a section, let it go to [username]/[section] route
    if (SECTIONS.includes(secondSegment.toLowerCase())) {
      return NextResponse.next();
    }
    // Otherwise, treat as post without category
    const url = request.nextUrl.clone();
    url.pathname = `/post-no-category/${username}/${secondSegment}`;
    return NextResponse.rewrite(url);
  }

  // Pattern: /@username
  // Handle user profile root route
  const userProfileMatch = pathname.match(/^\/@([^\/]+)$/);
  if (userProfileMatch) {
    const [, username] = userProfileMatch;
    // Check if it's not a reserved route
    if (!RESERVED_ROUTES.includes(username.toLowerCase())) {
      // Let it go to [username] route (which will redirect to [username]/blog)
      return NextResponse.next();
    }
  }

  // Unified check: catch paths that look like they should have @ but don't
  // This prevents paths without @ from accidentally matching Next.js dynamic routes
  // Pattern: /category/username/permlink (without @)
  const threeSegmentMatch = pathname.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
  if (threeSegmentMatch) {
    const [, first, second, third] = threeSegmentMatch;
    // If first segment is not reserved and second doesn't start with @, it should be 404
    if (!RESERVED_ROUTES.includes(first.toLowerCase()) && !second.startsWith('@')) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // Pattern: /username/permlink (without @)
  const twoSegmentMatch = pathname.match(/^\/([^\/]+)\/([^\/]+)$/);
  if (twoSegmentMatch) {
    const [, first, second] = twoSegmentMatch;
    // If first is not reserved, not a section, and doesn't start with @, it should be 404
    if (
      !RESERVED_ROUTES.includes(first.toLowerCase()) &&
      !SECTIONS.includes(second.toLowerCase()) &&
      !first.startsWith('@')
    ) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // Pattern: /username (without @)
  const singleSegmentMatch = pathname.match(/^\/([^\/]+)$/);
  if (singleSegmentMatch) {
    const [, segment] = singleSegmentMatch;
    // If segment is not reserved and doesn't start with @, it should be 404
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

