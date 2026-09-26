#!/usr/bin/env tsx

/**
 * Test script for proxy route patterns
 * Validates that routes match legacy behavior from ResolveRoute.js
 */

import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

// Mock NextRequest for testing. The path may include a query string.
function createMockRequest(pathname: string): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  return new NextRequest(url);
}

// Test cases based on legacy route patterns
const testCases = [
  // Static routes (should pass through)
  { path: '/trending', expected: 'next', description: 'Static route: trending' },
  { path: '/login', expected: 'next', description: 'Static route: login' },
  { path: '/search', expected: 'next', description: 'Static route: search' },
  { path: '/submit', expected: 'next', description: 'Static route: submit' },
  { path: '/communities', expected: 'next', description: 'Static route: communities' },
  { path: '/api/test', expected: 'next', description: 'API route' },
  { path: '/_next/static/test.js', expected: 'next', description: 'Static file' },
  { path: '/static/logo.png', expected: 'next', description: 'Path under /static/' },
  { path: '/404', expected: 'next', description: 'Explicit 404 page is skipped by proxy' },
  { path: '/about.html', expected: 'next', description: 'Path ending in a known static extension (.html) is skipped by proxy (the router [sort] route then renders the in-shell not-found view with a 200 — see docs/ROUTE_MAP.md, pre-existing)' },
  { path: '/welcome', expected: 'next', description: 'Welcome page (reserved, pass-through to app/(main)/welcome)' },
  { path: '/faq', expected: 'next', description: 'FAQ page (reserved, pass-through to app/(main)/faq)' },
  { path: '/privacy', expected: 'next', description: 'Privacy page (reserved, pass-through to app/(main)/privacy)' },
  { path: '/tos', expected: 'next', description: 'Terms of Service page (reserved, pass-through to app/(main)/tos)' },
  
  // Category + user + permlink patterns
  // Legacy ResolveRoute.js Post regex (<tag>/<account>/<permlink>, tag =
  // [\w.-]{1,32}) has NO reserved-word check, and legacy static checks are
  // exact-path (path === '/tags'), so reserved/sort words as the category
  // still resolve to the Post page.
  { path: '/bitcoin/@alice/my-post', expected: 'rewrite:/post/bitcoin/alice/my-post', description: 'Category post (non-reserved control)' },
  { path: '/trending/@bob/another-post', expected: 'rewrite:/post/trending/bob/another-post', description: 'Reserved word "trending" as category still renders Post (legacy parity)' },
  { path: '/Trending/@bob/another-post', expected: 'rewrite:/post/Trending/bob/another-post', description: 'Reserved category: rewrite keeps original casing' },
  { path: '/about/@alice/my-post', expected: 'rewrite:/post/about/alice/my-post', description: 'Reserved category "about" renders Post (legacy parity)' },
  { path: '/welcome/@alice/my-post', expected: 'rewrite:/post/welcome/alice/my-post', description: 'Reserved category "welcome" renders Post (legacy parity)' },
  { path: '/hot/@alice/my-post', expected: 'rewrite:/post/hot/alice/my-post', description: 'Sort word "hot" as category renders Post (legacy parity)' },
  { path: '/faq/@alice/my-post', expected: 'rewrite:/post/faq/alice/my-post', description: 'Reserved category "faq" renders Post (legacy parity)' },
  { path: '/tags/@alice/my-post', expected: 'rewrite:/post/tags/alice/my-post', description: '"tags" as category renders Post (legacy /tags is exact-path only)' },
  { path: '/promoted/@alice/my-post', expected: 'rewrite:/post/promoted/alice/my-post', description: 'Sort word "promoted" (not in RESERVED_ROUTES) as category renders Post' },
  { path: '/about/@alice/my-post/', expected: 'redirect:308:/about/@alice/my-post', description: 'Post URL with trailing slash: branch-2 regex ([^/]+) does not match; the proxy issues the 308 itself (with security headers) and the slash-less form re-enters the proxy → Post' },

  // User profile patterns
  { path: '/@alice', expected: 'rewrite:/user/alice', description: 'User profile root' },
  { path: '/@alice/blog', expected: 'rewrite:/user/alice/blog', description: 'User profile section' },
  { path: '/@alice/settings', expected: 'rewrite:/user/alice/settings', description: 'User settings section' },
  { path: '/@alice/communities', expected: 'rewrite:/user/alice/communities', description: 'User communities section' },
  { path: '/@alice/feed', expected: 'rewrite:/user/alice/feed', description: 'User feed' },
  { path: '/@alice/followers', expected: 'rewrite:/user/alice/followers', description: 'User followers' },
  
  // Post without category patterns
  { path: '/@alice/my-post', expected: 'rewrite:/post-no-category/alice/my-post', description: 'Post without category' },
  
  // URL-encoded @ (%40) handling
  { path: '/%40alice', expected: 'rewrite:/user/alice', description: 'Encoded %40 decodes to @ (profile root)' },
  { path: '/%40alice/my-post', expected: 'rewrite:/post-no-category/alice/my-post', description: 'Encoded %40 decodes to @ (post)' },
  { path: '/about/%40alice/my-post', expected: 'rewrite:/post/about/alice/my-post', description: 'Encoded %40 decodes to @ (post with category)' },

  // Query strings survive rewrites (nextUrl.clone() keeps search params)
  { path: '/steem/@alice/my-post?ref=share', expected: 'rewrite:/post/steem/alice/my-post?ref=share', description: 'Query string is preserved through a Post rewrite' },

  // Invalid patterns (should return 404)
  { path: '/bitcoin/alice/my-post', expected: '404', description: 'Missing @ in username' },
  { path: '/foo/bar/baz', expected: '404', description: 'Three segments without @ and no reserved word' },
  { path: '/alice/my-post', expected: '404', description: 'No @ prefix for user' },
  { path: '/alice', expected: '404', description: 'Single segment without @' },

  // Internal rewrite targets are not addressable (legacy parity: legacy had
  // no /post, /post-no-category or /user routes — ResolveRoute.js matches at
  // most three segments with an @-account, so these were all NotFound).
  { path: '/post/a/b/c', expected: '404', description: 'Direct access to /post internal target 404s (legacy: 4-segment path has no route)' },
  { path: '/user/alice', expected: '404', description: 'Direct access to /user internal target 404s' },
  { path: '/user/alice/blog', expected: '404', description: 'Direct access to /user section target 404s' },
  { path: '/post-no-category/a/b', expected: '404', description: 'Direct access to /post-no-category internal target 404s' },
  { path: '/post', expected: '404', description: 'Bare /post prefix 404s' },
  { path: '/post/@alice/my-post', expected: 'rewrite:/post/post/alice/my-post', description: '"post" as category still renders Post (branch 2 consumes it before the internal-target guard)' },
  { path: '/post/@alice/my-post/', expected: 'redirect:308:/post/@alice/my-post', description: 'Trailing-slash post URL under /post passes the guard (exact @-exemption) → proxy-issued 308 normalization re-enters branch 2' },
  { path: '/user/@alice/blog', expected: 'rewrite:/post/user/alice/blog', description: '"user" as category renders Post — branch 2 consumes /user/@alice/blog before the guard (legacy Post regex parity: any [\\w.-]{1,32} tag is a category, so legacy also served this as Post, not UserProfile)' },
  { path: '/user/@alice/feed', expected: 'rewrite:/post/user/alice/feed', description: '"user" as category renders Post — branch 2 consumes /user/@alice/feed before the guard (legacy parity)' },
  { path: '/user/@alice/my-post/', expected: 'redirect:308:/user/@alice/my-post', description: 'Trailing-slash post URL under /user passes the guard (exact @-exemption) → proxy-issued 308 normalization re-enters branch 2' },
  { path: '/post/a/@bob/my-post', expected: '404', description: 'Four-segment @-form under /post 404s — legacy has no 4-segment route; the old broad /@ exemption let it render /post/[category]/[username]/[permlink] with a 200' },
  { path: '/user/@alice/blog/extra', expected: '404', description: 'Four-segment @-form under /user 404s (legacy has no 4-segment route)' },
  { path: '/user/@alice', expected: '404', description: 'Two-segment @-form under /user 404s — legacy UserProfile/UserFeed require a first-segment @account; the old broad /@ exemption let it render /user/[username] with a 200' },
  
  // Reserved routes as usernames (should be 404)
  { path: '/@trending', expected: '404', description: 'Reserved route as username' },
  { path: '/@login', expected: '404', description: 'Reserved route as username' },
  { path: '/@trending/blog', expected: 'next', description: 'Reserved username + section falls through proxy (renders 404 via not-found)' },
  
  // Community routes
  { path: '/roles/hive-123456', expected: 'next', description: 'Community roles page' },
  { path: '/roles/@alice/my-post', expected: 'rewrite:/post/roles/alice/my-post', description: '"roles" as category renders Post (the preceding /roles/<tag> branch is two-segment only)' },

  // GDPR-listed accounts (legacy GDPRUserList → NotFound on all four route families)
  { path: '/@thedarkoverlord', expected: '404', description: 'GDPR user: profile root' },
  { path: '/@thedarkoverlord/blog', expected: '404', description: 'GDPR user: profile section' },
  { path: '/@thedarkoverlord/feed', expected: '404', description: 'GDPR user: feed' },
  { path: '/@thedarkoverlord/my-post', expected: '404', description: 'GDPR user: post without category' },
  { path: '/steem/@thedarkoverlord/my-post', expected: '404', description: 'GDPR user: post with category' },
  { path: '/@TheDarkOverlord', expected: '404', description: 'GDPR user: match is case-insensitive' },
  { path: '/@xondra/settings', expected: '404', description: 'GDPR user: settings section' },
  { path: '/@mateja.klaric', expected: '404', description: 'GDPR user with dot: caught by the GDPR guard directly' },
  { path: '/@ety001.test01', expected: 'rewrite:/user/ety001.test01', description: 'Dotted non-GDPR username routes to profile' },
  { path: '/@alice/post-v1.2', expected: 'rewrite:/post-no-category/alice/post-v1.2', description: 'Dotted permlink routes to post page' },
  { path: '/file.svg', expected: 'next', description: 'Static public file passes through' },
  { path: '/help/welcome.md', expected: 'next', description: 'Help markdown in public/ passes through (.md asset extension)' },
  { path: '/@alice', expected: 'rewrite:/user/alice', description: 'Non-GDPR user unaffected' },
  { path: '/steem/@alice/my-post', expected: 'rewrite:/post/steem/alice/my-post', description: 'Non-GDPR user post unaffected' },
  
  // Sort feeds (pass through to [sort] / [sort]/[tag] routes)
  { path: '/hot', expected: 'next', description: 'Hot posts page' },
  { path: '/created', expected: 'next', description: 'Created posts page' },
  { path: '/promoted', expected: 'next', description: 'Promoted posts page (sort type, not in RESERVED_ROUTES)' },
  { path: '/payout', expected: 'next', description: 'Payout posts page' },
  { path: '/payout_comments', expected: 'next', description: 'Payout comments page' },
  { path: '/muted', expected: 'next', description: 'Muted posts page' },
  { path: '/trending/hive-123456', expected: 'next', description: 'Community trending posts' },
  { path: '/hot/bitcoin', expected: 'next', description: 'Hot posts in bitcoin tag' },
  { path: '/created/photography', expected: 'next', description: 'Created posts in photography tag' },

  // Legacy .html aliases — proxy-issued 308 redirects (moved from next.config
  // redirects() so the security headers apply; must win over the .html
  // static-asset skip)
  { path: '/login.html', expected: 'redirect:308:/login', description: 'Legacy /login.html alias 308-redirects to /login' },
  { path: '/faq.html', expected: 'redirect:308:/faq', description: 'Legacy /faq.html alias 308-redirects to /faq' },
  { path: '/privacy.html', expected: 'redirect:308:/privacy', description: 'Legacy /privacy.html alias 308-redirects to /privacy' },
  { path: '/tos.html', expected: 'redirect:308:/tos', description: 'Legacy /tos.html alias 308-redirects to /tos' },

  // Trailing-slash normalization issued by the proxy (with security headers)
  { path: '/trending/', expected: 'redirect:308:/trending', description: 'Trailing slash on a sort feed 308-redirects to the slash-less form' },
  { path: '/@alice/', expected: 'redirect:308:/@alice', description: 'Trailing slash on a profile root 308-redirects to the slash-less form' },
  { path: '/hot/?foo=bar', expected: 'redirect:308:/hot?foo=bar', description: 'Trailing-slash redirect preserves the query string' },
  { path: '/@alice/feed/', expected: 'rewrite:/user/alice/feed/', description: 'User feed with trailing slash still rewrites directly (branch 3 handles the slash itself — no extra hop)' },

  // Open-redirect hardening of the trailing-slash 308: WHATWG URL parses a
  // pathname like `//evil.example/x/` as a protocol-relative URL, so feeding
  // it to new URL(pathname, base) would emit a cross-origin Location
  // (http://evil.example/x). redirectUrl() rejects anything that escapes the
  // request origin → unroutable (404 rewrite). The `/\evil…` form is the same
  // vector one layer down (backslash is a path separator under http(s); the
  // URL constructor already normalizes it to the `//` form before NextRequest
  // sees it) — both must never produce a cross-origin Location.
  { path: '//evil.example/x/', expected: '404', description: 'Protocol-relative pathname with trailing slash is unroutable (no cross-origin 308)' },
  { path: '/\\evil.example/x/', expected: '404', description: 'Backslash-separated hostname with trailing slash is unroutable (no cross-origin 308)' },
];

