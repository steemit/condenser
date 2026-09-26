"use client";

import { useParams } from "next/navigation";
import { SortFeed } from "@/components/feed/SortFeed";

/**
 * Sort feed page (legacy PostsIndex with a <sort> param).
 * Route: /[sort] — /trending, /hot, /created, /payout, /payout_comments,
 * /muted, /promoted and their case variants. The feed body lives in the
 * shared SortFeed component (also used by the home page, which renders
 * the trending feed like legacy ResolveRoute.js `/` → PostsIndex
 * ['trending']); /trending itself no longer has a dedicated static page,
 * so this dynamic segment serves it (previously the static page shadowed
 * it and the two implementations drifted).
 */
export default function SortPage() {
  const { sort } = useParams();
  const sortString = (Array.isArray(sort) ? sort[0] : sort) ?? "";
  return <SortFeed sort={sortString} />;
}
