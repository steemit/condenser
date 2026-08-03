"use client";

import { FeedSortDropdown } from "@/components/layout/FeedSortDropdown";
import { cn } from "@/lib/utils";

/**
 * Feed column header — legacy PostsIndex articles__header:
 * h1 (18px bold, only shown ≥1200px) + SortOrder dropdown.
 */
export function FeedListHeader({
  sort,
  categoryTag,
  unmoderatedTagHint,
  className,
}: {
  sort: string;
  categoryTag?: string;
  /** Show when viewing a non-community tag (legacy “Unmoderated tag”) */
  unmoderatedTagHint?: boolean;
  className?: string;
}) {
  return (
    // Legacy spacing: header padding-bottom 10px; articles__hr is
    // display:none in layout-list (a later SCSS rule overrides the MQ(M)
    // display:block), so no <hr> is rendered.
    <header className={cn("mb-4 min-[760px]:mb-[10px] min-[760px]:pl-2", className)}>
      {/* legacy articles__header: flex, align-items center, space-between */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {/* legacy h1.articles__h1 removed: redundant with the sort dropdown */}
          {unmoderatedTagHint ? (
            <p className="mt-1 hidden text-[80%] text-muted-foreground min-[1200px]:block">
              Unmoderated tag
            </p>
          ) : null}
        </div>
        <div className="shrink-0 sm:w-[300px] sm:max-w-[300px]">
          <FeedSortDropdown sort={sort} categoryTag={categoryTag} />
        </div>
      </div>
    </header>
  );
}
