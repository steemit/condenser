'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import PostEditor from '@/components/elements/PostEditor';

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!username) {
      // TODO: Show login modal or redirect to login page
      console.log('User not logged in');
    }
  }, [username]);

  if (!username) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please log in to create a post.</p>
        </div>
      </div>
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create Post</h1>
      <PostEditor
        type="submit_story"
        onSuccess={handleSuccess}
      />
    </div>
  );
}

