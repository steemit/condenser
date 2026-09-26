'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { normalizeUsername, formatUsername } from '@/lib/utils/username';
import { fetchPostByPermlink } from '@/lib/api/steem';
import { FeedLayout } from '@/components/layout/FeedLayout';
import NotFound from '@/components/NotFound';

/**
 * Post page without category — client content.
 * Rendered by the server page shell in ./page.tsx (which resolves the
 * post and owns generateMetadata).
 *
 * - `category` prop: the server already resolved the post; redirect to
 *   /[category]/@[username]/[permlink] immediately (no client fetch).
 * - no `category` prop: the server fetch failed (RPC down), so retry here.
 *   When the post still cannot be resolved, render the 404 view at the
 *   current URL — legacy PostPageNoCategory renders NotFound for missing
 *   posts and never fabricates a /general/… URL.
 */
export default function PostNoCategoryClient({
  category,
  username: usernameRaw,
  permlink,
}: {
  /** Category resolved by the server, when the post exists. */
  category?: string;
  username: string;
  permlink: string;
}) {
  const router = useRouter();
  const username = normalizeUsername(usernameRaw);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (category) {
      router.replace(
        `/${category}/${formatUsername(username)}/${permlink}`
      );
      return;
    }
    let cancelled = false;
    const loadAndRedirect = async () => {
      try {
        const post = await fetchPostByPermlink(null, username, permlink);
        if (cancelled) return;
        if (post && post.category) {
          router.replace(`/${post.category}/${formatUsername(username)}/${permlink}`);
        } else {
          setMissing(true);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        if (!cancelled) setMissing(true);
      }
    };

    void loadAndRedirect();
    return () => {
      cancelled = true;
    };
  }, [category, username, permlink, router]);

  if (missing) {
    return <NotFound />;
  }

  return (
    <FeedLayout>
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </FeedLayout>
  );
}
