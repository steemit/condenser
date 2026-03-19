/**
 * Steem API Route: Get User Communities/Subscriptions
 * GET /api/steem/communities?account=username&type=subscriptions
 * GET /api/steem/communities?observer=username&query=search&sort=rank&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptions, listCommunities } from '@/lib/steem/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');
    const type = searchParams.get('type') || 'list'; // 'subscriptions' or 'list'
    const observer = searchParams.get('observer') || undefined;
    const query = searchParams.get('query') || '';
    const sort = searchParams.get('sort') || 'rank';
    const limit = parseInt(searchParams.get('limit') || '20');

    let result;

    if (type === 'subscriptions') {
      // Get user subscriptions
      if (!account) {
        return NextResponse.json(
          { error: 'Account is required for subscriptions' },
          { status: 400 }
        );
      }
      result = await getUserSubscriptions({ account });
    } else {
      // List communities
      result = await listCommunities({
        observer,
        query,
        sort,
        limit,
      });
    }

    return NextResponse.json(result || []);
  } catch (error: unknown) {
    console.error('Error fetching communities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch communities';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
