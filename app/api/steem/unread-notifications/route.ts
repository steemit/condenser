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

    // The bridge API returns unread notifications data
    // Extract the count from the result
    const unreadCount = result?.unread_count || 0;

    return NextResponse.json({ 
      account,
      unread_count: unreadCount,
      result: result || {},
    });
  } catch (error: any) {
    console.error('Error fetching unread notifications:', error);
    return NextResponse.json(
      { 
        account: request.nextUrl.searchParams.get('account'),
        unread_count: 0,
        error: error.message || 'Failed to fetch unread notifications',
      },
      { status: 500 }
    );
  }
}