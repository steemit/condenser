"use client";

import { useEffect } from "react";

import { useAppDispatch } from "@/store/hooks";
import { setPathname } from "@/store/slices/globalSlice";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { NotFoundView } from "@/components/NotFoundView";

/**
 * Explicit /404 route (proxy.ts). Same body as global not-found; AppShell from `(main)`.
 */
export default function Explicit404Page() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPathname("/404"));
  }, [dispatch]);

  return (
    <FeedLayout centerClassName="md:max-w-2xl">
      <NotFoundView />
    </FeedLayout>
  );
}
