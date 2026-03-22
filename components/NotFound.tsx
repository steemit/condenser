"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { NotFoundView } from "@/components/NotFoundView";

const notFoundFeed = (
  <FeedLayout centerClassName="md:max-w-2xl">
    <NotFoundView />
  </FeedLayout>
);

type NotFoundVariant = "global" | "embedded";

/**
 * 404 UI: same chrome as `/404` when possible.
 * - `global`: root `not-found.tsx` (outside `(main)` — add AppShell + FeedLayout).
 * - `embedded`: under `(main)` AppShell — only FeedLayout + view.
 */
export default function NotFound({
  variant = "embedded",
}: {
  variant?: NotFoundVariant;
}) {
  if (variant === "global") {
    return <AppShell>{notFoundFeed}</AppShell>;
  }
  return notFoundFeed;
}
