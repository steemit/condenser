/**
 * Steem API Route: overseer relay
 * POST /api/steem/overseer
 *
 * Legacy condenser called `overseer.collect` directly from the browser via
 * steem-js. Since steem-js is server-only in the rewrite, the client-side
 * analytics helpers (lib/analytics/overseer.ts) POST the collect payload
 * here and this route forwards it to the node. Analytics is best-effort:
 * relay failures are logged and always answered 204 so the client UI is
 * never affected.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callSteemApi } from '@/lib/steem/client';
import { readJsonWithLimit } from '@/lib/api/body-limit';
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';

export async function POST(request: NextRequest) {
  // Abuse wrappers (audit N-08): rate limit before reading the body, then
  // the body size cap. Higher ceiling than other endpoints (analytics fire
  // on every navigation) but still bounded.
  const rateLimit = await checkRateLimit(request, RATE_LIMITS.steemOverseer);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const limited = await readJsonWithLimit(request).catch(() => null);
  if (limited && !limited.ok) {
    return limited.response;
  }

  try {
    // A malformed (unparseable) payload is dropped like a relay failure:
    // analytics is best-effort and never answered with an error.
    if (limited?.ok) {
      await callSteemApi('overseer.collect', limited.data);
    }
  } catch (error) {
    console.warn('overseer relay error:', error);
  }
  return new NextResponse(null, { status: 204 });
}
