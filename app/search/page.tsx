'use client';

import { Suspense } from 'react';
import SearchContent from './SearchContent';

/**
 * Search page
 * Route: /search?q=query&s=sort
 * Equivalent to old route: SearchIndex
 */
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
