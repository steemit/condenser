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
      // bridge.list_community_roles returns [name, role, title] tuples
      // (legacy pages/CommunityRoles.jsx destructures tuple[0..2]).
      const roles = await getCommunityRoles({ community });
      result = (roles || []).map((item: unknown) => {
        if (!Array.isArray(item)) return item;
        const [name, role, title] = item;
        return { name, role, title };
      });
    } else {
      // bridge.list_subscribers returns [name, role, title, created_at] tuples
      // (legacy modules/CommunitySubscriberList.jsx uses s[0..2]).
      const subscribers = await getCommunitySubscribers({ community });
      result = (subscribers || []).map((item: unknown) => {
        if (!Array.isArray(item)) return item;
        const [name, role, title, created_at] = item;
        return { name, role, title, created_at };
      });
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
