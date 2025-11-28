/**
 * Steem API Route: Get Community Roles and Subscribers
 * GET /api/steem/community-roles?community=hive-123456&type=roles
 * GET /api/steem/community-roles?community=hive-123456&type=subscribers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCommunityRoles, getCommunitySubscribers } from '@/lib/steem/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const community = searchParams.get('community');
    const type = searchParams.get('type') || 'roles'; // 'roles' or 'subscribers'

    if (!community) {
      return NextResponse.json(
        { error: 'Community is required' },
        { status: 400 }
      );
    }

    if (!['roles', 'subscribers'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "roles" or "subscribers"' },
        { status: 400 }
      );
    }

    let result;
    if (type === 'roles') {
      result = await getCommunityRoles({ community });
    } else {
      result = await getCommunitySubscribers({ community });
    }

    return NextResponse.json(result || []);
  } catch (error: any) {
    console.error('Error fetching community roles/subscribers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch community data' },
      { status: 500 }
    );
  }
}