async function runTests() {
  console.log('🧪 Testing Proxy Route Patterns\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      const request = createMockRequest(testCase.path);
      const response = proxy(request);
      
      let actual: string;
      
      if (!response) {
        actual = 'next';
      } else {
        // Check if it's a rewrite response
        const rewriteHeader = response.headers.get('x-middleware-rewrite');
        if (rewriteHeader) {
          const rewriteUrl = new URL(rewriteHeader);
          if (rewriteUrl.pathname === '/404') {
            actual = '404';
          } else {
            // Compare pathname + search so query-string preservation is
            // asserted for rewrite cases instead of silently dropped.
            actual = `rewrite:${rewriteUrl.pathname}${rewriteUrl.search}`;
          }
        } else if (response.headers.get('location')) {
          // A redirect the proxy issues itself (security headers + CSP ride
          // along; asserted in __tests__/proxy.test.ts).
          const redirectUrl = new URL(response.headers.get('location')!);
          actual = `redirect:${response.status}:${redirectUrl.pathname}${redirectUrl.search}`;
        } else if (response.url.includes('/404')) {
          actual = '404';
        } else {
          actual = 'next';
        }
      }
      
      const success = actual === testCase.expected;
      
      if (success) {
        console.log(`✅ ${testCase.description}`);
        console.log(`   ${testCase.path} → ${actual}\n`);
        passed++;
      } else {
        console.log(`❌ ${testCase.description}`);
        console.log(`   ${testCase.path}`);
        console.log(`   Expected: ${testCase.expected}`);
        console.log(`   Actual: ${actual}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`💥 ${testCase.description}`);
      console.log(`   ${testCase.path}`);
      console.log(`   Error: ${error}\n`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests, testCases };
