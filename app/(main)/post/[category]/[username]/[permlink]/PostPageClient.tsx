'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { normalizeUsername, formatUsername } from '@/lib/utils/username';
import PostFull from '@/components/cards/PostFull';
import CommentsList from '@/components/cards/CommentsList';
import AdSwipe from '@/components/elements/AdSwipe';
import TronAd from '@/components/elements/TronAd';
import { BOTTOM_AD_LIST, tronAdsConfig } from '@/lib/ads';
import { PostEditorResult } from '@/components/elements/PostEditor';
import { PostDetailSkeleton } from '@/components/elements/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Post, fetchPostByPermlink, fetchCommentsByPermlink } from '@/lib/api/steem';
import { broadcastDeleteComment } from '@/lib/api/broadcast';
import { userActionRecord } from '@/lib/analytics/overseer';
import { FeedLayout } from '@/components/layout/FeedLayout';

/**
 * Post page client content (with category).
 * Rendered by the server page shell in ./page.tsx, which owns
 * generateMetadata; this component keeps the original client-side
 * fetch/render behaviour.
 */
export default function PostPageClient() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const trackingId = useAppSelector((s) => s.user.trackingId);
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

  // Comment.tsx already confirmed with the user. Legacy Comment.jsx
  // deletePost: record the action, broadcast delete_comment to the chain,
  // then drop the comment from local state.
  const handleDeleteComment = async (author: string, commentPermlink: string) => {
    userActionRecord('delete_comment', {
      username: author,
      comment_type: 'reply',
      permlink: commentPermlink,
    });
    try {
      await broadcastDeleteComment({ author, permlink: commentPermlink });
      setComments((prevComments) =>
        prevComments.filter(
          (c) => !(c.author === author && c.permlink === commentPermlink)
        )
      );
    } catch (err) {
      console.error('Delete comment broadcast error:', err);
      alert('Failed to delete the comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <FeedLayout>
        {/* Skeleton keeps the breadcrumb row + content column at their
            final positions, so the page doesn't jump when data arrives. */}
        <header className="mb-4 min-[760px]:mb-[10px] min-[760px]:pl-2">
          <div className="flex h-10 items-center">
            <Skeleton className="h-4 w-48" />
          </div>
        </header>
        <PostDetailSkeleton />
      </FeedLayout>
    );
  }

  if (error || !post) {
    return (
      <FeedLayout>
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-destructive">{error || "Post not found"}</p>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      {/* Breadcrumb row — same spacing/height as the feed pages' sort
          header (FeedListHeader: mb-4/10px + h-10 dropdown) so the article
          and feed columns start at the same visual offset. */}
      <header className="mb-4 min-[760px]:mb-[10px] min-[760px]:pl-2">
        <nav
          aria-label="Breadcrumb"
          className="flex h-10 items-center gap-2 text-sm text-muted-foreground"
        >
          <Link
            href={`/trending/${encodeURIComponent(post.category)}`}
            className="shrink-0 font-semibold hover:text-accent-foreground"
          >
            #{post.category}
          </Link>
          <span aria-hidden>/</span>
          <span className="min-w-0 truncate" aria-current="page">
            {post.title || "Untitled"}
          </span>
        </nav>
      </header>
      <PostFull post={post} />
      {/* Legacy Post.jsx bottom ads sit right below the article body, above
          the comments; width follows the article card (full content column). */}
      <div className="mt-2 w-full">
        <AdSwipe
          adList={BOTTOM_AD_LIST}
          trackingId={trackingId}
          direction="vertical"
        />
        {tronAdsConfig.enabled && tronAdsConfig.contentPcPid && (
          <TronAd
            trackingId={trackingId}
            wrapperName="tron_ad_pc"
            pid={tronAdsConfig.contentPcPid}
            adTag="tron_ad_pc"
            ratioClass="ratio-10-1"
            env={tronAdsConfig.env}
            isMock={tronAdsConfig.isMock}
          />
        )}
        {tronAdsConfig.enabled && tronAdsConfig.contentMobilePid && (
          <TronAd
            trackingId={trackingId}
            wrapperName="tron_ad_mobile"
            pid={tronAdsConfig.contentMobilePid}
            adTag="tron_ad_mobile"
            ratioClass="ratio-375-80"
            env={tronAdsConfig.env}
            isMock={tronAdsConfig.isMock}
          />
        )}
      </div>
      <CommentsList
        comments={comments}
        postAuthor={post.author}
        postPermlink={post.permlink}
        postCategory={post.category}
        onReply={handleNewComment}
        onEdit={handleEditComment}
        onDelete={handleDeleteComment}
      />
    </FeedLayout>
  );
}
