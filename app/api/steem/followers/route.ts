/**
 * Steem API Route: Get Followers/Following Lists
 * GET /api/steem/followers?account=username&type=followers&page=1&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFollowersByPage, getFollowingByPage } from '@/lib/steem/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');
    const type = searchParams.get('type') || 'followers'; // 'followers' or 'following'
    const page = parseInt(searchParams.get('page') || '1');
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
  } catch (error: any) {
    console.error('Error fetching followers/following:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followers/following' },
      { status: 500 }
    );
  }
}
