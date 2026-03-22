"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Post } from "@/lib/api/steem";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

interface PostsListProps {
  posts: Post[];
  loading?: boolean;
  onLoadMore?: () => void;
  category?: string;
  order?: string;
}

/**
 * Posts list with Legacy-style summary cards (border, hover shadow on md+).
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

    return () => {
      if (scrollListenerRef.current) {
        window.removeEventListener("scroll", scrollListenerRef.current);
      }
      clearTimeout(scrollTimeout);
    };
  }, [posts.length, onLoadMore]);

  const sortForTag = order?.trim() ? order : "trending";
  void category;

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  return (
    <div id="posts_list" ref={listRef} className="flex flex-col gap-10">
      <ul className="flex flex-col gap-10">
        {posts.map((post) => (
          <li key={`${post.author}/${post.permlink}`} className="list-none">
            <Card
              className="rounded-[var(--radius)] border-transparent bg-transparent py-0 shadow-none md:border-border md:bg-card md:shadow-none md:transition-shadow md:duration-200 md:hover:shadow-[0px_5px_10px_0_rgba(0,0,0,0.03)]"
              size="sm"
            >
              <CardHeader className="flex flex-col gap-1 border-0 px-0 py-2 md:border-b md:border-border md:px-4 md:py-2.5">
                <h3 className="text-base font-semibold leading-snug text-foreground">
                  <Link
                    href={`/${post.category}/@${post.author}/${post.permlink}`}
                    className="text-foreground transition-colors hover:text-accent-foreground"
                  >
                    {post.title || "Untitled"}
                  </Link>
                </h3>
              </CardHeader>
              <CardContent className="px-0 py-1 text-sm md:px-4">
                <p className="text-muted-foreground">
                  by{" "}
                  <Link
                    href={`/@${post.author}`}
                    className="text-foreground hover:text-accent-foreground"
                  >
                    @{post.author}
                  </Link>{" "}
                  in{" "}
                  <Link
                    href={`/${sortForTag}/${post.category}`}
                    className="text-foreground hover:text-accent-foreground"
                  >
                    #{post.category}
                  </Link>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(post.created).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {loading && posts.length > 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <p className="text-muted-foreground">Loading more...</p>
        </div>
      ) : null}
    </div>
  );
}
