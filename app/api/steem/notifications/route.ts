/**
 * Steem API Route: Get Notifications
 * GET /api/steem/notifications?account=username&last_id=123&limit=100
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccountNotifications } from '@/lib/steem/client';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');
    const last_id = searchParams.get('last_id');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!account) {
      return NextResponse.json(
        { error: 'Account is required' },
        { status: 400 }
      );
    }

    // Notifications are a signed-in feature: the queried account must match
    // the session account (audit N-14). The underlying bridge RPC is public,
    // so this adds no information hiding — it just stops our route from
    // acting as an unauthenticated per-account oracle. Steem usernames are
    // case-insensitive, hence the lowercased comparison.
    const session = await getSession(request);
    if (!session?.username || session.username.toLowerCase() !== account.toLowerCase()) {
      return NextResponse.json(
        { error: 'Notifications are only readable for the signed-in account' },
        { status: 403 }
      );
    }

    const notifications = await getAccountNotifications({
      account,
      last_id: last_id ? parseInt(last_id, 10) : undefined,
      limit,
    });

    return NextResponse.json(notifications);
  } catch (error: unknown) {
    console.error('Error fetching notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
