'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import LoginForm from '@/components/modules/LoginForm';

/**
 * Login page
 * Route: /login
 * Equivalent to old route: Login (login.html)
 */
export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.user.current?.username);

  useEffect(() => {
    dispatch(setPathname('/login'));
  }, [dispatch]);

  // Redirect if already logged in
  useEffect(() => {
    if (username) {
      router.push('/trending');
    }
  }, [username, router]);

  if (username) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <LoginForm />
    </div>
  );
}

