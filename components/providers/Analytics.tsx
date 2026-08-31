"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useAppSelector } from "@/store/hooks";
import { routeTagForPath } from "@/lib/analytics/route-tags";
import { recordActivityTracker, recordRouteTag } from "@/lib/analytics/overseer";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Comma-separated campaign hash whitelist (legacy config activity_tag). */
const ACTIVITY_TAGS = (process.env.NEXT_PUBLIC_ACTIVITY_TAGS ?? "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

/**
 * Analytics wiring (legacy PageViewsCounter + SagaShared recordRouteTag +
 * Main.js ActivityTracker):
 * - on every route change: gtag page_view (when GA is enabled) and an
 *   overseer "route" collect via recordRouteTag;
 * - on mount: if the URL hash matches a whitelisted activity tag, record an
 *   activity_tracker visit.
 */
export function Analytics() {
  const pathname = usePathname();
  const trackingId = useAppSelector((s) => s.user.trackingId);
  const isLogin = useAppSelector((s) => Boolean(s.user.current?.username));
  const activityFired = useRef(false);

  // Route views. Route tags wait for the session-hydrated trackingId so
  // anonymous visits are attributed to their session uid like legacy SSR.
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: pathname });
    }
    if (!trackingId) return;
    const info = routeTagForPath(pathname);
    if (info) recordRouteTag(trackingId, info.tag, info.params, isLogin);
  }, [pathname, trackingId, isLogin]);

  // Campaign activity tracking from the URL hash (runs once per page load).
  useEffect(() => {
    if (activityFired.current || !trackingId) return;
    const hash = window.location.hash.slice(1);
    if (!hash || !ACTIVITY_TAGS.includes(hash)) return;
    activityFired.current = true;
    recordActivityTracker({
      trackingId,
      activityTag: hash,
      pathname: window.location.pathname,
      referrer: document.referrer,
    });
  }, [trackingId]);

  return null;
}
