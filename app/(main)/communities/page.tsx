"use client";

import { useEffect } from "react";

import { FeedLayout } from "@/components/layout/FeedLayout";
import { useAppDispatch } from "@/store/hooks";
import { setPathname } from "@/store/slices/globalSlice";

/**
 * Communities index — stub until full communities UI is ported from legacy.
 */
export default function CommunitiesPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPathname("/communities"));
  }, [dispatch]);

  return (
    <FeedLayout>
      <header className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground md:text-3xl">
          Communities
        </h1>
        <p className="mt-2 text-muted-foreground">
          Community discovery and management will appear here.
        </p>
      </header>
    </FeedLayout>
  );
}
