/**
 * Steem API Route: Get Following List (legacy getFollowingAsync shape)
 * GET /api/steem/following?account=username&type=blog&start=&limit=1000
 *
 * Unlike /api/steem/followers (page-based, bridge get_following_by_page,
 * limit <= 100), this wraps condenser_api.get_following semantics: a
 * start-account cursor and follow-kind filter ('blog' | 'ignore') with
 * legacy's 1000-entry pages. It exists so the client can page through a
 * user's full following/ignoring sets exactly like legacy FollowSaga
 * (loadFollowsLoop) did when seeding the follow state at login.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFollowing } from '@/lib/steem/client';

// Param bounds (audit N-21): these values feed the server cache keys in
// lib/steem/client.ts getFollowing(), so clamp them here. 1000 is legacy's
// loadFollowsLoop page size (FollowSaga.js).
const MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 1000;
const FOLLOW_KINDS = ['blog', 'ignore'] as const;

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');
    const type = searchParams.get('type') || 'blog';
    // Start-account cursor ('' = beginning of the list).
    const start = searchParams.get('start') || '';
    const limit = clampIntParam(
      searchParams.get('limit'),
      DEFAULT_LIMIT,
      1,
      MAX_LIMIT
    );

    if (!account) {
      return NextResponse.json(
        { error: 'Account is required' },
        { status: 400 }
      );
    }

    if (!FOLLOW_KINDS.includes(type as (typeof FOLLOW_KINDS)[number])) {
      return NextResponse.json(
        { error: 'Type must be "blog" or "ignore"' },
        { status: 400 }
      );
    }

    const result = await getFollowing(account, start, type, limit);

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
