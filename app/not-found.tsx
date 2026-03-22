import type { Metadata } from "next";

import NotFound from "@/components/NotFound";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

/**
 * Global Next.js not-found (no `(main)` layout). Uses full AppShell + FeedLayout
 * so it matches `/404` visually.
 */
export default function GlobalNotFoundPage() {
  return <NotFound variant="global" />;
}
