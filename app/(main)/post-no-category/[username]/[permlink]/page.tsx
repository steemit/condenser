'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { normalizeUsername, formatUsername } from '@/lib/utils/username';
import { fetchPostByPermlink } from '@/lib/api/steem';
import { FeedLayout } from '@/components/layout/FeedLayout';

/**
 * Post page without category (redirects to category version)
 * Route: /post-no-category/[username]/[permlink]
 * This is rewritten from /@[username]/[permlink] by middleware
 * Equivalent to old route: PostNoCategory with params [@username, permlink]
 * This redirects to /[category]/@[username]/[permlink] after fetching the post's category
 */
export default function PostNoCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const usernameRaw = params.username as string;
  const username = normalizeUsername(usernameRaw);
  const permlink = params.permlink as string;

  useEffect(() => {
    const loadAndRedirect = async () => {
      try {
        const post = await fetchPostByPermlink(null, username, permlink);
        if (post && post.category) {
          router.replace(`/${post.category}/${formatUsername(username)}/${permlink}`);
        } else {
          router.replace(`/general/${formatUsername(username)}/${permlink}`);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        router.replace(`/general/${formatUsername(username)}/${permlink}`);
      }
    };

    void loadAndRedirect();
  }, [username, permlink, router]);

  return (
    <FeedLayout>
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </FeedLayout>
  );
}

