/**
 * Steem API Route: Get Notifications
 * GET /api/steem/notifications?account=username&last_id=123&limit=100
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccountNotifications } from '@/lib/steem/client';

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

    const notifications = await getAccountNotifications({
      account,
      last_id: last_id ? parseInt(last_id, 10) : undefined,
      limit,
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

