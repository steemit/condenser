'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { normalizeUsername } from '@/lib/utils/username';
import { FeedLayout } from '@/components/layout/FeedLayout';

/**
 * User profile page (default to blog section)
 * Route: /@[username]
 * Redirects to /@[username]/blog
 * Note: proxy.ts ensures only @username format reaches here
 */
export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const usernameRaw = params.username as string;
  const username = normalizeUsername(usernameRaw);

  useEffect(() => {
    // Use @username format in URL
    router.replace(`/@${username}/blog`);
  }, [username, router]);

  return (
    <FeedLayout>
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </FeedLayout>
  );
}

