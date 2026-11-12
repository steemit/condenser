'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showLogin } from '@/store/slices/userSlice';
import PostEditor, { PostEditorResult } from '@/components/elements/PostEditor';
import { FeedLayout } from '@/components/layout/FeedLayout';

/**
 * Submit post page body (client).
 *
 * The server page passes the ?category= param (legacy /submit.html?category=
 * prefill, e.g. the community banner's New Post button) down as a prop —
 * reading it via useSearchParams would force a Suspense boundary around the
 * whole page; awaiting searchParams server-side avoids that (same split as
 * the search page).
 */
export default function SubmitPostClient({
  initialCategory,
}: {
  initialCategory?: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const username = useAppSelector((state) => state.user.current?.username);

  useEffect(() => {
    if (!username) {
      dispatch(showLogin({}));
    }
  }, [username, dispatch]);

  if (!username) {
    return (
      <FeedLayout centerClassName="md:max-w-4xl">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-foreground">{t('submit_jsx.please_log_in')}</p>
        </div>
      </FeedLayout>
    );
  }

  const handleSuccess = (result: PostEditorResult) => {
    // PostEditor already cleared its draft; redirect to the new post's feed.
    // Categories are [\w.-] so encoding is a no-op for valid tags, but
    // encode anyway for consistency with the other tag-URL builders
    // (e.g. FeedSortDropdown.sortPath).
    const redirectUrl = result.category
      ? `/created/${encodeURIComponent(result.category)}`
      : '/created';
    router.push(redirectUrl);
  };

  return (
    <FeedLayout centerClassName="md:max-w-4xl">
      <PostEditor
        type="submit_story"
        category={initialCategory}
        onSuccess={handleSuccess}
      />
    </FeedLayout>
  );
}
