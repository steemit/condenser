"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BookMarkedIcon,
  Building2Icon,
  CompassIcon,
  HeartIcon,
  ListOrderedIcon,
  UserRoundIcon,
  WalletIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getSteemitWalletBaseUrl } from "@/lib/steemitWallet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { showLogin } from "@/store/slices/userSlice";

const GLOBAL_FEED_SORTS = new Set([
  "trending",
  "hot",
  "created",
  "promoted",
  "payout",
  "payout_comments",
  "muted",
]);

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

/** True when viewing global ranked feeds (/trending, /hot/food, …). */
function isAllPostsExplore(pathname: string): boolean {
  const seg = pathname.split("/").filter(Boolean);
  if (seg.length === 0) return false;
  const sort = seg[0].toLowerCase();
  if (!GLOBAL_FEED_SORTS.has(sort)) return false;
  if (seg.length === 1) return true;
  const second = seg[1];
  if (second.startsWith("@")) return false;
  return true;
}

function isCommunitiesRoute(pathname: string) {
  return pathname === "/communities" || pathname.startsWith("/communities/");
}

function isMyFriendsRoute(pathname: string, username: string | undefined) {
  if (!username) return false;
  return (
    pathname === `/@${username}/feed` ||
    pathname.startsWith(`/@${username}/feed/`)
  );
}

function isMySubscriptionsRoute(pathname: string) {
  if (pathname === "/trending/my") return true;
  const m = pathname.match(/^\/(trending|hot|created|promoted|payout|payout_comments|muted)\/(.+)$/);
  if (!m) return false;
  return m[2].toLowerCase() === "my";
}

function isOwnProfileArea(pathname: string, username: string) {
  if (
    pathname === `/@${username}/feed` ||
    pathname.startsWith(`/@${username}/feed/`)
  ) {
    return false;
  }
  if (pathname === `/@${username}` || pathname === `/@${username}/blog`) {
    return true;
  }
  return PROFILE_SECTIONS.some(
    (s) =>
      s.segment !== "feed" &&
      pathname === profileSectionHref(username, s.segment)
  );
}

function NavExploreItem({
  href,
  label,
  icon: Icon,
  active,
  useLoginPrompt,
  onLoginPrompt,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  useLoginPrompt?: boolean;
  onLoginPrompt?: () => void;
}) {
  const className = cn(
    "flex w-full items-center gap-2 rounded-md py-1.5 pl-2 pr-2 text-sm font-medium transition-colors",
    "border-l-[3px] -ml-px",
    active
      ? "border-accent-foreground text-accent-foreground"
      : "border-transparent text-foreground hover:bg-accent/80 hover:text-accent-foreground"
  );
  return (
    <li>
      {useLoginPrompt ? (
        <button type="button" className={className} onClick={onLoginPrompt}>
          <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
          <span>{label}</span>
        </button>
      ) : (
        <Link href={href} className={className}>
          <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
          <span>{label}</span>
        </Link>
      )}
    </li>
  );
}

function NavTopItem({
  href,
  label,
  icon: Icon,
  active,
  external,
  useLoginPrompt,
  onLoginPrompt,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  external?: boolean;
  /** When true, open login modal instead of following `href`. */
  useLoginPrompt?: boolean;
  onLoginPrompt?: () => void;
}) {
  const className = cn(
    "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-accent/90 text-accent-foreground"
      : "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
  );
  if (useLoginPrompt) {
    return (
      <button
        type="button"
        className={cn(className, "w-full text-left")}
        onClick={onLoginPrompt}
      >
        <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
        <span>{label}</span>
      </button>
    );
  }
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
        <span>{label}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
      <span>{label}</span>
    </Link>
  );
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
  const dispatch = useAppDispatch();
  const sessionUser = useAppSelector((s) => s.user.current?.username);
  const walletBase = getSteemitWalletBaseUrl();

  const allPostsActive = isAllPostsExplore(pathname);
  const communitiesActive = isCommunitiesRoute(pathname);
  const myFriendsActive = isMyFriendsRoute(pathname, sessionUser);
  const mySubsActive = isMySubscriptionsRoute(pathname);

  const myProfileTarget = sessionUser ? `/@${sessionUser}/posts` : "";
  const myProfileActive = Boolean(
    sessionUser && isOwnProfileArea(pathname, sessionUser)
  );

  const walletHref = sessionUser
    ? `${walletBase}/@${sessionUser}`
    : walletBase;

  return (
    <nav
      id="appNavigation"
      className={cn(
        "App__navigation flex flex-col gap-5",
        compact ? "text-sm" : "text-sm md:text-base"
      )}
      aria-label="Primary navigation"
    >
      <section aria-labelledby="nav-explore-heading">
        <div
          id="nav-explore-heading"
          className="mb-2 flex items-center gap-2 px-2 font-bold text-accent-foreground"
        >
          <CompassIcon className="size-[1.15rem] shrink-0" aria-hidden />
          <span>Explore</span>
        </div>
        <ul className="ml-1 flex flex-col gap-0.5 border-l border-border pl-2">
          <NavExploreItem
            href="/trending"
            label="All Posts"
            icon={BookMarkedIcon}
            active={allPostsActive}
          />
          <NavExploreItem
            href="/communities"
            label="Communities"
            icon={Building2Icon}
            active={communitiesActive}
          />
          {sessionUser ? (
            <>
              <NavExploreItem
                href={`/@${sessionUser}/feed`}
                label="My Friends"
                icon={HeartIcon}
                active={myFriendsActive}
              />
              <NavExploreItem
                href="/trending/my"
                label="My Subscriptions"
                icon={ListOrderedIcon}
                active={mySubsActive}
              />
            </>
          ) : (
            <>
              <NavExploreItem
                href=""
                label="My Friends"
                icon={HeartIcon}
                active={false}
                useLoginPrompt
                onLoginPrompt={() => dispatch(showLogin({}))}
              />
              <NavExploreItem
                href=""
                label="My Subscriptions"
                icon={ListOrderedIcon}
                active={false}
                useLoginPrompt
                onLoginPrompt={() => dispatch(showLogin({}))}
              />
            </>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-1 border-t border-border pt-4">
        <NavTopItem
          href={myProfileTarget}
          label="My Profile"
          icon={UserRoundIcon}
          active={Boolean(sessionUser) && Boolean(myProfileActive)}
          useLoginPrompt={!sessionUser}
          onLoginPrompt={() => dispatch(showLogin({}))}
        />
        <NavTopItem
          href={walletHref}
          label="My Wallet"
          icon={WalletIcon}
          external
        />
      </section>

      {profileUsername ? (
        <section aria-labelledby="nav-account-heading" className="border-t border-border pt-4">
          <p
            id="nav-account-heading"
            className="mb-2 px-2 font-bold text-foreground"
          >
            Account
          </p>
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
        </section>
      ) : null}
    </nav>
  );
}
