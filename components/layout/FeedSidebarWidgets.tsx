"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { showDialog } from "@/store/slices/globalSlice";
import { fetchCommunities, type CommunitySubscription } from "@/lib/api/steem";
import { Role, viewerRole } from "@/lib/community";
import { useCommunity } from "@/components/providers/CommunityProvider";
import AdSwipe from "@/components/elements/AdSwipe";
import TronAd from "@/components/elements/TronAd";
import SteemMarket from "@/components/elements/SteemMarket";
import Announcement from "@/components/layout/Announcement";
import type { Community } from "@/types/steem";
import { INDEX_LEFT_SIDE_AD_LIST, POST_LEFT_SIDE_AD_LIST, tronAdsConfig } from "@/lib/ads";
import { SORT_TYPES, isPostPathname } from "@/lib/routes";

/**
 * /<sort>/hive-* community feed matcher; the alternation is derived from
 * SORT_TYPES (lib/routes.ts). Anchored to exactly two segments: community
 * feed URLs are /<sort>/hive-* (a third segment is not a valid feed route).
 * The pattern was introduced broken in #3988 (it required a third segment,
 * so it never matched the real two-segment URL and the pane was dead code)
 * until this fix revived it. The optional trailing slash mirrors
 * isPostPathname (lib/routes.ts): today the proxy's 308 normalization
 * strips it before the UI matches, but if skipTrailingSlashRedirect is
 * ever enabled usePathname() would report it and the pane would go dead
 * again.
 */
const COMMUNITY_FEED_RE = new RegExp(
  `^\\/(?:${SORT_TYPES.join("|")})\\/(hive-[^/]+)\\/?$`
);

/** Legacy c-sidebar__module chrome. */
function SidebarModule({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="c-sidebar__module mb-4 rounded-[6px] border border-border bg-card p-[1.5em]">
      {title && (
        <div className="c-sidebar__header mb-2">
          <h3 className="c-sidebar__h3 font-bold text-foreground">{title}</h3>
        </div>
      )}
      <div className="c-sidebar__content">{children}</div>
    </div>
  );
}

/** Logged-out rail: "New to Steemit?" (legacy SidebarNewUsers). */
function SidebarNewUsers() {
  const t = useTranslations();
  return (
    <SidebarModule title={t("sidebar.new_to_steemit")}>
      <ul>
        <li className="py-1">
          <a
            className="text-accent-foreground hover:underline"
            href="https://steemit.com/guide/@steemitblog/steemit-a-guide-for-newcomers"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("g.welcome_guide")}
          </a>
        </li>
      </ul>
    </SidebarModule>
  );
}

