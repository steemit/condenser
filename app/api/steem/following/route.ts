/**
 * Steem API Route: Get Following List (legacy getFollowingAsync shape)
 * GET /api/steem/following?account=username&type=blog&start=
 *
 * Unlike /api/steem/followers (page-based, bridge get_following_by_page,
 * limit <= 100), this wraps condenser_api.get_following semantics: a
 * start-account cursor and follow-kind filter ('blog' | 'ignore') with
 * legacy's 1000-entry pages. It exists so the client can page through a
 * user's full following/ignoring sets exactly like legacy FollowSaga
 * (loadFollowsLoop) did when seeding the follow state at login.
 *
 * Param validation (audit N-21 follow-up): `account` and `start` feed both
 * the server cache keys in lib/steem/client.ts getFollowing() and the
 * upstream RPC — arbitrary free text would spray one ~100KB Redis key per
 * `start` variant and never hit the stale fallback, so both params are
 * normalized (trim + lowercase) and validated against a bounded charset.
 * `type` is whitelisted. There is no `limit` param: the page size is fixed
 * at 1000 (legacy loadFollowsLoop, FollowSaga.js) — the sole caller always
 * pages with 1000, and an open limit would multiply the cache keys; a
 * client-sent limit is ignored for backward compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFollowing } from '@/lib/steem/client';
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';

const FOLLOW_KINDS = ['blog', 'ignore'] as const;

// Steem account names: lowercase letters, digits, dashes and (for segmented
// names) dots. Deliberately more lenient than lib/chain-validation.ts
// validateAccountName (no per-segment rules, no bad-actor list): this route
// only READS public follow lists, so the goal here is bounding what reaches
// the cache key and the RPC, not vetting names. 64 chars is a generous cap
// (real names are 3-16) that keeps Redis keys bounded.
const ACCOUNT_PARAM_RE = /^[a-z0-9.-]{1,64}$/;

/**
 * Normalize a Steem account-name query param: trim + lowercase. Account
 * names are case-insensitive on chain, and lowercasing also collapses
 * ALICE/alice into a single Redis cache key in lib/steem/client.ts
 * getFollowing(). Returns '' for empty input (valid only as the start
 * cursor — the list beginning) and null when the value must be rejected.
 */
function normalizeAccountParam(raw: string | null): string | null {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === '') return '';
  return ACCOUNT_PARAM_RE.test(value) ? value : null;
}

export async function GET(request: NextRequest) {
  try {
    // Abuse wrapper (audit N-08): per-IP ceiling first, matching the order
    // of the other rate-limited routes (search/broadcast/overseer/auth).
    const rateLimit = await checkRateLimit(request, RATE_LIMITS.steemFollowing);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const searchParams = request.nextUrl.searchParams;
    const account = normalizeAccountParam(searchParams.get('account'));
    const type = searchParams.get('type') || 'blog';
    // Start-account cursor ('' = beginning of the list), same shape as
    // account but may be empty.
    const start = normalizeAccountParam(searchParams.get('start'));

    // No limit param — fixed 1000-entry pages (see module comment).

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

    if (start === null) {
      return NextResponse.json(
        { error: 'Invalid start account' },
        { status: 400 }
      );
    }

    if (!FOLLOW_KINDS.includes(type as (typeof FOLLOW_KINDS)[number])) {
      return NextResponse.json(
        { error: 'Type must be "blog" or "ignore"' },
        { status: 400 }
      );
    }

    const result = await getFollowing(account, start, type);

    return NextResponse.json(result || []);
  } catch (error: unknown) {
    console.error('Error fetching following list:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch following list' },
      { status: 500 }
    );
  }
}
