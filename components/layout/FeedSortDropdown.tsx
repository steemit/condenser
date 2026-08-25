"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * Feed sort keys — aligned with legacy SortOrder (vertical):
 * Trending / Hot / New / Payouts / Muted. The /promoted and
 * /payout_comments routes still exist but are not offered here (legacy
 * does not list them). Labels come from legacy message keys.
 */
const SORT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "trending", labelKey: "main_menu.trending" },
  { value: "hot", labelKey: "main_menu.hot" },
  { value: "created", labelKey: "g.new" },
  { value: "payout", labelKey: "g.payouts" },
  { value: "muted", labelKey: "g.muted" },
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
  const t = useTranslations();
  const normalized = sort.toLowerCase();
  // Unknown sorts (promoted / payout_comments) fall back to "trending" in
  // the dropdown, exactly like legacy when the sort isn't in the list.
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
        {t("post_jsx.sort_order")}
      </label>
      <div className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
        <ChevronDownIcon className="size-4" aria-hidden />
      </div>
      <select
        id="feed-sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none border border-input bg-card py-2 pl-3 pr-9 text-sm text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
