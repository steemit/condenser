"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Feed sort keys and labels — aligned with legacy SortOrder (vertical)
 * plus promoted / payout_comments used by this app’s /[sort] routes.
 */
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "hot", label: "Hot" },
  { value: "created", label: "New" },
  { value: "promoted", label: "Promoted" },
  { value: "payout", label: "Payouts" },
  { value: "payout_comments", label: "Comment payout" },
  { value: "muted", label: "Muted" },
];

function sortPath(sort: string, categoryTag?: string) {
  const enc = categoryTag ? encodeURIComponent(categoryTag) : "";
  return categoryTag ? `/${sort}/${enc}` : `/${sort}`;
}

export function FeedSortDropdown({
  sort,
  categoryTag,
  className,
}: {
  sort: string;
  /** Optional tag / community id (e.g. hive-xxxx, bitcoin) */
  categoryTag?: string;
  className?: string;
}) {
  const router = useRouter();
  const normalized = sort.toLowerCase();
  const value = SORT_OPTIONS.some((o) => o.value === normalized)
    ? normalized
    : "trending";
  const onChange = useCallback(
    (next: string) => {
      router.replace(sortPath(next, categoryTag));
    },
    [router, categoryTag]
  );

  return (
    <div className={cn("relative min-w-[160px]", className)}>
      <label className="sr-only" htmlFor="feed-sort-select">
        Sort posts
      </label>
      <div className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
        <ChevronDownIcon className="size-4" aria-hidden />
      </div>
      <select
        id="feed-sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none rounded-md border border-input bg-card py-2 pl-3 pr-9 text-sm font-medium text-foreground shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
