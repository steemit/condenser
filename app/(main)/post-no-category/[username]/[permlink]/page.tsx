import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDiscussion } from '@/lib/steem/client';
import { normalizeUsername } from '@/lib/utils/username';
import { buildPostMetadata, type SeoPost } from '@/lib/seo';
import PostNoCategoryClient from './PostNoCategoryClient';

/**
 * Post page without category (server shell).
 * Route: /post-no-category/[username]/[permlink]
 * This is rewritten from /@[username]/[permlink] by middleware.
 *
 * The server resolves the post's category up front so the client can
 * redirect to the canonical /[category]/@[username]/[permlink] URL without
 * a second fetch. When the post definitively does not exist (discussion
 * came back without it), the page 404s here — legacy PostPageNoCategory
 * renders its NotFound page and never invents a URL; a fake
 * /general/@user/permlink redirect would put a soft-404 URL in the address
 * bar. Transport/RPC failures cannot distinguish "missing" from
 * "unavailable", so they fall back to the client fetch path instead of 404.
 * generateMetadata still emits post meta for crawlers that never follow
 * the client-side redirect. Fetch failures degrade to a bare title.
 */
interface PageParams {
  username: string;
  permlink: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { username, permlink } = await params;
  const author = normalizeUsername(username);
  try {
    const discussion = (await getDiscussion({ author, permlink })) as Record<
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

export default async function PostNoCategoryPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { username, permlink } = await params;
  const author = normalizeUsername(username);

  // Same cached fetch as generateMetadata / /api/steem/post: bridge
  // get_discussion returns a content map keyed "author/permlink". A missing
  // post yields a map without the key (or null) without throwing; only
  // transport/RPC errors throw (withCache stale-while-error rethrows).
  let category: string | undefined;
  let fetchFailed = false;
  try {
    const discussion = (await getDiscussion({ author, permlink })) as Record<
      string,
      { category?: string }
    > | null;
    const post = discussion?.[`${author}/${permlink}`];
    // Empty category is treated as missing, mirroring legacy
    // PostPageNoCategory (redirectUrl = category ? … : null).
    category = post?.category || undefined;
  } catch (error) {
    console.error('PostNoCategoryPage: failed to fetch post:', error);
    fetchFailed = true;
  }

  if (category) {
    return (
      <PostNoCategoryClient
        category={category}
        username={username}
        permlink={permlink}
      />
    );
  }
  if (!fetchFailed) {
    // Post definitively missing → real 404 (status + page), clean URL.
    notFound();
  }
  // Fetch failed (RPC down): retry client-side; the client renders the
  // 404 view if the post still cannot be resolved.
  return <PostNoCategoryClient username={username} permlink={permlink} />;
}
