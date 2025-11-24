'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { normalizeUsername, formatUsername } from '@/lib/utils/username';
import PostFull from '@/components/cards/PostFull';
import CommentsList from '@/components/cards/CommentsList';
import { Post, fetchPostByPermlink, fetchCommentsByPermlink } from '@/lib/api/steem';

/**
 * Post page with category
 * Route: /post/[category]/[username]/[permlink]
 * This is rewritten from /[category]/@[username]/[permlink] by middleware
 * Equivalent to old route: Post with params [category, @username, permlink]
 */
export default function PostPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const category = params.category as string;
  const usernameRaw = params.username as string;
  const username = normalizeUsername(usernameRaw);
  const permlink = params.permlink as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set pathname in global state
  useEffect(() => {
    const pathname = `/${category}/${formatUsername(username)}/${permlink}`;
    dispatch(setPathname(pathname));
  }, [category, username, permlink, dispatch]);

  // Fetch post data and comments
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPost = await fetchPostByPermlink(category, username, permlink);
        if (fetchedPost) {
          setPost(fetchedPost);
          const fetchedComments = await fetchCommentsByPermlink(username, permlink);
          setComments(fetchedComments);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post or comments:', err);
        setError('Failed to load post or comments');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category, username, permlink]);

  const handleNewComment = async (newCommentBody: string) => {
    if (!post) return;
    // TODO: Implement actual comment submission via API
    // For now, just add to local state
    const newComment: Post = {
      author: 'currentuser', // Replace with actual logged-in user
      permlink: `comment-${Date.now()}`,
      category: post.category,
      title: '',
      body: newCommentBody,
      created: new Date().toISOString(),
      net_rshares: '0',
      children: 0,
      parent_author: post.author,
      parent_permlink: post.permlink,
      depth: 1,
      active_votes: [],
      pending_payout_value: '0.000 SBD',
    };
    setComments((prevComments) => [...prevComments, newComment]);
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
      <CommentsList
        comments={comments}
        postAuthor={post.author}
        postPermlink={post.permlink}
        postCategory={post.category}
        onReply={handleNewComment}
      />
    </div>
  );
}

