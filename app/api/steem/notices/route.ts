/**
 * Steem API Route: notices
 * GET /api/steem/notices
 *
 * Sidebar announcements (legacy pages/Announcement.jsx → FetchDataSaga
 * getNotices → turtle.get_notices).
 */

import { NextResponse } from 'next/server';
import { callBridge } from '@/lib/steem/client';

export async function GET() {
  try {
    const notices = await callBridge<unknown[]>('get_notices', { limit: 1 }, 'turtle.');
    return NextResponse.json({ data: notices ?? [] });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json({ data: [] });
  }
}
