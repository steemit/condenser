"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  CompassIcon,
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

/**
 * Second-level items under "My Profile" (legacy ProfileNavigation).
 * Settings is intentionally not in the sidebar; Feed is omitted because it
 * duplicates Explore → My Friends (/@{me}/feed).
 */
const MY_PROFILE_SECTIONS: { segment: string; label: string }[] = [
  { segment: "blog", label: "Blog" },
  { segment: "posts", label: "Posts" },
  { segment: "comments", label: "Comments" },
  { segment: "replies", label: "Replies" },
  { segment: "notifications", label: "Notifications" },
  { segment: "communities", label: "Subscriptions" },
  { segment: "payout", label: "Payouts" },
];

function profileSectionHref(username: string, segment: string) {
  if (segment === "blog") return `/@${username}`;
  return `/@${username}/${segment}`;
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
  // /<sort>/my is the "My Subscriptions" feed, not All Posts.
  if (second.toLowerCase() === "my") return false;
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
  const m = pathname.match(
    /^\/(trending|hot|created|promoted|payout|payout_comments|muted)\/(.+)$/
  );
  if (!m) return false;
  return m[2].toLowerCase() === "my";
}

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

/**
 * Parse the viewed profile username from profile-section URLs
 * (/@user, /@user/blog, /@user/posts, …). Post URLs (/@user/permlink)
 * return null because the permlink is not a known section.
 */
function parseViewedProfileUser(pathname: string): string | null {
  const m = pathname.match(/^\/@([^/]+)(?:\/([^/]+))?\/?$/);
  if (!m) return null;
  const user = m[1];
  if (RESERVED_USERNAMES.has(user.toLowerCase())) return null;
  const seg = m[2];
  if (!seg) return user;
  return PROFILE_SECTION_SEGMENTS.has(seg.toLowerCase()) ? user : null;
}

function isProfileSectionActive(
  pathname: string,
  username: string,
  segment: string
) {
  if (segment === "blog") {
    return pathname === `/@${username}` || pathname === `/@${username}/blog`;
  }
  return pathname === profileSectionHref(username, segment);
}

/** Profile URL segments that are sections, not permlinks (mirrors proxy.ts SECTIONS). */
const PROFILE_SECTION_SEGMENTS = new Set([
  "blog",
  "posts",
  "comments",
  "replies",
  "payout",
  "feed",
  "followers",
  "followed",
  "settings",
  "notifications",
  "communities",
]);

