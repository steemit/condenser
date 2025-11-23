'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Home page - redirects to trending feed
 * This matches the old behavior where '/' resolves to PostsIndex with 'trending' param
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to trending feed (equivalent to old route: PostsIndex with params ['trending'])
    router.replace('/trending');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
