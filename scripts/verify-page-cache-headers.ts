#!/usr/bin/env tsx

/**
 * CD-06 runtime verification matrix: the app must serve NO public
 * (edge-cacheable) Cache-Control on page responses, and nonexistent posts
 * must be real 404s.
 *
 * The app deliberately stamps no variant-aware Cache-Control (audit CD-06):
 * a middleware-level stamp can never see render-time statuses (404s from
 * notFound(), the RSC 307), and Next 16's middleware adapter strips the
 * flight markers before proxy() runs. Edge storage eligibility is owned by
 * the openresty sidecar (openresty #23: RSC-family bypass,
 * proxy_ignore_headers Cache-Control, 200-only storage). This script pins
 * the app side of that contract against a RUNNING server.
 *
 * Usage (expects a production server, not `next dev` — the dev server
 * unconditionally overrides Cache-Control):
 *
 *   pnpm build && pnpm start   # or PORT=8080 node .next/standalone/server.js
 *   BASE_URL=http://127.0.0.1:8080 pnpm verify:cache-headers
 *
 * Environment:
 *   BASE_URL       base URL of the running server (default http://127.0.0.1:8080)
 *   REAL_POST_PATH a post path that exists on the target STEEM_API_URL
 *                  (default: a steemitblog post on the dev API)
 *
 * Exits non-zero when any case violates the matrix.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:8080';
const REAL_POST_PATH =
  process.env.REAL_POST_PATH ??
  '/steem/@steemitblog/steemit-update-december-29th-2025-community-curators-for-january';
// A permlink that cannot exist; deterministic so the matrix is reproducible.
const MISSING_PERMLINK = 'cd-06-nonexistent-post-3f9a2c';

interface MatrixCase {
  name: string;
  path: string;
  init?: RequestInit;
  /** Exact expected status, or 'any' when the matrix only constrains headers. */
  expectStatus: number | 'any';
}

const matrix: MatrixCase[] = [
  {
    name: 'real post, anonymous GET',
    path: REAL_POST_PATH,
    expectStatus: 200,
  },
  {
    name: 'nonexistent post with category',
    path: `/steem/@alice/${MISSING_PERMLINK}`,
    expectStatus: 404,
  },
  {
    name: 'nonexistent post without category',
    path: `/@alice/${MISSING_PERMLINK}`,
    expectStatus: 404,
  },
  {
    name: 'real post, RSC: 1 (no _rsc hash → render-time 307 or 200)',
    path: REAL_POST_PATH,
    init: { headers: { RSC: '1' } },
    expectStatus: 'any',
  },
  {
    name: 'real post, cookie-carrying GET',
    path: REAL_POST_PATH,
    init: { headers: { cookie: 'steem-session=probe' } },
    expectStatus: 200,
  },
];

/** A Cache-Control value is "public" (cacheable by shared caches) if it says so. */
function isPubliclyCacheable(cacheControl: string | null): boolean {
  return (cacheControl ?? '').toLowerCase().includes('public');
}

async function runCase(test: MatrixCase): Promise<string[]> {
  const failures: string[] = [];
  // redirect: 'manual' so a render-time 307 (the RSC hash-validation
  // redirect) is observed instead of transparently followed.
  const response = await fetch(`${BASE_URL}${test.path}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
    ...test.init,
  });
  // Drain the body so the socket is released.
  await response.arrayBuffer();

  const cacheControl = response.headers.get('Cache-Control');
  const statusLine = `${response.status}  Cache-Control: ${cacheControl ?? '<none>'}`;
  console.log(`  ${test.name}\n    GET ${test.path}\n    → ${statusLine}`);

  if (test.expectStatus !== 'any' && response.status !== test.expectStatus) {
    failures.push(
      `expected status ${test.expectStatus}, got ${response.status}`
    );
  }
  if (response.status >= 500) {
    failures.push(`unexpected server error ${response.status}`);
  }
  if (isPubliclyCacheable(cacheControl)) {
    failures.push(
      `Cache-Control is publicly cacheable: ${cacheControl!}`
    );
  }
  return failures;
}

async function main(): Promise<number> {
  console.log(`CD-06 cache-header verification against ${BASE_URL}\n`);
  let failed = 0;
  for (const test of matrix) {
    let failures: string[];
    try {
      failures = await runCase(test);
    } catch (error) {
      failures = [`request failed: ${String(error)}`];
    }
    if (failures.length > 0) {
      failed++;
      console.log(`    ✗ ${failures.join('; ')}\n`);
    } else {
      console.log('    ✓ ok\n');
    }
  }
  if (failed > 0) {
    console.log(`FAILED: ${failed}/${matrix.length} cases violated the matrix`);
    return 1;
  }
  console.log(`OK: all ${matrix.length} cases conform (no public Cache-Control; real 404s)`);
  return 0;
}

void main().then((code) => {
  process.exitCode = code;
});
