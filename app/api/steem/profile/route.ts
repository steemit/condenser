/**
 * Steem API Route: Get User Profile
 * GET /api/steem/profile?account=username&observer=observer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProfile } from '@/lib/steem/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');
    const observer = searchParams.get('observer') || undefined;

    if (!account) {
      return NextResponse.json(
        { error: 'Account is required' },
        { status: 400 }
      );
    }

    const profile = await getProfile({ account, observer });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error: unknown) {
    console.error('Error fetching profile:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
