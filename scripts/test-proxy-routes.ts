#!/usr/bin/env tsx

/**
 * Test script for proxy route patterns
 * Validates that routes match legacy behavior from ResolveRoute.js
 */

import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

// Mock NextRequest for testing
function createMockRequest(pathname: string): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  return new NextRequest(url);
}

// Test cases based on legacy route patterns
const testCases = [
  // Static routes (should pass through)
  { path: '/trending', expected: 'next', description: 'Static route: trending' },
  { path: '/login', expected: 'next', description: 'Static route: login' },
  { path: '/api/test', expected: 'next', description: 'API route' },
  { path: '/_next/static/test.js', expected: 'next', description: 'Static file' },
  
  // Category + user + permlink patterns
  { path: '/bitcoin/@alice/my-post', expected: 'rewrite:/post/bitcoin/alice/my-post', description: 'Category post' },
  { path: '/trending/@bob/another-post', expected: 'next', description: 'Reserved category (trending)' },
  
  // User profile patterns
  { path: '/@alice', expected: 'rewrite:/user/alice', description: 'User profile root' },
  { path: '/@alice/blog', expected: 'rewrite:/user/alice/blog', description: 'User profile section' },
  { path: '/@alice/feed', expected: 'rewrite:/user/alice/feed', description: 'User feed' },
  { path: '/@alice/followers', expected: 'rewrite:/user/alice/followers', description: 'User followers' },
  
  // Post without category patterns
  { path: '/@alice/my-post', expected: 'rewrite:/post-no-category/alice/my-post', description: 'Post without category' },
  
  // Invalid patterns (should return 404)
  { path: '/bitcoin/alice/my-post', expected: '404', description: 'Missing @ in username' },
  { path: '/alice/my-post', expected: '404', description: 'No @ prefix for user' },
  { path: '/alice', expected: '404', description: 'Single segment without @' },
  
  // Reserved routes as usernames (should be 404)
  { path: '/@trending', expected: '404', description: 'Reserved route as username' },
  { path: '/@login', expected: '404', description: 'Reserved route as username' },
  
  // Community routes
  { path: '/roles/hive-123456', expected: 'next', description: 'Community roles page' },
  { path: '/hot', expected: 'next', description: 'Hot posts page' },
  { path: '/created', expected: 'next', description: 'Created posts page' },
  { path: '/trending/hive-123456', expected: 'next', description: 'Community trending posts' },
  { path: '/hot/bitcoin', expected: 'next', description: 'Hot posts in bitcoin tag' },
  { path: '/created/photography', expected: 'next', description: 'Created posts in photography tag' },
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
          const rewritePath = new URL(rewriteHeader).pathname;
          if (rewritePath === '/404') {
            actual = '404';
          } else {
            actual = `rewrite:${rewritePath}`;
          }
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
