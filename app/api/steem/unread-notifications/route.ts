/**
 * Steem API Route: Get Unread Notifications Count
 * GET /api/steem/unread-notifications?account=username
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUnreadNotifications } from '@/lib/steem/client';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');

    if (!account) {
      return NextResponse.json(
        { error: 'Account is required' },
        { status: 400 }
      );
    }

    // Same session binding as /api/steem/notifications (audit N-14): the
    // queried account must match the signed-in session. Steem usernames are
    // case-insensitive, hence the lowercased comparison.
    const session = await getSession(request);
    if (!session?.username || session.username.toLowerCase() !== account.toLowerCase()) {
      return NextResponse.json(
        { error: 'Notifications are only readable for the signed-in account' },
        { status: 403 }
      );
    }

    const result = await getUnreadNotifications({ account });

    // bridge.unread_notifications returns { lastread, unread } (legacy
    // shape); map it onto the route's response fields.
    const unreadCount = (result?.unread as number) ?? 0;

    return NextResponse.json({
      account,
      unread_count: unreadCount,
      lastread: (result?.lastread as string) ?? null,
      result: result || {},
    });
  } catch (error: unknown) {
    console.error('Error fetching unread notifications:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch unread notifications';
    return NextResponse.json(
      {
        account: request.nextUrl.searchParams.get('account'),
        unread_count: 0,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
