'use client';

import { Post } from '@/lib/api/steem';

interface PostFullProps {
  post: Post;
}

/**
 * PostFull component
 * Displays a full post with title, body, metadata, and actions
 * Migrated from legacy/src/app/components/cards/PostFull.jsx
 */
export default function PostFull({ post }: PostFullProps) {
  return (
    <article className="post-full">
      <header className="post-full__header mb-6">
        <h1 className="text-3xl font-bold mb-4">{post.title || 'Untitled'}</h1>
        
        <div className="post-full__meta text-sm text-gray-600 mb-4">
          <span className="post-full__author">
            by <a href={`/@${post.author}`} className="text-blue-600 hover:underline">
              @{post.author}
            </a>
          </span>
          {' • '}
          <span className="post-full__category">
            in <a href={`/${post.category}`} className="text-blue-600 hover:underline">
              #{post.category}
            </a>
          </span>
          {' • '}
          <span className="post-full__date">
            {new Date(post.created).toLocaleDateString()}
          </span>
        </div>
      </header>

      <div className="post-full__body prose max-w-none">
        {/* TODO: Implement MarkdownViewer component */}
        <div className="whitespace-pre-wrap">{post.body}</div>
      </div>

      <footer className="post-full__footer mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-4">
          {/* TODO: Implement Voting component */}
          <button className="text-gray-600 hover:text-blue-600">
            Vote
          </button>
          
          {/* TODO: Implement Reblog component */}
          <button className="text-gray-600 hover:text-blue-600">
            Reblog
          </button>
          
          {/* TODO: Implement ShareMenu component */}
          <button className="text-gray-600 hover:text-blue-600">
            Share
          </button>
        </div>
      </footer>
    </article>
  );
}

