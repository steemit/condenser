'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPostByPermlink } from '@/lib/api/steem';

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
  const username = params.username as string;
  const permlink = params.permlink as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAndRedirect = async () => {
      try {
        const post = await fetchPostByPermlink(null, username, permlink);
        if (post && post.category) {
          router.replace(`/${post.category}/@${username}/${permlink}`);
        } else {
          // If post not found or category missing, redirect to a default category or 404
          router.replace(`/general/@${username}/${permlink}`);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        router.replace(`/general/@${username}/${permlink}`);
      } finally {
        setLoading(false);
      }
    };

    loadAndRedirect();
  }, [username, permlink, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

