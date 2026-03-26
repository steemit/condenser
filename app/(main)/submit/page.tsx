'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { showLogin } from '@/store/slices/userSlice';
import PostEditor from '@/components/elements/PostEditor';
import { FeedLayout } from '@/components/layout/FeedLayout';

/**
 * Submit post page
 * Route: /submit
 * Equivalent to old route: SubmitPost
 */
export default function SubmitPostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
          <p className="text-foreground">Please log in to create a post.</p>
        </div>
      </FeedLayout>
    );
  }

  const handleSuccess = (category?: string) => {
    // Clear draft from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('replyEditorData-submit');
    }
    
    // Redirect to created posts page
    const redirectUrl = category ? `/created/${category}` : '/created';
    router.push(redirectUrl);
  };

  return (
    <FeedLayout centerClassName="md:max-w-4xl">
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground md:text-3xl">
        Create Post
      </h1>
      <PostEditor type="submit_story" onSuccess={handleSuccess} />
    </FeedLayout>
  );
}

