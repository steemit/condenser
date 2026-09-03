/**
 * Steem API Route: Get Unread Notifications Count
 * GET /api/steem/unread-notifications?account=username
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUnreadNotifications } from '@/lib/steem/client';

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