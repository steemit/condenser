/**
 * Steem API Route: Get Followers/Following Lists
 * GET /api/steem/followers?account=username&type=followers&page=0&limit=20
 *
 * `page` is 0-based: condenser_api.get_followers_by_page expects a 0-based
 * page and legacy passes its 0-based currentPage straight through.
 *
 * Param validation (audit N-21 follow-up, mirroring /api/steem/following):
 * `account` and `page` feed the server cache keys in lib/steem/client.ts
 * get{Followers,Following}ByPage() — arbitrary free text or absurd page
 * numbers would spray one Redis key per variant, so the account is
 * normalized (trim + lowercase) and validated against a bounded charset,
 * `page` is clamped to [0, MAX_PAGE] and `limit` to [1, 100], and the whole
 * route sits behind a 60/min/IP rate limit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFollowersByPage, getFollowingByPage } from '@/lib/steem/client';
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
// Generous ceiling (5000 pages x 100/page = 500k entries covers every real
// account) purely to bound the cache-key spray: pages beyond the list return
// [] anyway, and the UI pages sequentially instead of jumping.
const MAX_PAGE = 5000;

// Steem account names: lowercase letters, digits, dashes and (for segmented
// names) dots. Deliberately more lenient than lib/chain-validation.ts
// validateAccountName (no per-segment rules, no bad-actor list): this route
// only READS public follow lists, so the goal here is bounding what reaches
// the cache key and the RPC, not vetting names. 64 chars is a generous cap
// (real names are 3-16) that keeps Redis keys bounded.
const ACCOUNT_PARAM_RE = /^[a-z0-9.-]{1,64}$/;

/** Parse and clamp an integer query param; non-numeric values fall back. */
function clampIntParam(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Normalize a Steem account-name query param: trim + lowercase. Account
 * names are case-insensitive on chain, and lowercasing also collapses
 * ALICE/alice into a single Redis cache key in lib/steem/client.ts
 * get{Followers,Following}ByPage(). Returns null when the value must be
 * rejected (empty or outside the bounded charset).
 */
function normalizeAccountParam(raw: string | null): string | null {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === '') return null;
  return ACCOUNT_PARAM_RE.test(value) ? value : null;
}

export async function GET(request: NextRequest) {
  try {
    // Abuse wrapper (audit N-08): per-IP ceiling first, matching the order
    // of the other rate-limited routes (search/broadcast/overseer/auth).
    const rateLimit = await checkRateLimit(request, RATE_LIMITS.steemFollowers);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const searchParams = request.nextUrl.searchParams;
    const account = normalizeAccountParam(searchParams.get('account'));
    const type = searchParams.get('type') || 'followers'; // 'followers' or 'following'
    const page = clampIntParam(
      searchParams.get('page'),
      0,
      0,
      MAX_PAGE
    );
    const limit = clampIntParam(
      searchParams.get('limit'),
      DEFAULT_LIMIT,
      1,
      MAX_LIMIT
    );

    if (!account) {
      return NextResponse.json(
        {
          error: searchParams.get('account')?.trim()
            ? 'Invalid account name'
            : 'Account is required',
        },
        { status: 400 }
      );
    }

    if (!['followers', 'following'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "followers" or "following"' },
        { status: 400 }
      );
    }

    let result;
    if (type === 'followers') {
      result = await getFollowersByPage({ account, page, limit });
    } else {
      result = await getFollowingByPage({ account, page, limit });
    }

    return NextResponse.json(result || []);
  } catch (error: unknown) {
    console.error('Error fetching followers/following:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch followers/following' },
      { status: 500 }
    );
  }
}
