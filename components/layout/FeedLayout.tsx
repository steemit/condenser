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
        "mx-auto flex w-full max-w-[1600px] flex-wrap lg:flex-nowrap",
        className
      )}
    >
      <aside className="order-1 hidden w-[240px] min-w-[240px] max-w-[240px] shrink-0 md:block md:pl-4">
        <div className="sticky top-20">
          <PrimaryNavigation pathname={pathname} />
        </div>
      </aside>

      <article
        className={cn(
          "order-2 min-w-[300px] flex-1 px-4 md:px-4",
          centerClassName ?? "md:max-w-[664px]"
        )}
      >
        {children}
      </article>

      <aside className="order-3 hidden w-[320px] min-w-[320px] max-w-[320px] shrink-0 lg:block lg:pr-4">
        <div className="sticky top-20 py-1">
          <FeedSidebarWidgets />
        </div>
      </aside>
    </div>
  );
}
