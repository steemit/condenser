'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * User profile page (default to blog section)
 * Route: /[username]
 * Redirects to /[username]/blog
 */
export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  useEffect(() => {
    router.replace(`/${username}/blog`);
  }, [username, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

