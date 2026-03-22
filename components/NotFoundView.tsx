"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

/**
 * Shared 404 body: typography and actions aligned with Legacy / shadcn tokens.
 * Wrap with FeedLayout (and optionally AppShell for root not-found).
 */
export function NotFoundView() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <h1 className="mb-4 font-sans text-8xl font-bold text-muted-foreground/40 md:text-9xl">
        404
      </h1>
      <h2 className="mb-4 font-sans text-2xl font-bold text-foreground md:text-3xl">
        Page Not Found
      </h2>
      <p className="mb-8 max-w-md text-lg text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button nativeButton={false} render={<Link href="/trending" />}>
          Go to Trending
        </Button>
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>

      <div className="mt-10 w-full border-t border-border pt-8">
        <p className="mb-4 text-sm text-muted-foreground">
          You might be looking for:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            nativeButton={false}
            render={<Link href="/trending" />}
          >
            Trending
          </Button>
          <Button
            variant="secondary"
            size="sm"
            nativeButton={false}
            render={<Link href="/search" />}
          >
            Search
          </Button>
          <Button
            variant="secondary"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
