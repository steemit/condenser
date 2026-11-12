/**
 * Steem API Route: Get a community's moderation log
 * GET /api/steem/community-notifications?name=hive-123456&limit=100&last_id=0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCommunityNotifications } from '@/lib/steem/client';
import { clampIntParam } from '@/lib/api/params';

// Restricted to community ids on purpose: the underlying account_notifications
// RPC is public, but /api/steem/notifications gates reads to the signed-in
// account so our routes are not an unauthenticated per-account oracle
// (audit N-14). A community's moderation log is public chain data that legacy
// showed to everyone, so this route serves it — but only for hive-* names,
// which are not user accounts, keeping the N-14 guarantee intact.
const COMMUNITY_NAME_RE = /^hive-\d{1,16}$/;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = (searchParams.get('name') || '').trim();
    const lastIdRaw = searchParams.get('last_id');
    const limit = clampIntParam(
      searchParams.get('limit'),
      DEFAULT_LIMIT,
      1,
      MAX_LIMIT
    );

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

    const notifications = await getCommunityNotifications({
      account: name,
      last_id: lastIdRaw ? parseInt(lastIdRaw, 10) || undefined : undefined,
      limit,
    });

    return NextResponse.json(notifications || []);
  } catch (error: unknown) {
    console.error('Error fetching community notifications:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch community notifications' },
      { status: 500 }
    );
  }
}
