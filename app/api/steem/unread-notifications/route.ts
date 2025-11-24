/**
 * Steem API Route: Get Unread Notifications
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

    const unreadNotifications = await getUnreadNotifications({ account });

    return NextResponse.json(unreadNotifications);
  } catch (error: any) {
    console.error('Error fetching unread notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch unread notifications' },
      { status: 500 }
    );
  }
}

