'use client';

/**
 * Trending posts page
 * This is the main feed page showing trending posts
 * Equivalent to old route: PostsIndex with params ['trending']
 */
export default function TrendingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trending Posts</h1>
      <p className="text-gray-600">
        This is the trending posts feed. Posts list will be implemented here.
      </p>
      {/* TODO: Implement PostsList component */}
    </div>
  );
}

