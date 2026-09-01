"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppSelector } from "@/store/hooks";
import {
  fetchCommunities,
  type CommunitySubscription,
} from "@/lib/api/steem";
import SubscribeButton from "@/components/elements/SubscribeButton";
import AdSwipe from "@/components/elements/AdSwipe";
import TronAd from "@/components/elements/TronAd";
import SteemMarket from "@/components/elements/SteemMarket";
import Announcement from "@/components/layout/Announcement";
import { INDEX_LEFT_SIDE_AD_LIST, POST_LEFT_SIDE_AD_LIST, tronAdsConfig } from "@/lib/ads";

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
  return (
    <SidebarModule title="New to Steemit?">
      <ul>
        <li className="py-1">
          <a
            className="text-accent-foreground hover:underline"
            href="https://steemit.com/guide/@steemitblog/steemit-a-guide-for-newcomers"
            target="_blank"
            rel="noopener noreferrer"
          >
            Welcome Guide
          </a>
        </li>
      </ul>
    </SidebarModule>
  );
}

/** Logged-in rail: trending communities (legacy SidebarLinks). */
function SidebarLinks() {
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
        <li className="py-1 text-[#aaa]">Trending communities</li>
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

/** Community info panel for /(sort)/hive-* pages (legacy CommunityPane). */
function CommunityPane({ community }: { community: string }) {
  const username = useAppSelector((s) => s.user.current?.username);
  const [info, setInfo] = useState<CommunitySubscription | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCommunities({ observer: username, query: community, limit: 20 })
      .then((data) => {
        if (cancelled) return;
        setInfo(data.find((c) => c.name === community) ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [community, username]);

  if (!info) return null;

  return (
    <SidebarModule>
      <h4 className="mb-1 font-bold text-foreground">{info.title}</h4>
      {info.about && (
        <p className="mb-2 text-sm text-muted-foreground">{info.about}</p>
      )}
      <p className="mb-3 text-sm text-muted-foreground">
        {info.subscribers} subscribers &bull; {info.num_authors} active posters
      </p>
      <SubscribeButton
        community={info.name}
        subscribed={Boolean(info.context?.subscribed)}
      />
    </SidebarModule>
  );
}

/**
 * Right rail modules (legacy PostsIndexLayout/Post.jsx sidebars):
 * community pane on community pages, then SidebarNewUsers (logged out) or
 * SidebarLinks (logged in), then the Coin Marketplace (hidden unless
 * STEEM_MARKET_ENDPOINT is configured), then ads last.
 */
export function FeedSidebarWidgets() {
  const pathname = usePathname();
  const username = useAppSelector((s) => s.user.current?.username);
  const trackingId = useAppSelector((s) => s.user.trackingId);

  const communityMatch = pathname?.match(
    /^\/(?:trending|hot|created|promoted|payout|payout_comments|muted)\/(hive-[^/]+)/
  );
  const community = communityMatch?.[1];
  // Post pages get the post-scoped creative tags (legacy Post.jsx right
  // rail); feed pages get the index list.
  const isPostPage = Boolean(
    pathname?.match(/^\/[^/]+\/@[^/]+\/[^/]+/) ||
      pathname?.match(/^\/@[^/]+\/[^/]+/)
  );
  const adList = isPostPage ? POST_LEFT_SIDE_AD_LIST : INDEX_LEFT_SIDE_AD_LIST;

  return (
    <div className="flex flex-col">
      {community && <CommunityPane community={community} />}
      {/* Announcement: always on post pages, and on feed pages regardless
          of login state; community pages stay without it (legacy). */}
      {(isPostPage || !community) && <Announcement />}
      {username ? <SidebarLinks /> : <SidebarNewUsers />}
      {/* Legacy ad tag: CoinMarketPlacePost on post pages, Index/Community
          on feed pages depending on the community context. */}
      <SteemMarket
        page={
          isPostPage
            ? "CoinMarketPlacePost"
            : community
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
