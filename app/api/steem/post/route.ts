/**
 * Steem API Route: Get Single Post
 * GET /api/steem/post?author=username&permlink=post-permlink
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDiscussion } from '@/lib/steem/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const author = searchParams.get('author');
    const permlink = searchParams.get('permlink');

    if (!author || !permlink) {
      return NextResponse.json(
        { error: 'Author and permlink are required' },
        { status: 400 }
      );
    }

    const discussion = (await getDiscussion({ author, permlink })) as Record<string, unknown> | null;

    if (!discussion) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // getDiscussion returns an object with posts keyed by "author/permlink"
    const postKey = `${author}/${permlink}`;
    const post = discussion[postKey];

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error('Error fetching post:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected RPC internals must not reach the response).
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

