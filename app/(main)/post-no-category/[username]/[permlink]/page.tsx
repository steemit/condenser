import type { Metadata } from 'next';
import { getDiscussion } from '@/lib/steem/client';
import { normalizeUsername } from '@/lib/utils/username';
import { buildPostMetadata, type SeoPost } from '@/lib/seo';
import PostNoCategoryClient from './PostNoCategoryClient';

/**
 * Post page without category (server shell).
 * Route: /post-no-category/[username]/[permlink]
 * This is rewritten from /@[username]/[permlink] by middleware.
 * The client component redirects to the canonical category URL;
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

export default function PostNoCategoryPage() {
  return <PostNoCategoryClient />;
}
