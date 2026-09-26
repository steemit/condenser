/**
 * Steem API Route: Get User Communities/Subscriptions
 * GET /api/steem/communities?account=username&type=subscriptions
 * GET /api/steem/communities?observer=username&query=search&sort=rank&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptions, listCommunities } from '@/lib/steem/client';
import { clampIntParam } from '@/lib/api/params';

// Param bounds (audit N-21): (query, sort, limit) feed the server cache key
// in lib/steem/client.ts listCommunities(), so each component must be
// length/value bounded here — otherwise an unbounded query inflates the key
// space and limit=100000 caches a huge serialized list (value amplification).
const MAX_QUERY_LENGTH = 64;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
// Sort options actually exposed by the communities explore page.
const COMMUNITY_SORTS = new Set(['rank', 'subs', 'new']);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = searchParams.get('account');
    const type = searchParams.get('type') || 'list'; // 'subscriptions' or 'list'
    const observer = searchParams.get('observer') || undefined;
    const query = (searchParams.get('query') || '').trim().slice(0, MAX_QUERY_LENGTH);
    const sortRaw = searchParams.get('sort') || 'rank';
    const sort = COMMUNITY_SORTS.has(sortRaw) ? sortRaw : 'rank';
    const limit = clampIntParam(
      searchParams.get('limit'),
      DEFAULT_LIMIT,
      1,
      MAX_LIMIT
    );

    let result;

    if (type === 'subscriptions') {
      // Get user subscriptions
      if (!account) {
        return NextResponse.json(
          { error: 'Account is required for subscriptions' },
          { status: 400 }
        );
      }
      result = await getUserSubscriptions({ account });
      // bridge.list_all_subscriptions returns tuples, not objects:
      // [community, community_title, role, affiliation_title]
      // (legacy cards/SubscriptionsList.jsx renderItem). Map to typed objects
      // so the client contract stays object-shaped.
      result = (result || []).map((item: unknown) => {
        if (!Array.isArray(item)) return item;
        const [community, communityTitle, role, affiliationTitle] = item;
        return {
          name: community,
          title: communityTitle || community,
          context: { role, title: affiliationTitle },
        };
      });
    } else {
      // List communities
      result = await listCommunities({
        observer,
        query,
        sort,
        limit,
      });
    }

    return NextResponse.json(result || []);
  } catch (error: unknown) {
    console.error('Error fetching communities:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}
