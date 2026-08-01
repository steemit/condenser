"use client";

import { FeedSortDropdown } from "@/components/layout/FeedSortDropdown";
import { cn } from "@/lib/utils";

/**
 * Feed column header — legacy PostsIndex articles__header:
 * h1 (18px bold, only shown ≥1200px) + SortOrder dropdown.
 */
export function FeedListHeader({
  title,
  sort,
  categoryTag,
  unmoderatedTagHint,
  className,
}: {
  title: string;
  sort: string;
  categoryTag?: string;
  /** Show when viewing a non-community tag (legacy “Unmoderated tag”) */
  unmoderatedTagHint?: boolean;
  className?: string;
}) {
  return (
    <header className={cn("mb-4 min-[760px]:mb-0", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {/* legacy h1.articles__h1 is show-for-mq-large (≥1200px) only */}
          <h1 className="hidden font-sans text-[18px] font-bold text-foreground min-[1200px]:block">
            {title}
          </h1>
          {unmoderatedTagHint ? (
            <p className="mt-1 hidden text-[80%] text-muted-foreground min-[1200px]:block">
              Unmoderated tag
            </p>
          ) : null}
        </div>
        <div className="shrink-0 sm:mt-1 sm:w-[300px] sm:max-w-[300px]">
          <FeedSortDropdown sort={sort} categoryTag={categoryTag} />
        </div>
      </div>
      {/* legacy hr.articles__hr is hidden below the M (760px) breakpoint */}
      <hr className="my-4 hidden border-border min-[760px]:block" />
    </header>
  );
}
