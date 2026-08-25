'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { normalizeUsername } from '@/lib/utils/username';
import { FeedLayout } from '@/components/layout/FeedLayout';

/**
 * User profile root — client content (redirects to the blog section).
 * Rendered by the server page shell in ./page.tsx, which owns
 * generateMetadata.
 */
export default function UserRedirectClient() {
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