/** Logged-in rail: trending communities (legacy SidebarLinks). */
function SidebarLinks() {
  const t = useTranslations();
  const [topics, setTopics] = useState<CommunitySubscription[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchCommunities({ sort: "rank", limit: 10 })
      .then((data) => {
        if (!cancelled) setTopics(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (topics.length === 0) return null;

  return (
    <SidebarModule>
      <ul>
        <li className="py-1 text-[#aaa]">{t("g.trending_communities")}</li>
        {topics.map((c) => (
          <li key={c.name} className="py-1">
            <Link
              href={`/trending/${c.name}`}
              className="text-accent-foreground hover:underline"
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </SidebarModule>
  );
}

const nl2br = (text: string): React.ReactNode =>
  text.split('\n').map((item, key) => (
    <span key={key} className="block">
      {item}
    </span>
  ));

const nl2li = (text: string): React.ReactNode =>
  text.split('\n').map((item, key) => <li key={key}>{item}</li>);

/** Legacy team row badges: .user_role (uppercase gray) / .affiliation pill. */
const roleBadge = 'ml-1 text-[0.8em] uppercase text-muted-foreground';
const affiliationBadge =
  'mx-1 rounded-[0.3rem] bg-muted px-[0.2rem] py-px text-xs font-normal [text-shadow:none]';

/**
 * Community info panel for /(sort)/hive-* pages (legacy CommunityPane.jsx).
 * Consumes the page-provided CommunityProvider value — bridge.get_community
 * data (team/description/flag_text/settings), not a list_communities search,
 * and never refetches on its own.
 */
function CommunityPane({ community }: { community: Community | null }) {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  if (!community) return null;

  const category = community.name;
  const role = viewerRole(community);
  const canPost = Role.canPost(category, role);
  const atLeastMod = Role.atLeast(role, 'mod');

  const showModerationLog = () =>
    dispatch(showDialog({ name: 'communityModerationLog', data: { community } }));

  // Legacy teamMembers(): owner rows are hidden from the pane.
  const team = (community.team ?? []).filter(
    ([, memberRole]) => memberRole !== 'owner'
  );

  return (
    <>
      <SidebarModule>
        {!canPost && (
          <div className="mb-2 text-center">
            <small className="flex items-center justify-center gap-1 text-muted-foreground">
              <Eye className="size-3" aria-hidden /> {t('g.only_approved')}
            </small>
          </div>
        )}
        <div>
          {atLeastMod && (
            <div className="float-right text-[0.8em]">
              <Link
                href={`/roles/${category}`}
                className="text-accent-foreground hover:underline"
              >
                {t('g.edit_roles')}
              </Link>
            </div>
          )}
          <strong className="text-foreground">{t('g.leadership')}</strong>
          {team.map(([name, memberRole, title]) => (
            <div key={`${name}__${memberRole}`} className="text-[80%]">
              <Link
                href={`/@${name}`}
                className="text-accent-foreground hover:underline"
              >
                @{name}
              </Link>
              {memberRole && <span className={roleBadge}> {memberRole} </span>}
              {title && <span className={affiliationBadge}>{title}</span>}
            </div>
          ))}
          <div className="float-right text-[0.8em]">
            <button
              type="button"
              onClick={showModerationLog}
              className="text-accent-foreground hover:underline"
            >
              {t('g.activity_log')}
            </button>
          </div>
        </div>
      </SidebarModule>
      <SidebarModule>
        {community.description && (
          <div className="mb-2">
            <strong className="text-foreground">{t('g.description')}</strong>
            {community.is_nsfw && <span className={affiliationBadge}>nsfw</span>}
            {nl2br(community.description)}
          </div>
        )}
        {community.flag_text && (
          <div className="mb-2">
            <strong className="text-foreground">{t('g.rules')}</strong>
            <ol className="list-decimal pl-5">{nl2li(community.flag_text)}</ol>
          </div>
        )}
        <div>
          <strong className="text-foreground">{t('g.language')}</strong>
          <br />
          {community.lang}
        </div>
      </SidebarModule>
    </>
  );
}

/**
 * Right rail modules (legacy PostsIndexLayout/Post.jsx sidebars):
 * community pane on community pages, then SidebarNewUsers (logged out) or
 * SidebarLinks (logged in) — both hidden on community pages (legacy
 * PostsIndexLayout gates them with !community, leaving only the pane,
 * Coin Marketplace and ads there) — then the Coin Marketplace (hidden
 * unless STEEM_MARKET_ENDPOINT is configured), then ads last.
 */
export function FeedSidebarWidgets() {
  const pathname = usePathname();
  const username = useAppSelector((s) => s.user.current?.username);
  const trackingId = useAppSelector((s) => s.user.trackingId);
  // Bridge get_community payload from the page-level provider; null until it
  // resolves. Layout gating below stays URL-derived so the non-community
  // modules disappear instantly instead of flashing while it loads.
  const community = useCommunity();

  // Lowercase the pathname instead of flagging COMMUNITY_FEED_RE with "i":
  // the sort vocabulary is lowercase-only (lib/routes.ts) and the derived
  // regex stays case-sensitive for any other consumer. This mirrors legacy,
  // whose 301 normalized the whole URL to lowercase before the UI matched,
  // and the captured (lowercase) community matches how the page itself
  // queries the tag — /Payout/hive-x still shows the community pane.
  const communityMatch = pathname?.toLowerCase().match(COMMUNITY_FEED_RE);
  const communityPath = communityMatch?.[1];
  // Post pages get the post-scoped creative tags (legacy Post.jsx right
  // rail); feed pages get the index list. Shared anchored matcher
  // (lib/routes.ts isPostPathname): the previous unanchored regexes also
  // matched profile-section URLs like /@user/blog and /@user/feed (a bug
  // so far masked because profile pages hide the right rail).
  const isPostPage = isPostPathname(pathname ?? "");
  const adList = isPostPage ? POST_LEFT_SIDE_AD_LIST : INDEX_LEFT_SIDE_AD_LIST;

  return (
    <div className="flex flex-col">
      {communityPath && <CommunityPane community={community} />}
      {/* Announcement: always on post pages, and on feed pages regardless
          of login state; community pages stay without it (legacy). */}
      {(isPostPage || !communityPath) && <Announcement />}
      {/* Legacy PostsIndexLayout hides the user rail modules on community
          pages (!community on both SidebarNewUsers and SidebarLinks), where
          the pane already fills that slot. */}
      {!communityPath && (username ? <SidebarLinks /> : <SidebarNewUsers />)}
      {/* Legacy ad tag: CoinMarketPlacePost on post pages, Index/Community
          on feed pages depending on the community context. */}
      <SteemMarket
        page={
          isPostPage
            ? "CoinMarketPlacePost"
            : communityPath
              ? "CoinMarketPlaceCommunity"
              : "CoinMarketPlaceIndex"
        }
      />
      {/* Legacy PostsIndexLayout/Post right rail: ads are the LAST modules,
          rendered bare (no card chrome) so creatives fill the column. */}
      <div className="mb-4">
        <AdSwipe adList={adList} trackingId={trackingId} />
      </div>
      {tronAdsConfig.enabled && tronAdsConfig.sidebarPid && (
        <TronAd
          trackingId={trackingId}
          wrapperName="tron_ad_sideby"
          pid={tronAdsConfig.sidebarPid}
          adTag="tron_ad_sideby"
          ratioClass="ratio-1-1"
          env={tronAdsConfig.env}
          isMock={tronAdsConfig.isMock}
        />
      )}
    </div>
  );
}
