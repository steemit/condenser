import { FeedLayout } from "@/components/layout/FeedLayout";
import { NotFoundView } from "@/components/NotFoundView";

/**
 * Explicit /404 route (proxy.ts). Same body as global not-found; AppShell from `(main)`.
 */
export default function Explicit404Page() {
  return (
    <FeedLayout centerClassName="md:max-w-2xl">
      <NotFoundView />
    </FeedLayout>
  );
}
