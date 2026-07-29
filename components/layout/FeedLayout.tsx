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
  /** Override center column max-width (default matches Legacy layout-list feed ~1056px; card grid used 664px). */
  centerClassName?: string;
}) {
  const pathname = usePathname();

  // Breakpoints follow legacy _layout.scss: M = 760px (left sidebar),
  // L = 1200px (right sidebar). Margins/padding are legacy 1em (16px).
  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-[1600px] grid-cols-1 min-[760px]:grid-cols-[240px_minmax(0,1fr)] min-[1200px]:grid-cols-[240px_minmax(0,1fr)_320px]",
        className
      )}
    >
      <aside className="hidden w-[240px] min-w-[240px] max-w-[240px] min-[760px]:block min-[760px]:ml-4">
        <div className="sticky top-20 rounded-[6px] border border-border py-4 pr-1.5">
          <PrimaryNavigation pathname={pathname} />
        </div>
      </aside>

      <article
        className={cn(
          "min-w-0 w-full px-4",
          centerClassName ?? "min-[760px]:max-w-[1056px]",
          "mx-auto"
        )}
      >
        {children}
      </article>

      {/* Legacy right rail is not sticky (modules fade in at page load). */}
      <aside className="hidden w-[320px] min-w-[320px] max-w-[320px] min-[1200px]:block min-[1200px]:mr-4">
        <div className="py-1">
          <FeedSidebarWidgets />
        </div>
      </aside>
    </div>
  );
}
