/**
 * Steem API Route: Get Dynamic Global Properties
 * GET /api/steem/dynamic-global-properties
 * 
 * Returns dynamic global properties needed for transaction construction
 */

import { NextResponse } from 'next/server';
import { initializeSteemApi, callSteemApi } from '@/lib/steem/client';

export async function GET() {
  try {
    initializeSteemApi();

    const props = await callSteemApi('get_dynamic_global_properties', []);

    return NextResponse.json(props);
  } catch (error: any) {
    console.error('Error fetching dynamic global properties:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dynamic global properties' },
      { status: 500 }
    );
  }
}
