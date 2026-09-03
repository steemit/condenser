/**
 * Steem API Route: Get Followers/Following Lists
 * GET /api/steem/followers?account=username&type=followers&page=0&limit=20
 *
 * `page` is 0-based: condenser_api.get_followers_by_page expects a 0-based
 * page and legacy passes its 0-based currentPage straight through.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFollowersByPage, getFollowingByPage } from '@/lib/steem/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');
    const type = searchParams.get('type') || 'followers'; // 'followers' or 'following'
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

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
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch followers/following';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
