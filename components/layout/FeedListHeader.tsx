"use client";

import { FeedSortDropdown } from "@/components/layout/FeedSortDropdown";
import { cn } from "@/lib/utils";

/**
 * Feed column header — legacy PostsIndex articles__header:
 * title (e.g. All posts) + SortOrder dropdown.
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
    <header className={cn("mb-0", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {unmoderatedTagHint ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Unmoderated tag
            </p>
          ) : null}
        </div>
        <div className="shrink-0 sm:mt-1 sm:w-[200px]">
          <FeedSortDropdown sort={sort} categoryTag={categoryTag} />
        </div>
      </div>
      <hr className="my-4 border-border" />
    </header>
  );
}
