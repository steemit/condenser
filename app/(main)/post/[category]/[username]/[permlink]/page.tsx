import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getDiscussion } from '@/lib/steem/client';
import { normalizeUsername } from '@/lib/utils/username';
import { buildPostMetadata, type SeoPost } from '@/lib/seo';
import PostPageClient from './PostPageClient';

/**
 * Post page with category (server shell).
 * Route: /post/[category]/[username]/[permlink]
 * This is rewritten from /[category]/@[username]/[permlink] by middleware
 * Equivalent to old route: Post with params [category, @username, permlink]
 *
 * generateMetadata ports legacy ExtractMeta.addPostMeta so crawlers and link
 * unfurlers get post-level meta in the SSR HTML. Fetch failures degrade to a
 * bare title — metadata must never 500 the page.
 *
 * When the post definitively does not exist (discussion came back without
 * it), the page 404s here — before the stream starts, so the status is a
 * real 404, not a 200 skeleton that later renders a not-found view inside
 * the client fetch (audit CD-06: that soft-404 shape was edge-cached).
 * Transport/RPC failures cannot distinguish "missing" from "unavailable",
 * so they fall back to the client-fetch skeleton instead of 404.
 */
interface PageParams {
  category: string;
  username: string;
  permlink: string;
}

// generateMetadata and the page component both await the discussion within
// a single request; withCache has no in-flight coalescing, so a cold cache
// would fire the same bridge.get_discussion RPC twice. React cache()
// memoizes per request — the Next.js-recommended dedupe for this shape
// (same helper as the post-no-category page).
const getDiscussionCached = cache((author: string, permlink: string) =>
  getDiscussion({ author, permlink })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { username, permlink } = await params;
  const author = normalizeUsername(username);
  try {
    // Same cached path as /api/steem/post: bridge get_discussion returns a
    // content map keyed "author/permlink".
    const discussion = (await getDiscussionCached(author, permlink)) as Record<
      string,
      SeoPost
    > | null;
    const post = discussion?.[`${author}/${permlink}`];
    if (!post || !post.author) return { title: 'Steemit' };
    return buildPostMetadata(post);
  } catch (error) {
    console.error('generateMetadata: failed to fetch post:', error);
    return { title: 'Steemit' };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { username, permlink } = await params;
  const author = normalizeUsername(username);

  // Same cached fetch as generateMetadata / /api/steem/post (deduped per
  // request via cache() above): bridge get_discussion returns a content
  // map keyed "author/permlink". A missing post yields a map without the
  // key (or null) without throwing; only transport/RPC errors throw
  // (withCache stale-while-error rethrows when no stale copy exists).
  let postExists = false;
  let fetchFailed = false;
  try {
    const discussion = (await getDiscussionCached(author, permlink)) as Record<
      string,
      { author?: string }
    > | null;
    const post = discussion?.[`${author}/${permlink}`];
    postExists = Boolean(post?.author);
  } catch (error) {
    console.error('PostPage: failed to fetch post:', error);
    fetchFailed = true;
  }

  if (!postExists && !fetchFailed) {
    // Post definitively missing → real 404 (status + page), clean URL.
    notFound();
  }
  // Post exists, or the existence check could not be completed (RPC down):
  // render the client shell — the client fetch shows the not-found view if
  // the post still cannot be resolved.
  return <PostPageClient />;
}
