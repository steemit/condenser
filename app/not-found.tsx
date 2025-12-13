import { Metadata } from 'next';
import NotFound from '@/components/NotFound';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
};

/**
 * Next.js not-found page
 * This page is automatically displayed when notFound() is called
 * or when a route doesn't match any existing pages.
 * 
 * This is the recommended way to handle 404 errors in Next.js App Router.
 */
export default function NotFoundPage() {
  return <NotFound />;
}

