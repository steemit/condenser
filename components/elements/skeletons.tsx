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
 * Placeholder matching the post detail column (PostFull: header with
 * avatar/author, title, body paragraphs, footer bar) at the same 54rem
 * content width.
 */
export function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[54rem]">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="mt-4 h-8 w-2/3" />
      <div className="mt-4 space-y-2 py-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-[22px] rounded-full" />
        <Skeleton className="size-[22px] rounded-full" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-24" />
      </div>
    </div>
  );
}
