/**
 * Steem API Route: Get Followers/Following Lists
 * GET /api/steem/followers?account=username&type=followers&page=0&limit=20
 *
 * `page` is 0-based: condenser_api.get_followers_by_page expects a 0-based
 * page and legacy passes its 0-based currentPage straight through.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFollowersByPage, getFollowingByPage } from '@/lib/steem/client';

// Param bounds (audit N-21): page/limit feed the server cache keys in
// lib/steem/client.ts get{Followers,Following}ByPage(), so clamp them here.
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

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
    const type = searchParams.get('type') || 'followers'; // 'followers' or 'following'
    const page = clampIntParam(
      searchParams.get('page'),
      0,
      0,
      Number.MAX_SAFE_INTEGER
    );
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
