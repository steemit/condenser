/**
 * Steem API Route: Get a single community
 * GET /api/steem/community?name=hive-123456&observer=username
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCommunity } from '@/lib/steem/client';

// Community ids are hive-<digits>; bounding the length keeps the server cache
// key space finite (audit N-21 rationale, same as the communities route).
const COMMUNITY_NAME_RE = /^hive-\d{1,16}$/;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = (searchParams.get('name') || '').trim();
    const observer = (searchParams.get('observer') || '').trim() || undefined;

    if (!name) {
      return NextResponse.json(
        { error: 'Community name is required' },
        { status: 400 }
      );
    }
    if (!COMMUNITY_NAME_RE.test(name)) {
      return NextResponse.json(
        { error: 'Invalid community name' },
        { status: 400 }
      );
    }

    const community = (await getCommunity({ name, observer })) as
      | { name?: string }
      | null
      | undefined;

    // Hivemind returns an object without a name for nonexistent communities
    // (legacy FetchDataSaga guards with `if (community.name)`).
    if (!community || !community.name) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(community);
  } catch (error: unknown) {
    console.error('Error fetching community:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch community' },
      { status: 500 }
    );
  }
}
