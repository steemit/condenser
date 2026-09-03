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
  } catch (error: unknown) {
    console.error('Error fetching dynamic global properties:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch dynamic global properties';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
