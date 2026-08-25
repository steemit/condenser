import type { Metadata } from 'next';
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
 */
interface PageParams {
  category: string;
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
    // Same cached path as /api/steem/post: bridge get_discussion returns a
    // content map keyed "author/permlink".
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

export default function PostPage() {
  return <PostPageClient />;
}
