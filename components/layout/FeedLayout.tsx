"use client";

import { usePathname } from "next/navigation";

import { PrimaryNavigation } from "@/components/layout/PrimaryNavigation";
import { FeedSidebarWidgets } from "@/components/layout/FeedSidebarWidgets";
import { cn } from "@/lib/utils";

export function FeedLayout({
  children,
  className,
  centerClassName,
}: {
  children: React.ReactNode;
  /** Optional class on the outer row (e.g. align with legacy full-width sections). */
  className?: string;
  /** Override center column max-width (default matches Legacy articles ~664px). */
  centerClassName?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-[1600px] grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_320px]",
        className
      )}
    >
      <aside className="hidden w-[240px] min-w-[240px] max-w-[240px] md:block md:pl-4">
        <div className="sticky top-20 rounded-lg bg-muted/50 py-4 pr-2">
          <PrimaryNavigation pathname={pathname} />
        </div>
      </aside>

      <article
        className={cn(
          "min-w-0 w-full px-4 md:px-4",
          centerClassName ?? "md:max-w-[664px]",
          "mx-auto"
        )}
      >
        {children}
      </article>

      <aside className="hidden w-[320px] min-w-[320px] max-w-[320px] lg:block lg:pr-4">
        <div className="sticky top-20 py-1">
          <FeedSidebarWidgets />
        </div>
      </aside>
    </div>
  );
}
