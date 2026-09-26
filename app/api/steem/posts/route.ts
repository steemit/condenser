/**
 * Steem API Route: Get Posts
 * GET /api/steem/posts?sort=trending&tag=&limit=20&start_author=&start_permlink=
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRankedPosts, getAccountPosts } from '@/lib/steem/client';
import { clampIntParam } from '@/lib/api/params';
import { SORT_TYPES } from '@/lib/routes';

// Param bounds (audit N-21, mirroring the followers/following/communities
// routes): sort/tag/limit/account all reach the server cache keys in
// lib/steem/client.ts get{Ranked,Account}Posts() — an unwhitelisted sort or
// an unbounded tag/account sprays one Redis key per variant, and a huge
// limit caches a huge serialized list (value amplification).
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
// Tags/categories are free-form on chain (unicode community names exist),
// so only the length is bounded — same policy as the communities route's
// query param.
const MAX_TAG_LENGTH = 64;

// bridge.get_account_posts sorts: the profile sections that are post lists
// (lib/api/steem.ts AccountPostsOrder / UserSectionClient).
const ACCOUNT_SORTS = [
  'blog',
  'posts',
  'comments',
  'replies',
  'payout',
  'feed',
];

// Steem account names: lowercase letters, digits, dashes and dots — same
// leniency as the followers/following routes (this route only READS public
// data; the goal is bounding the cache key, not vetting names).
const ACCOUNT_PARAM_RE = /^[a-z0-9.-]{1,64}$/;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account = (searchParams.get('account') || '').trim().toLowerCase();
    const tag = (searchParams.get('tag') || '').trim().slice(0, MAX_TAG_LENGTH);
    const sortRaw = (searchParams.get('sort') || '').toLowerCase();
    const start_author = searchParams.get('start_author') || undefined;
    const start_permlink = searchParams.get('start_permlink') || undefined;
    const limit = clampIntParam(
      searchParams.get('limit'),
      DEFAULT_LIMIT,
      1,
      MAX_LIMIT
    );
    const observer = searchParams.get('observer') || undefined;

    if (account && !ACCOUNT_PARAM_RE.test(account)) {
      return NextResponse.json(
        { error: 'Invalid account name' },
        { status: 400 }
      );
    }

    // Sort whitelist. Ranked sorts derive from SORT_TYPES (lib/routes.ts —
    // the legacy CategoryFilters <sort> alternation); account sorts are the
    // post-list profile sections. Defaults mirror the browser helpers
    // (fetchRankedPosts → trending, fetchAccountPosts → blog). Anything
    // else would be forwarded verbatim into the bridge call and the
    // steem:posts:* cache keys.
    const defaultSort = account ? 'blog' : 'trending';
    const validSorts: readonly string[] = account ? ACCOUNT_SORTS : SORT_TYPES;
    const sort = sortRaw || defaultSort;
    if (!validSorts.includes(sort)) {
      return NextResponse.json({ error: 'Invalid sort' }, { status: 400 });
    }

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
