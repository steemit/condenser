import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder matching the PostSummary card shape (avatar + header line,
 * thumbnail + title/excerpt, footer bar), shown while the feed loads and
 * replaced by real cards once data arrives.
 */
export function PostSummarySkeleton() {
  return (
    <li className="list-none rounded-[6px] border border-border bg-card px-2 pb-1 pt-0.5">
      <div className="flex items-center gap-2 py-0.5">
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <Skeleton className="h-3.5 w-44" />
      </div>
      <div className="flex items-start gap-[14px] py-1">
        <Skeleton className="hidden h-[77px] w-[130px] shrink-0 min-[760px]:block" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </li>
  );
}

/**
 * Placeholder matching the post detail card shape exactly (PostFull:
 * bordered card → 54rem centered header with h1 title + 48px avatar/author
 * rows → body → tag pills → split footer), so nothing jumps on load.
 */
export function PostDetailSkeleton() {
  return (
    <div className="rounded-[6px] border border-border bg-card px-4 pb-4 pt-8">
      {/* PostFull__header: title first, then avatar + author/time rows */}
      <div className="mx-auto max-w-[54rem] border-b border-border">
        <Skeleton className="h-9 w-3/4" />
        <div className="my-4 flex items-center">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="ml-3 space-y-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>
      </div>

      {/* PostFull__body */}
      <div className="mx-auto max-w-[54rem] space-y-2 py-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* TagList pills */}
      <div className="mx-auto mb-2 flex max-w-[54rem] gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* PostFull__footer: voting left, actions right */}
      <div className="mx-auto flex max-w-[54rem] items-center justify-between">
        <div className="flex items-center gap-1">
          <Skeleton className="size-[22px] rounded-full" />
          <Skeleton className="size-[22px] rounded-full" />
          <Skeleton className="ml-1 h-3.5 w-12" />
        </div>
        <Skeleton className="h-3.5 w-32" />
      </div>
    </div>
  );
}
