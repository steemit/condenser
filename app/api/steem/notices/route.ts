/**
 * Steem API Route: notices
 * GET /api/steem/notices
 *
 * Sidebar announcements (legacy pages/Announcement.jsx → FetchDataSaga
 * getNotices → turtle.get_notices).
 *
 * Error semantics: an RPC failure answers 500 {error} instead of a 200 with
 * empty data — "no notices" and "notices unavailable" stay distinguishable.
 * The consumer (Announcement) hides the module on any non-2xx, so the
 * visible behavior on failure is unchanged.
 */

import { NextResponse } from 'next/server';
import { callBridge } from '@/lib/steem/client';

export async function GET() {
  try {
    const notices = await callBridge<unknown[]>('get_notices', { limit: 1 }, 'turtle.');
    return NextResponse.json({ data: notices ?? [] });
  } catch (error: unknown) {
    console.error('Error fetching notices:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}
