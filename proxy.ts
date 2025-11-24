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

  // Pattern: /category/@username/permlink or /category/username/permlink
  // Rewrite to: /post/category/username/permlink
  const postWithCategoryMatch = pathname.match(/^\/([^\/]+)\/@?([^\/]+)\/([^\/]+)$/);
  if (postWithCategoryMatch) {
    const [, category, usernameRaw, permlink] = postWithCategoryMatch;
    // Remove @ prefix from username if present
    const username = usernameRaw.startsWith('@') ? usernameRaw.slice(1) : usernameRaw;
    // Check if category is not a reserved route
    const reservedRoutes = [
      'trending', 'hot', 'created', 'payout', 'payout_comments', 'muted',
      'login', 'search', 'submit', 'about', 'faq', 'privacy', 'support', 'tos',
      'communities', 'tags', 'rewards', 'roles', 'welcome', 'api', '_next'
    ];
    
    if (!reservedRoutes.includes(category.toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = `/post/${category}/${username}/${permlink}`;
      return NextResponse.rewrite(url);
    }
  }

  // Pattern: /@username/permlink or /username/permlink
  // Rewrite to: /post-no-category/username/permlink
  // But first check if it's a section (blog, posts, etc.)
  const sections = ['blog', 'posts', 'comments', 'replies', 'payout', 'feed',
    'followers', 'followed', 'settings', 'notifications', 'communities'];
  
  const postNoCategoryMatch = pathname.match(/^\/@?([^\/]+)\/([^\/]+)$/);
  if (postNoCategoryMatch) {
    const [, usernameRaw, secondSegment] = postNoCategoryMatch;
    // Remove @ prefix from username if present
    const username = usernameRaw.startsWith('@') ? usernameRaw.slice(1) : usernameRaw;
    // If second segment is a section, let it go to [username]/[section] route
    if (sections.includes(secondSegment.toLowerCase())) {
      return NextResponse.next();
    }
    // Otherwise, treat as post without category
    const url = request.nextUrl.clone();
    url.pathname = `/post-no-category/${username}/${secondSegment}`;
    return NextResponse.rewrite(url);
  }

  // Pattern: /@username or /username
  // Handle user profile root route
  const userProfileMatch = pathname.match(/^\/@?([^\/]+)$/);
  if (userProfileMatch) {
    const [, usernameRaw] = userProfileMatch;
    // Remove @ prefix from username if present
    const username = usernameRaw.startsWith('@') ? usernameRaw.slice(1) : usernameRaw;
    // Check if it's not a reserved route
    const reservedRoutes = [
      'trending', 'hot', 'created', 'payout', 'payout_comments', 'muted',
      'login', 'search', 'submit', 'about', 'faq', 'privacy', 'support', 'tos',
      'communities', 'tags', 'rewards', 'roles', 'welcome', 'api', '_next'
    ];
    
    if (!reservedRoutes.includes(username.toLowerCase())) {
      // Let it go to [username] route (which will redirect to [username]/blog)
      return NextResponse.next();
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

