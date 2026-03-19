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

    // Get discussion which includes the post and all comments
    const discussion = (await getDiscussion({ author, permlink })) as { replies?: unknown[] } | null;

    if (!discussion) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Extract comments from discussion
    // The discussion structure may vary, adjust based on actual API response
    const comments = discussion.replies || [];

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

