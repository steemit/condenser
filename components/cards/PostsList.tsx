"use client";

import { useEffect, useRef } from "react";

import { Post } from "@/lib/api/steem";
import PostSummary from "@/components/cards/PostSummary";
import LoadingIndicator from "@/components/elements/LoadingIndicator";

interface PostsListProps {
  posts: Post[];
  loading?: boolean;
  onLoadMore?: () => void;
  category?: string;
  order?: string;
}

/** Legacy PostsIndex empty-state copy (Callout), keyed by order/category. */
function emptyText(order?: string, category?: string): string {
  switch (order) {
    case "payout":
    case "payout_comments":
      return "No pending posts found. This view only shows posts within 12-36 hours of payout.";
    case "muted":
      return "No muted posts found.";
    case "feed":
      return "You haven't followed anyone yet! Explore Trending to find people to follow.";
    default:
      break;
  }
  if (category && category !== "my") return `No posts in #${category} yet!`;
  return "No posts found.";
}

/**
 * Posts list — legacy PostsList: summaries as <li> cards with infinite scroll.
 */
export default function PostsList({
  posts,
  loading = false,
  onLoadMore,
  category,
  order,
}: PostsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || !onLoadMore) return;

      const el = listRef.current;
      const scrollTop =
        window.pageYOffset !== undefined
          ? window.pageYOffset
          : (
              document.documentElement ||
              document.body.parentNode ||
              document.body
            ).scrollTop;

      const threshold = 10;
      const distanceToBottom =
        el.offsetTop + el.offsetHeight - scrollTop - window.innerHeight;

      if (distanceToBottom < threshold && posts.length > 0) {
        onLoadMore();
      }
    };

    let scrollTimeout: ReturnType<typeof setTimeout>;
    scrollListenerRef.current = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 150);
    };

    window.addEventListener("scroll", scrollListenerRef.current, {
      passive: true,
    });
    window.addEventListener("resize", scrollListenerRef.current, {
      passive: true,
    });
    // Legacy fires the listener once on mount so short first pages
    // auto-fetch more.
    scrollListenerRef.current();

    return () => {
      if (scrollListenerRef.current) {
        window.removeEventListener("scroll", scrollListenerRef.current);
        window.removeEventListener("resize", scrollListenerRef.current);
      }
      clearTimeout(scrollTimeout);
    };
  }, [posts.length, onLoadMore]);

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <LoadingIndicator type="circle" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="my-8 rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
        {emptyText(order, category)}
      </div>
    );
  }

  return (
    <div id="posts_list" ref={listRef}>
      <ul className="PostsList__summaries flex flex-col gap-0 min-[760px]:gap-[0.8em]">
        {posts.map((post) => (
          <PostSummary
            key={`${post.author}/${post.permlink}`}
            post={post}
            order={order}
          />
        ))}
      </ul>
      {loading && posts.length > 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <LoadingIndicator type="circle" />
        </div>
      ) : null}
    </div>
  );
}
