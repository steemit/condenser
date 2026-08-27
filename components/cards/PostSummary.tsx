"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, MessageCircle, Pin } from "lucide-react";

import type { Post } from "@/lib/api/steem";
import {
  extractImageLink,
  extractBodySummary,
  summaryThumbnail,
  reputation,
} from "@/lib/extract-content";
import Userpic from "@/components/elements/Userpic";
import TimeAgo from "@/components/elements/TimeAgo";
import Reputation from "@/components/elements/Reputation";
import Reblog from "@/components/elements/Reblog";
import Voting from "@/components/elements/Voting";
import { cn } from "@/lib/utils";

interface PostSummaryProps {
  post: Post;
  /** Current sort order (payout order shows payout_at with a prefix). */
  order?: string;
}

/**
 * PostSummary — legacy feed card (PostSummary.jsx, layout-list mode):
 * resteem row / author header / thumbnail left + (title, excerpt, action
 * bar) right / footer with voting, votes, comments and a reblog button.
 */
export default function PostSummary({ post, order }: PostSummaryProps) {
  const [revealNsfw, setRevealNsfw] = useState(false);

  const tags = post.json_metadata?.tags || [];
  const isNsfw = tags.includes("nsfw");
  const gray = Boolean(post.stats?.gray);
  const isPinned = Boolean(post.stats?.is_pinned);
  const powerUp100 = post.percent_steem_dollars === 0;
  const rep = reputation(post.author_reputation);

  // Community posts: display the community title instead of the hive- id.
  const isCommunity = post.category?.startsWith("hive-");
  const categoryLabel =
    isCommunity && post.community_title ? post.community_title : post.category;

  const postUrl = `/${post.category}/@${post.author}/${post.permlink}`;
  const tagUrl = `/trending/${post.category}`;

  const imageLink = gray
    ? null
    : extractImageLink(post.json_metadata, post.body);
  const thumb = summaryThumbnail(imageLink);
  // Feed cards are top-level posts, so legacy passes strip_quotes=false.
  const summary = extractBodySummary(post.body || "");

  const rebloggedBy: string[] = Array.isArray(post.reblogged_by)
    ? post.reblogged_by
    : [];
  const totalVotes = post.stats?.total_votes ?? post.active_votes?.length ?? 0;

  // NSFW warn preference: show a warning bar until the user reveals it.
  if (isNsfw && !revealNsfw) {
    return (
      <li className="list-none rounded-[6px] border border-border bg-card px-2 py-3 min-[760px]:px-2 min-[760px]:py-1">
        <div className="py-2 text-[15px] text-muted-foreground">
          This post is <span className="font-semibold text-[#ff0264]">nsfw</span>
          .{" "}
          <button
            type="button"
            className="text-accent-foreground underline"
            onClick={() => setRevealNsfw(true)}
          >
            Reveal it
          </button>{" "}
          or adjust your display preferences.
        </div>
      </li>
    );
  }

  return (
    <li
      className={cn(
        // Legacy li: padding 0.1em 0.5em 0; teal hover shadow at MQ(L).
        "list-none rounded-[6px] border border-border bg-card px-2 pb-1 pt-0.5",
        "min-[1200px]:transition-shadow min-[1200px]:hover:shadow-[2px_2px_3px_0_#06D6A9]"
      )}
    >
      <div className="articles__summary">
        {rebloggedBy.length > 0 && (
          <div className="flex items-center gap-1 py-1 text-[13px] text-muted-foreground min-[760px]:text-[14px]">
            <Reblog author={post.author} permlink={post.permlink} iconOnly />
            <span>
              <Link prefetch={false}
                href={`/@${rebloggedBy[0]}`}
                className="font-semibold text-muted-foreground hover:text-accent-foreground"
              >
                {rebloggedBy[0]}
              </Link>{" "}
              resteemed
            </span>
          </div>
        )}

        {/* summary-header: avatar + author + rep + "in #tag ·" + time */}
        <div className="flex items-center border-transparent py-0.5 text-[14px]">
          <Link prefetch={false} href={`/@${post.author}`} className="mr-2 shrink-0">
            <Userpic account={post.author} className="!h-6 !w-6" />
          </Link>
          <span className="min-w-0 truncate">
            <Link prefetch={false}
              href={`/@${post.author}`}
              className="font-bold text-foreground hover:text-accent-foreground min-[760px]:text-[16px]"
            >
              {post.author}
            </Link>{" "}
            {rep !== null && <Reputation value={rep} />}{" "}
            <span className="text-muted-foreground">
              in{" "}
              <Link prefetch={false}
                href={tagUrl}
                className="text-muted-foreground hover:text-accent-foreground"
              >
                #{categoryLabel}
              </Link>{" "}
              •{" "}
              {order === "payout" || order === "payout_comments" ? (
                <TimeAgo date={post.payout_at || post.created} prefix="payout " />
              ) : (
                <TimeAgo date={post.created} />
              )}
            </span>
            {powerUp100 && (
              <span title="100% Steem Power payout" className="ml-1 align-middle">
                ⚡
              </span>
            )}
            {isPinned && (
              <span className="ml-1 inline-flex items-center gap-0.5 rounded border border-accent-foreground px-1 py-px text-[11px] text-accent-foreground">
                <Pin className="size-3" />
                Pinned
              </span>
            )}
          </span>
        </div>

        {/* content: stacked on small screens (image full-width above the
            text); thumbnail left + text right at ≥760px — legacy wraps all
            layout-list card rules in @media(min-width:47.5em) */}
        <div
          className={cn(
            "articles__content min-[760px]:flex min-[760px]:items-start",
            gray && "opacity-50"
          )}
        >
          {thumb && (
            <div className="articles__content-block articles__content-block--img min-[760px]:mr-[14px] min-[760px]:shrink-0">
              <Link prefetch={false}
                href={postUrl}
                className="mb-2 block overflow-hidden min-[760px]:mb-0 min-[760px]:h-[77px] min-[760px]:w-[130px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt=""
                  loading="lazy"
                  className="h-auto w-full min-[760px]:h-[77px] min-[760px]:w-[130px] min-[760px]:object-cover"
                />
              </Link>
            </div>
          )}
          <div className="articles__content-block articles__content-block--text min-w-0 flex-1">
            {/* legacy h2: 16px / line-clamp 3 on small screens,
                15px / clamp 1 at ≥760px */}
            <h2 className="articles__h2 line-clamp-3 text-[16px] font-bold leading-snug min-[760px]:truncate min-[760px]:text-[15px]">
              {isNsfw && (
                <span className="mr-1 rounded-[3px] border border-[#ff0264] px-[5px] py-[2px] align-middle font-[Arial] text-[75%] text-[#ff0264]">
                  nsfw
                </span>
              )}
              <Link prefetch={false}
                href={postUrl}
                className="text-foreground visited:text-muted-foreground"
              >
                {post.title || "Untitled"}
              </Link>
            </h2>
            {/* legacy PostSummary__body: the excerpt itself is a link */}
            {summary && (
              <div className="PostSummary__body pb-[0.15rem] text-[0.9rem] leading-[1.4] text-foreground min-[760px]:truncate">
                <Link prefetch={false}
                  href={postUrl}
                  className="block text-foreground min-[760px]:inline"
                >
                  {summary}
                </Link>
              </div>
            )}
            {/* legacy articles__footer lives inside the text block, right
                under the excerpt */}
            <div className="articles__footer mt-[0.25em] border-t border-border">
              {/* legacy order: Voting | votes (pr-4, border-r) | comments
                  (px-4) | reblog (pl-4, border-l) — no ml-auto spacer */}
              <div className="articles__summary-footer flex items-center px-1 pb-1 pt-[3px] text-[15px]">
                <Voting post={post} showList={false} />
                <span
                  className="flex items-center gap-1 border-r border-border pr-4 text-muted-foreground"
                  title={`${totalVotes} votes`}
                >
                  <ChevronUp className="size-4" aria-hidden />
                  {totalVotes}
                </span>
                <Link prefetch={false}
                  href={`${postUrl}#comments`}
                  className="flex items-center gap-1 px-4 text-muted-foreground hover:text-accent-foreground"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  {post.children ?? 0}
                </Link>
                <span className="border-l border-border pl-4">
                  <Reblog author={post.author} permlink={post.permlink} iconOnly />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
