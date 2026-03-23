"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const FEED_LINKS: { href: string; label: string }[] = [
  { href: "/trending", label: "Trending" },
  { href: "/hot", label: "Hot" },
  { href: "/created", label: "New" },
  { href: "/promoted", label: "Promoted" },
  { href: "/payout", label: "Payout" },
  { href: "/payout_comments", label: "Comment payout" },
  { href: "/muted", label: "Muted" },
];

/** Usernames that must not be treated as profile paths (aligned with proxy.ts). */
const RESERVED_USERNAMES = new Set(
  [
    "trending",
    "hot",
    "created",
    "payout",
    "payout_comments",
    "muted",
    "login",
    "search",
    "submit",
    "about",
    "faq",
    "privacy",
    "support",
    "tos",
    "communities",
    "tags",
    "rewards",
    "roles",
    "welcome",
    "api",
    "_next",
  ].map((s) => s.toLowerCase())
);

const PROFILE_SECTIONS: { segment: string; label: string }[] = [
  { segment: "blog", label: "Blog" },
  { segment: "posts", label: "Posts" },
  { segment: "comments", label: "Comments" },
  { segment: "replies", label: "Replies" },
  { segment: "payout", label: "Payout" },
  { segment: "feed", label: "Feed" },
  { segment: "followers", label: "Followers" },
  { segment: "followed", label: "Following" },
  { segment: "notifications", label: "Notifications" },
  { segment: "communities", label: "Communities" },
  { segment: "settings", label: "Settings" },
];

function parseProfileUsername(pathname: string): string | null {
  const one = pathname.match(/^\/@([^/]+)$/);
  if (one) {
    const u = one[1];
    if (!RESERVED_USERNAMES.has(u.toLowerCase())) return u;
    return null;
  }
  const two = pathname.match(/^\/@([^/]+)\/([^/]+)$/);
  if (two) {
    const u = two[1];
    const seg = two[2].toLowerCase();
    if (RESERVED_USERNAMES.has(u.toLowerCase())) return null;
    if (PROFILE_SECTIONS.some((s) => s.segment === seg)) return u;
    return null;
  }
  return null;
}

function profileSectionHref(username: string, segment: string) {
  if (segment === "blog") return `/@${username}`;
  return `/@${username}/${segment}`;
}

function isProfileSectionActive(
  pathname: string,
  username: string,
  segment: string
) {
  const blogRoot = `/@${username}`;
  const blogExplicit = `/@${username}/blog`;
  if (segment === "blog") {
    return pathname === blogRoot || pathname === blogExplicit;
  }
  return pathname === profileSectionHref(username, segment);
}

export function PrimaryNavigation({
  pathname,
  compact = false,
}: {
  pathname: string;
  compact?: boolean;
}) {
  const profileUsername = useMemo(
    () => parseProfileUsername(pathname),
    [pathname]
  );

  return (
    <nav
      id="appNavigation"
      className={cn(
        "App__navigation flex flex-col gap-1",
        compact ? "text-sm" : "text-sm md:text-base"
      )}
      aria-label="Primary feeds"
    >
      <p className="mb-2 font-bold text-foreground">Feeds</p>
      <ul className="flex flex-col gap-0.5">
        {FEED_LINKS.map(({ href, label }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "block rounded-md px-2 py-1.5 font-medium text-foreground transition-colors hover:bg-accent/80 hover:text-accent-foreground",
                  active && "bg-accent font-semibold text-accent-foreground"
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {profileUsername ? (
        <>
          <p className="mb-2 mt-6 font-bold text-foreground">Account</p>
          <p className="mb-1 truncate px-2 text-xs text-muted-foreground">
            @{profileUsername}
          </p>
          <ul className="flex flex-col gap-0.5">
            {PROFILE_SECTIONS.map(({ segment, label }) => {
              const href = profileSectionHref(profileUsername, segment);
              const active = isProfileSectionActive(
                pathname,
                profileUsername,
                segment
              );
              return (
                <li key={segment}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-md px-2 py-1.5 font-medium text-foreground transition-colors hover:bg-accent/80 hover:text-accent-foreground",
                      active && "bg-accent font-semibold text-accent-foreground"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </nav>
  );
}
