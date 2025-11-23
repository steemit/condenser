'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import PostFull from '@/components/cards/PostFull';
import CommentsList from '@/components/cards/CommentsList';
import { Post, fetchPostByPermlink } from '@/lib/api/steem';
import { Comment } from '@/components/cards/Comment';

/**
 * Post page with category
 * Route: /[category]/[username]/[permlink]
 * Note: In the old system, this was /[category]/@[username]/[permlink]
 * We'll handle the @ prefix in middleware or route handling
 * Equivalent to old route: Post with params [category, @username, permlink]
 */
export default function PostPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const category = params.category as string;
  const username = params.username as string;
  const permlink = params.permlink as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set pathname in global state
  useEffect(() => {
    const pathname = `/${category}/@${username}/${permlink}`;
    dispatch(setPathname(pathname));
  }, [category, username, permlink, dispatch]);

  // Fetch post data and comments
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPost = await fetchPostByPermlink(category, username, permlink);
        if (fetchedPost) {
          setPost(fetchedPost);
          
          // TODO: Fetch comments for this post
          // For now, use empty array
          setComments([]);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [category, username, permlink]);

  const handleReply = async (
    parentAuthor: string,
    parentPermlink: string,
    body: string
  ) => {
    // TODO: Implement comment reply
    console.log('Reply to comment:', { parentAuthor, parentPermlink, body });
  };

  const handleEdit = async (author: string, permlink: string, body: string) => {
    // TODO: Implement comment edit
    console.log('Edit comment:', { author, permlink, body });
  };

  const handleDelete = async (author: string, permlink: string) => {
    // TODO: Implement comment delete
    console.log('Delete comment:', { author, permlink });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <p className="text-red-500">{error || 'Post not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PostFull post={post} />
      
      {post && (
        <CommentsList
          comments={comments}
          postAuthor={post.author}
          postPermlink={post.permlink}
          postCategory={post.category}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

