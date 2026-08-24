'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { normalizeUsername, formatUsername } from '@/lib/utils/username';
import PostFull from '@/components/cards/PostFull';
import CommentsList from '@/components/cards/CommentsList';
import { PostEditorResult } from '@/components/elements/PostEditor';
import { Post, fetchPostByPermlink, fetchCommentsByPermlink } from '@/lib/api/steem';
import { FeedLayout } from '@/components/layout/FeedLayout';

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

  // PostEditor already broadcast the reply; optimistically append a
  // synthesized comment built from the known author/permlink/body instead of
  // refetching (the chain API may not have indexed the comment yet).
  const handleNewComment = (result: PostEditorResult) => {
    if (!post) return;
    const newComment: Post = {
      author: result.author,
      permlink: result.permlink,
      category: post.category,
      title: '',
      body: result.body,
      created: new Date().toISOString(),
      net_rshares: '0',
      children: 0,
      parent_author: result.parentAuthor,
      parent_permlink: result.parentPermlink,
      depth: 1,
      active_votes: [],
      pending_payout_value: '0.000 SBD',
    };
    setComments((prevComments) => [...prevComments, newComment]);
  };

  // PostEditor already broadcast the edit; update the comment body in place.
  const handleEditComment = (author: string, commentPermlink: string, body: string) => {
    setComments((prevComments) =>
      prevComments.map((c) =>
        c.author === author && c.permlink === commentPermlink ? { ...c, body } : c
      )
    );
  };

  if (loading) {
    return (
      <FeedLayout centerClassName="md:max-w-4xl">
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </FeedLayout>
    );
  }

  if (error || !post) {
    return (
      <FeedLayout centerClassName="md:max-w-4xl">
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-destructive">{error || "Post not found"}</p>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout centerClassName="md:max-w-4xl">
      <PostFull post={post} />
      <CommentsList
        comments={comments}
        postAuthor={post.author}
        postPermlink={post.permlink}
        postCategory={post.category}
        onReply={handleNewComment}
        onEdit={handleEditComment}
      />
    </FeedLayout>
  );
}

