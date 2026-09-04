'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { showLogin } from '@/store/slices/userSlice';
import PostEditor, { PostEditorResult } from '@/components/elements/PostEditor';
import { FeedLayout } from '@/components/layout/FeedLayout';

/**
 * Submit post page
 * Route: /submit
 * Equivalent to old route: SubmitPost
 */
export default function SubmitPostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const username = useAppSelector((state) => state.user.current?.username);

  useEffect(() => {
    dispatch(setPathname('/submit'));
  }, [dispatch]);

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
    const redirectUrl = result.category ? `/created/${result.category}` : '/created';
    router.push(redirectUrl);
  };

  return (
    <FeedLayout centerClassName="md:max-w-4xl">
      <PostEditor type="submit_story" onSuccess={handleSuccess} />
    </FeedLayout>
  );
}

