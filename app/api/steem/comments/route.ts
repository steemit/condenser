/**
 * Steem API Route: Get Comments
 * GET /api/steem/comments?author=username&permlink=post-permlink
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

    // Bridge `get_discussion` returns a content MAP keyed by "author/permlink"
    // (legacy loadThread): the root post lives at the `${author}/${permlink}`
    // key, every other entry is a comment. There is no top-level `replies`
    // field — each node's `replies` is an array of child map keys.
    const discussion = (await getDiscussion({ author, permlink })) as Record<
      string,
      unknown
    > | null;

    if (!discussion) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Flatten the map, excluding the root post itself; CommentsList rebuilds
    // the tree client-side from parent_author/parent_permlink.
    const rootKey = `${author}/${permlink}`;
    const comments = Object.entries(discussion)
      .filter(([key]) => key !== rootKey)
      .map(([, content]) => content);

    return NextResponse.json(comments);
  } catch (error: unknown) {
    console.error('Error fetching comments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

