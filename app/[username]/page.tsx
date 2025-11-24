'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { normalizeUsername } from '@/lib/utils/username';

/**
 * User profile page (default to blog section)
 * Route: /[username] or /@[username]
 * Redirects to /[username]/blog
 */
export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const usernameRaw = params.username as string;
  const username = normalizeUsername(usernameRaw);

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

