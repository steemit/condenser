/**
 * Test script for Steem API endpoints
 * Run with: pnpm tsx scripts/test-api.ts
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  data?: any;
  duration: number;
}

async function testEndpoint(
  name: string,
  url: string,
  options?: RequestInit
): Promise<TestResult> {
  const startTime = Date.now();
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        name,
        success: false,
        error: `HTTP ${response.status}: ${data.error || response.statusText}`,
        data,
        duration,
      };
    }

    return {
      name,
      success: true,
      data,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      name,
      success: false,
      error: error.message || 'Unknown error',
      duration,
    };
  }
}

async function runTests() {
  console.log('🚀 Starting API Endpoint Tests');
  console.log(`📍 Base URL: ${API_BASE}\n`);

  const results: TestResult[] = [];

  // Test 1: Get Account
  results.push(
    await testEndpoint(
      'Get Account (steemit)',
      `${API_BASE}/api/steem/account?username=steemit`
    )
  );

  // Test 2: Get Ranked Posts (Trending)
  results.push(
    await testEndpoint(
      'Get Ranked Posts (Trending)',
      `${API_BASE}/api/steem/posts?sort=trending&limit=5`
    )
  );

  // Test 3: Get Ranked Posts (Hot)
  results.push(
    await testEndpoint(
      'Get Ranked Posts (Hot)',
      `${API_BASE}/api/steem/posts?sort=hot&limit=5`
    )
  );

  // Test 4: Get Account Posts
  results.push(
    await testEndpoint(
      'Get Account Posts (steemit)',
      `${API_BASE}/api/steem/posts?sort=blog&account=steemit&limit=5`
    )
  );

  // Test 5: Get Post (if we have a known post)
  // First, let's get a post from trending to use for testing
  const trendingResult = results.find((r) => r.name.includes('Trending'));
  if (trendingResult?.success && trendingResult.data?.length > 0) {
    const firstPost = trendingResult.data[0];
    results.push(
      await testEndpoint(
        'Get Single Post',
        `${API_BASE}/api/steem/post?author=${firstPost.author}&permlink=${firstPost.permlink}`
      )
    );

    // Test 6: Get Comments
    results.push(
      await testEndpoint(
        'Get Comments',
        `${API_BASE}/api/steem/comments?author=${firstPost.author}&permlink=${firstPost.permlink}`
      )
    );
  }

  // Test 7: Get Notifications (requires valid account)
  results.push(
    await testEndpoint(
      'Get Notifications (steemit)',
      `${API_BASE}/api/steem/notifications?account=steemit&limit=10`
    )
  );

  // Test 8: Get Unread Notifications
  results.push(
    await testEndpoint(
      'Get Unread Notifications (steemit)',
      `${API_BASE}/api/steem/unread-notifications?account=steemit`
    )
  );

  // Test 9: Check Authority (with invalid credentials - should fail gracefully)
  results.push(
    await testEndpoint(
      'Check Authority (Invalid)',
      `${API_BASE}/api/auth/check-authority`,
      {
        method: 'POST',
        body: JSON.stringify({
          username: 'nonexistent',
          password: 'test',
        }),
      }
    )
  );

  // Print Results
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const status = result.success ? '✅' : '❌';
    const duration = `${result.duration}ms`;
    console.log(
      `\n${status} ${result.name} (${duration})`
    );
    
    if (result.success) {
      passed++;
      if (result.data) {
        if (Array.isArray(result.data)) {
          console.log(`   📦 Returned ${result.data.length} items`);
          if (result.data.length > 0) {
            console.log(`   📝 First item keys: ${Object.keys(result.data[0]).join(', ')}`);
          }
        } else if (typeof result.data === 'object') {
          console.log(`   📦 Returned object with keys: ${Object.keys(result.data).join(', ')}`);
        } else {
          console.log(`   📦 Returned: ${JSON.stringify(result.data).substring(0, 100)}`);
        }
      }
    } else {
      failed++;
      console.log(`   ⚠️  Error: ${result.error}`);
      if (result.data) {
        console.log(`   📦 Response: ${JSON.stringify(result.data).substring(0, 200)}`);
      }
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  console.log('='.repeat(60) + '\n');

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});

