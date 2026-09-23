/**
 * Steem API Route: Get Posts
 * GET /api/steem/posts?sort=trending&tag=&limit=20&start_author=&start_permlink=
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRankedPosts, getAccountPosts } from '@/lib/steem/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get('sort') || 'trending';
    const tag = searchParams.get('tag') || '';
    const account = searchParams.get('account') || '';
    const start_author = searchParams.get('start_author') || undefined;
    const start_permlink = searchParams.get('start_permlink') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const observer = searchParams.get('observer') || undefined;

    let posts: unknown[];

    if (account) {
      // Get account posts
      posts = await getAccountPosts({
        sort,
        account,
        start_author,
        start_permlink,
        limit,
        observer,
      });
    } else {
      // Get ranked posts
      posts = await getRankedPosts({
        sort,
        tag,
        start_author,
        start_permlink,
        limit,
        observer,
      });
    }

    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error('Error fetching posts:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

