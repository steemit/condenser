'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Post page without category (redirects to category version)
 * Route: /[username]/[permlink]
 * This handles both /@username/permlink and /username/permlink
 * Equivalent to old route: PostNoCategory with params [@username, permlink]
 * This redirects to /[category]/@[username]/[permlink] after fetching the post's category
 */
export default function PostNoCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const permlink = params.permlink as string;

  useEffect(() => {
    // TODO: Fetch post to get its category, then redirect
    // For now, redirect to a default category or handle differently
    // const post = await fetchPostByPermlink(null, username, permlink);
    // router.replace(`/${post.category}/@${username}/${permlink}`);
    
    // Placeholder: This should be handled by fetching the post first
    console.log('PostNoCategory redirect:', { username, permlink });
    // For now, we'll need to fetch the post to know its category
    // This is a temporary solution - should be improved
  }, [username, permlink, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

