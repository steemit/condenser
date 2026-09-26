"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import SearchContent from "./SearchContent";
import { FeedLayout } from "@/components/layout/FeedLayout";

/**
 * Search page
 * Route: /search?q=query&s=sort
 * Equivalent to old route: SearchIndex
 */
export default function SearchPage() {
  const t = useTranslations();
  return (
    <Suspense
      fallback={
        <FeedLayout centerClassName="md:max-w-4xl lg:max-w-6xl">
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <p className="text-muted-foreground">{t("g.loading")}...</p>
          </div>
        </FeedLayout>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
