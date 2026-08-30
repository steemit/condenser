"use client";

import { usePathname } from "next/navigation";

import { PrimaryNavigation } from "@/components/layout/PrimaryNavigation";
import { FeedSidebarWidgets } from "@/components/layout/FeedSidebarWidgets";
import { cn } from "@/lib/utils";

export function FeedLayout({
  children,
  className,
  centerClassName,
  banner,
  hideRightRail = false,
}: {
  children: React.ReactNode;
  /** Optional class on the outer row (e.g. align with legacy full-width sections). */
  className?: string;
  /** Override center column max-width (default matches Legacy layout-list feed ~1056px; card grid used 664px). */
  centerClassName?: string;
  /** Full-bleed content rendered above the columns (legacy UserProfile banner). */
  banner?: React.ReactNode;
  /** Render the right rail as an empty column (legacy profile pages: c-sidebar--right is an empty aside). */
  hideRightRail?: boolean;
}) {
  const pathname = usePathname();

  // Breakpoints follow legacy _layout.scss: M = 760px (left sidebar),
  // L = 1200px (right sidebar). Margins/padding are legacy 1em (16px).
  return (
    <div className="w-full">
      {/* Full-bleed banner sits outside the max-width grid and reaches the
          viewport edges; -mt-4 cancels AppShell's main top padding so it
          stays flush with the header like legacy. */}
      {banner ? <div className="-mt-4">{banner}</div> : null}
      <div
        className={cn(
          "mx-auto grid w-full max-w-[1600px] grid-cols-1 min-[760px]:grid-cols-[240px_minmax(0,1fr)] min-[1200px]:grid-cols-[240px_minmax(0,1fr)_320px]",
          banner && "mt-4",
          className
        )}
      >
        {/* Column is 240px; width shrinks by the 1rem left margin so the
            sidebar does not overflow into the center column (legacy 1em
            margin was outside the float column, not inside a grid track). */}
        <aside className="hidden min-[760px]:ml-4 min-[760px]:block min-[760px]:w-[calc(100%-1rem)]">
          <div className="sticky top-20">
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

        {/* Legacy right rail is not sticky (modules fade in at page load).
            Profile pages keep the column but render it empty (legacy
            c-sidebar--right is an empty aside), so the center column stays
            in the same place. */}
        <aside className="hidden min-[1200px]:mr-4 min-[1200px]:block min-[1200px]:w-[calc(100%-1rem)]">
          {!hideRightRail ? (
            <div className="py-1">
              <FeedSidebarWidgets />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
