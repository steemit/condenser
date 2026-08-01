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
import { cn } from "@/lib/utils";

interface PostSummaryProps {
  post: Post;
  /** Current sort order (payout order shows payout_at with a prefix). */
  order?: string;
}

/** "$12.34" from "12.345 SBD" (legacy FormattedAsset). */
function formatPayout(value?: string): string | null {
  if (!value) return null;
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return null;
  return `$${amount.toFixed(2)}`;
}

/**
 * PostSummary — legacy feed card (PostSummary.jsx, layout-list mode):
 * resteem row / author header / thumbnail + title + body excerpt / footer
 * with payout, votes, comments and a reblog button.
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
  const summary = extractBodySummary(post.body || "", true);

  const rebloggedBy: string[] = Array.isArray(post.reblogged_by)
    ? post.reblogged_by
    : [];
  const totalVotes = post.stats?.total_votes ?? post.active_votes?.length ?? 0;
  const payout = formatPayout(post.pending_payout_value);

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
        "list-none rounded-[6px] border border-border bg-card px-2 py-3",
        "min-[760px]:px-2 min-[760px]:pb-1 min-[760px]:pt-0.5",
        "min-[1200px]:transition-shadow min-[1200px]:hover:shadow-[2px_2px_3px_0_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="articles__summary">
        {rebloggedBy.length > 0 && (
          <div className="flex items-center gap-1 py-1 text-[13px] text-muted-foreground min-[760px]:text-[14px]">
            <Reblog author={post.author} permlink={post.permlink} iconOnly />
            <span>
              <Link
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
          <Link href={`/@${post.author}`} className="mr-2 shrink-0">
            <Userpic account={post.author} className="!h-6 !w-6" />
          </Link>
          <span className="min-w-0 truncate">
            <Link
              href={`/@${post.author}`}
              className="font-bold text-foreground hover:text-accent-foreground min-[760px]:text-[16px]"
            >
              {post.author}
            </Link>{" "}
            {rep !== null && <Reputation value={rep} />}{" "}
            <span className="text-muted-foreground">
              in{" "}
              <Link
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

        {/* content: thumbnail + title/excerpt */}
        <div
          className={cn(
            "articles__content mt-1",
            gray && "opacity-50",
            "min-[760px]:flex min-[760px]:items-start"
          )}
        >
          {thumb && (
            <Link
              href={postUrl}
              className={cn(
                "mb-2 block overflow-hidden",
                "min-[760px]:mr-[14px] min-[760px]:mb-0 min-[760px]:inline-block min-[760px]:h-[77px] min-[760px]:w-[130px] min-[760px]:shrink-0"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt=""
                loading="lazy"
                className="max-h-[220px] w-full object-cover min-[760px]:h-[77px] min-[760px]:w-[130px]"
              />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="articles__h2 truncate text-[15px] font-bold leading-snug">
              {isNsfw && (
                <span className="mr-1 rounded-[3px] border border-[#ff0264] px-[5px] py-[2px] align-middle font-[Arial] text-[75%] text-[#ff0264]">
                  nsfw
                </span>
              )}
              <Link
                href={postUrl}
                className="text-foreground visited:text-muted-foreground hover:text-accent-foreground"
              >
                {post.title || "Untitled"}
              </Link>
            </h2>
            {summary && (
              <div className="PostSummary__body truncate text-[15px] leading-[1.4] text-muted-foreground">
                {summary}
              </div>
            )}
          </div>
        </div>

        {/* footer: payout + votes + comments + reblog */}
        <div className="articles__footer mt-1 border-t border-border">
          <div className="articles__summary-footer flex items-center py-1 text-[15px]">
            {payout && (
              <span className="border-r border-border py-0.5 pr-3 font-semibold text-muted-foreground">
                {payout}
              </span>
            )}
            <span className="flex items-center gap-0.5 border-r border-border px-3 py-0.5 text-muted-foreground">
              <ChevronUp className="size-4" aria-hidden />
              {totalVotes}
            </span>
            <Link
              href={`${postUrl}#comments`}
              className="flex items-center gap-1 px-3 py-0.5 text-muted-foreground hover:text-accent-foreground"
            >
              <MessageCircle className="size-4" aria-hidden />
              {post.children ?? 0}
            </Link>
            <span className="ml-auto">
              <Reblog author={post.author} permlink={post.permlink} iconOnly />
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