/** True for post detail URLs, with or without a category segment. */
function isPostRoute(pathname: string): boolean {
  // Internal rewrite targets, in case they are visited directly.
  if (/^\/(post|post-no-category)\//.test(pathname)) return true;
  // /category/@user/permlink
  if (/^\/[^/]+\/@[^/]+\/[^/]+/.test(pathname)) return true;
  // /@user/permlink (permlink is anything but a profile section)
  const m = pathname.match(/^\/@[^/]+\/([^/]+)\/?$/);
  if (m && !PROFILE_SECTION_SEGMENTS.has(m[1].toLowerCase())) return true;
  return false;
}

type IconComponent = React.ComponentType<{ className?: string }>;

const pillClass = (active: boolean, extra?: string) =>
  cn(
    "flex w-full items-center gap-2 rounded-md border-l-2 px-2 py-[0.6rem] text-sm transition-colors",
    active
      ? "border-accent-foreground bg-accent font-semibold text-accent-foreground"
      : "border-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
    extra
  );

/** Second-level link/item: indented, iconless, same pill treatment. */
function NavSubItem({
  href,
  label,
  active,
  useLoginPrompt,
  onLoginPrompt,
}: {
  href: string;
  label: string;
  active: boolean;
  useLoginPrompt?: boolean;
  onLoginPrompt?: () => void;
}) {
  const className = pillClass(active, "pl-8");
  return (
    <li>
      {useLoginPrompt ? (
        <button type="button" className={className} onClick={onLoginPrompt}>
          <span>{label}</span>
        </button>
      ) : (
        <Link href={href} className={className}>
          <span>{label}</span>
        </Link>
      )}
    </li>
  );
}

/**
 * First-level collapsible group (legacy PrimaryNavTabs). The header row only
 * toggles expansion — navigation happens through the second-level items.
 */
function NavGroup({
  label,
  icon: Icon,
  active,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  icon: IconComponent;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={pillClass(active, "font-bold")}
      >
        <Icon className="size-[1.15rem] shrink-0" aria-hidden />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 opacity-70 transition-transform",
            expanded && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {expanded ? (
        <ul className="mt-0.5 flex flex-col gap-0.5">{children}</ul>
      ) : null}
    </section>
  );
}

export function PrimaryNavigation({ pathname }: { pathname: string }) {
  const dispatch = useAppDispatch();
  const sessionUser = useAppSelector((s) => s.user.current?.username);
  const walletBase = getSteemitWalletBaseUrl();

  // Legacy previousUrl semantics (PrimaryNavigation.jsx renderVisible): post
  // pages carry no nav context of their own, so the sidebar inherits the
  // referrer context stored in localStorage; every non-post page writes it.
  const onPostRoute = isPostRoute(pathname);
  const [postNavUrl, setPostNavUrl] = useState<string | null>(null);
  useEffect(() => {
    if (isPostRoute(pathname)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs sidebar state with the localStorage referrer (external system)
      setPostNavUrl(localStorage.getItem("previousUrl"));
    } else {
      localStorage.setItem("previousUrl", pathname);
      setPostNavUrl(null);
    }
  }, [pathname]);

  // The URL that drives all active/expanded state below.
  const effectiveUrl = onPostRoute ? (postNavUrl ?? pathname) : pathname;

  const allPostsMatched = isAllPostsExplore(effectiveUrl);
  const communitiesActive = isCommunitiesRoute(effectiveUrl);
  const myFriendsActive = isMyFriendsRoute(effectiveUrl, sessionUser);
  const mySubsActive = isMySubscriptionsRoute(effectiveUrl);
  // The profile group reflects the profile being viewed: "My Profile" when
  // it is the logged-in user's own page (or when not on a profile page at
  // all), otherwise the viewed "@username" — replacing legacy's separate
  // other-profile tree.
  const viewedUser = parseViewedProfileUser(effectiveUrl);
  const isOwnProfile = Boolean(
    sessionUser && viewedUser?.toLowerCase() === sessionUser.toLowerCase()
  );
  const profileGroupUser = viewedUser ?? sessionUser ?? null;

  const profileSections = useMemo(() => {
    if (!profileGroupUser) return [];
    const user = profileGroupUser.toLowerCase();
    // Other users' groups additionally expose Friends Feed (legacy "More"
    // menu); one's own feed lives under Explore > My Friends instead.
    const sections =
      viewedUser && !isOwnProfile
        ? [...MY_PROFILE_SECTIONS, { segment: "feed", label: "Friends Feed" }]
        : MY_PROFILE_SECTIONS;
    return sections.map(({ segment, label }) => ({
      label,
      href: profileSectionHref(user, segment),
      active: isProfileSectionActive(effectiveUrl, user, segment),
    }));
  }, [profileGroupUser, viewedUser, isOwnProfile, effectiveUrl]);

  const profileGroupActive = profileSections.some((s) => s.active);

  // Legacy default state: on post pages whose referrer resolves to no nav
  // item (including direct visits), highlight Explore > All Posts.
  const nothingActive =
    !allPostsMatched &&
    !communitiesActive &&
    !myFriendsActive &&
    !mySubsActive &&
    !profileGroupActive;
  const allPostsActive = allPostsMatched || (onPostRoute && nothingActive);
  const exploreActive =
    allPostsActive || communitiesActive || myFriendsActive || mySubsActive;

  // Route-driven expansion: the group containing the current route is
  // expanded; clicking a group header records a manual override keyed to the
  // current pathname, so the next navigation automatically reverts to
  // route-driven behavior without an effect.
  const routeGroup: "explore" | "profile" = profileGroupActive
    ? "profile"
    : "explore";
  const [manual, setManual] = useState<{
    at: string;
    group: "explore" | "profile" | null;
  } | null>(null);
  const expanded =
    manual && manual.at === pathname ? manual.group : routeGroup;
  const toggleGroup = (group: "explore" | "profile") =>
    setManual({ at: pathname, group: expanded === group ? null : group });

  const loginPrompt = () => dispatch(showLogin({}));

  return (
    <nav
      id="appNavigation"
      className="App__navigation flex flex-col gap-5 text-sm"
      aria-label="Primary navigation"
    >
      <NavGroup
        label="Explore"
        icon={CompassIcon}
        active={exploreActive}
        expanded={expanded === "explore"}
        onToggle={() => toggleGroup("explore")}
      >
        <NavSubItem href="/trending" label="All Posts" active={allPostsActive} />
        <NavSubItem
          href="/communities"
          label="Communities"
          active={communitiesActive}
        />
        {sessionUser ? (
          <>
            <NavSubItem
              href={`/@${sessionUser}/feed`}
              label="My Friends"
              active={myFriendsActive}
            />
            <NavSubItem
              href="/trending/my"
              label="My Subscriptions"
              active={mySubsActive}
            />
          </>
        ) : (
          <>
            <NavSubItem
              href=""
              label="My Friends"
              active={false}
              useLoginPrompt
              onLoginPrompt={loginPrompt}
            />
            <NavSubItem
              href=""
              label="My Subscriptions"
              active={false}
              useLoginPrompt
              onLoginPrompt={loginPrompt}
            />
          </>
        )}
      </NavGroup>

      {profileGroupUser ? (
        <NavGroup
          label={viewedUser && !isOwnProfile ? `@${profileGroupUser}` : "My Profile"}
          icon={UserRoundIcon}
          active={profileGroupActive}
          expanded={expanded === "profile"}
          onToggle={() => toggleGroup("profile")}
        >
          {profileSections.map(({ href, label, active }) => (
            <NavSubItem key={href} href={href} label={label} active={active} />
          ))}
        </NavGroup>
      ) : (
        <button
          type="button"
          onClick={loginPrompt}
          className={pillClass(false, "font-bold")}
        >
          <UserRoundIcon className="size-[1.15rem] shrink-0" aria-hidden />
          <span className="flex-1 text-left">My Profile</span>
        </button>
      )}

      {sessionUser ? (
        <a
          href={`${walletBase}/@${sessionUser}`}
          target="_blank"
          rel="noreferrer"
          className={pillClass(false, "font-bold")}
        >
          <WalletIcon className="size-[1.15rem] shrink-0" aria-hidden />
          <span className="flex-1 text-left">My Wallet</span>
        </a>
      ) : (
        <button type="button" onClick={loginPrompt} className={pillClass(false, "font-bold")}>
          <WalletIcon className="size-[1.15rem] shrink-0" aria-hidden />
          <span className="flex-1 text-left">My Wallet</span>
        </button>
      )}
    </nav>
  );
}
