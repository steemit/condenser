'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/api/steem';
import MarkdownViewer from '@/components/elements/MarkdownViewer';
import Voting from '@/components/elements/Voting';
import ShareMenu from '@/components/elements/ShareMenu';
import TagList from '@/components/elements/TagList';

interface PostFullProps {
  post: Post;
}

/**
 * PostFull component
 * Displays a full post with title, body, metadata, and actions
 * Migrated from legacy/src/app/components/cards/PostFull.jsx
 */
export default function PostFull({ post }: PostFullProps) {
  // Set document title
  useEffect(() => {
    if (typeof window !== 'undefined' && post.title) {
      document.title = `${post.title} — Steemit`;
    }
  }, [post.title]);

  // Set canonical URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let canonicalLink = document.getElementById('canonicalUrlID') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.id = 'canonicalUrlID';
      document.head.appendChild(canonicalLink);
    }

    const canonicalURL = `/${post.category}/@${post.author}/${post.permlink}`;
    canonicalLink.href = `${window.location.origin}${canonicalURL}`;
  }, [post]);

  const tags = post.json_metadata?.tags || [];
  const postUrl = `/${post.category}/@${post.author}/${post.permlink}`;
  const createdDate = new Date(post.created);

  const handleVote = async (weight: number) => {
    // TODO: Implement actual vote action
    console.log('Vote:', { author: post.author, permlink: post.permlink, weight });
  };

  return (
    <article className="post-full">
      <header className="post-full__header mb-6">
        <h1 className="text-3xl font-bold mb-4">{post.title || 'Untitled'}</h1>
        
        <div className="post-full__meta text-sm text-gray-600 mb-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="post-full__author">
              by{' '}
              <Link
                href={`/@${post.author}`}
                className="text-blue-600 hover:underline font-medium"
              >
                @{post.author}
              </Link>
            </span>
            <span>•</span>
            <span className="post-full__category">
              in{' '}
              <Link
                href={`/${post.category}`}
                className="text-blue-600 hover:underline"
              >
                #{post.category}
              </Link>
            </span>
            <span>•</span>
            <span className="post-full__date">
              <time dateTime={post.created}>
                {createdDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </span>
          </div>

          {tags.length > 0 && (
            <div className="mt-2">
              <TagList tags={tags} category={post.category} />
            </div>
          )}
        </div>
      </header>

      <div className="post-full__body prose max-w-none mb-8">
        <MarkdownViewer text={post.body || ''} large />
      </div>

      <footer className="post-full__footer mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Voting post={post} onVote={handleVote} />
            
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              title="Reblog"
            >
              Reblog
            </button>
          </div>

          <ShareMenu
            url={postUrl}
            title={post.title || 'Untitled'}
            description={post.body?.substring(0, 200)}
          />
        </div>

        {post.children !== undefined && (
          <div className="mt-4 text-sm text-gray-600">
            {post.children} {post.children === 1 ? 'comment' : 'comments'}
          </div>
        )}
      </footer>
    </article>
  );
}
