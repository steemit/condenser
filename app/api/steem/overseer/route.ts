/**
 * Steem API Route: overseer relay
 * POST /api/steem/overseer
 *
 * Legacy condenser called `overseer.collect` directly from the browser via
 * steem-js. Since steem-js is server-only in the rewrite, the client-side
 * analytics helpers (lib/analytics/overseer.ts) POST the collect payload
 * here and this route forwards it to the node. Analytics is best-effort:
 * relay failures are logged and always answered 204 so the client UI is
 * never affected.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callSteemApi } from '@/lib/steem/client';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    await callSteemApi('overseer.collect', payload);
  } catch (error) {
    console.warn('overseer relay error:', error);
  }
  return new NextResponse(null, { status: 204 });
}
