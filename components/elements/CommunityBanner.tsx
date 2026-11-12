'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Role, viewerRole, viewerSubscribed } from '@/lib/community';
import { fetchUserProfile } from '@/lib/api/steem';
import { proxifyImageUrl } from '@/lib/media/proxify-url';
import { safeCoverImageUrl } from '@/lib/profile-metadata';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showDialog } from '@/store/slices/globalSlice';
import { showLogin } from '@/store/slices/userSlice';
import Userpic from '@/components/elements/Userpic';
import SubscribeButton from '@/components/elements/SubscribeButton';
import type { Community } from '@/types/steem';

const numberWithCommas = (x: number): string =>
  String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * CommunityBanner — legacy CommunityBanner.jsx + CommunityBanner.scss.
 *
 * Cover-height 200px (220px ≥640px, back to 200px ≥1200px); dark
 * translucent title strip with avatar (settings.avatar_url, else the
 * community account's Userpic); Subscribe + New Post bottom-right; the
 * three community stats bottom-left. The "Edit: roles / Activity Log"
 * block floats right and is HIDDEN ≥1200px in legacy (MQ(L) display:none)
 * — desktop gets the Activity Log entry from the sidebar pane instead.
 */
export default function CommunityBanner({ community }: { community: Community }) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((s) => Boolean(s.user.current?.username));

  const category = community.name;
  const role = viewerRole(community);
  const canPost = Role.canPost(category, role);
  const atLeastMod = Role.atLeast(role, 'mod');

  // Legacy screenWidth/snapWidth (760): comma separators above, compact
  // (1.2m / 12.3k) below. Like legacy, width is unknown until mount.
  const [screenWidth, setScreenWidth] = useState(0);
  useEffect(() => {
    const update = () => setScreenWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const formatNumber = (num: number | undefined): string => {
    const n = num ?? 0;
    if (screenWidth > 760) return numberWithCommas(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'm';
    if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
    return numberWithCommas(n);
  };

  // Cover: community settings first; fall back to the community account's
  // profile cover image (legacy CommunityBanner fetchProfile fallback).
  const settingsCover = safeCoverImageUrl(community.settings?.cover_url ?? null);
  const [profileCover, setProfileCover] = useState<string | null>(null);
  useEffect(() => {
    if (settingsCover) return;
    let cancelled = false;
    fetchUserProfile(category)
      .then((profile) => {
        if (!cancelled) {
          setProfileCover(
            safeCoverImageUrl(profile?.metadata?.profile?.cover_image ?? null)
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [category, settingsCover]);

  // Both URLs are community-controlled and land in a style sink — validated
  // first, proxified after (audit N-06 pattern from UserProfileHeader).
  const coverUrl = settingsCover ?? profileCover;
  const coverStyle: React.CSSProperties = coverUrl
    ? { backgroundImage: `url(${proxifyImageUrl(coverUrl, '2048x512')})` }
    : {};
  const avatarUrl = safeCoverImageUrl(community.settings?.avatar_url ?? null);

  const showModerationLog = () => {
    dispatch(
      showDialog({ name: 'communityModerationLog', data: { community } })
    );
  };
  const showRecentSubscribers = () => {
    dispatch(
      showDialog({ name: 'communitySubscribers', data: { community } })
    );
  };

  const onNewPost = (e: React.MouseEvent) => {
    // Legacy checkIfLogin: logged-out visitors get the login modal instead
    // of the editor (legacy then router-replaces to /submit?category=…).
    if (!loggedIn) {
      e.preventDefault();
      e.stopPropagation();
      dispatch(showLogin({}));
    }
  };

  const subscribers = community.subscribers ?? 0;

  return (
    <div
      className="CommunityBanner relative mb-4 h-[200px] w-full overflow-hidden bg-[#1C252B] bg-cover bg-center text-white [text-shadow:1px_1px_2px_black] min-[640px]:h-[220px] min-[1200px]:h-[200px]"
      style={coverStyle}
    >
      {/* CommunityTitle strip */}
      <div className="flex items-start border-b border-[rgba(238,238,238,0.5)] bg-[rgba(51,51,51,0.6)]">
        {avatarUrl ? (
          <div
            className="m-2 size-10 shrink-0 rounded-full border-2 border-[#eee] bg-cover bg-center min-[760px]:m-4 min-[760px]:size-[60px]"
            style={{ backgroundImage: `url(${proxifyImageUrl(avatarUrl, '100x100')})` }}
            role="img"
            aria-label={category}
          />
        ) : (
          <Userpic
            account={category}
            className="m-2 !size-10 !border-2 !border-[#eee] min-[760px]:m-4 min-[760px]:!size-[60px]"
          />
        )}
        <div className="relative my-2 w-full min-w-0">
          {/* AdditionalActions — legacy hides this block ≥1200px */}
          <div className="float-right ml-2 hidden border-l border-[rgba(238,238,238,0.5)] py-2 pl-4 pr-2 text-right text-[0.9em] whitespace-nowrap min-[1200px]:hidden">
            {atLeastMod && (
              <div>
                {t('g.edit')}: <Link href={`/roles/${category}`} className="underline">{t('g.roles')}</Link>
              </div>
            )}
            <div className="mt-1 text-[0.8em]">
              <button type="button" onClick={showModerationLog} className="underline">
                {t('g.activity_log')}
              </button>
              {community.is_nsfw && <span className="block font-bold">nsfw</span>}
            </div>
          </div>
          <h1 className="m-0 pb-2 pr-4 text-[1.3rem] font-bold">
            {community.title}
          </h1>
          {community.about && (
            <p className="m-0 pr-4 text-[0.9em] min-[1200px]:text-base">
              {community.about}
            </p>
          )}
        </div>
      </div>

      {/* CommunityActions */}
      <div className="absolute right-4 bottom-8 flex items-center gap-4 min-[1200px]:bottom-0">
        <SubscribeButton
          community={category}
          subscribed={viewerSubscribed(community)}
        />
        {canPost && (
          <Link
            href={`/submit?category=${encodeURIComponent(category)}`}
            onClick={onNewPost}
            className="flex items-center justify-center rounded-[3px] bg-[#06D6A9] px-4 py-1.5 text-sm font-bold text-white transition-colors hover:opacity-90"
          >
            <Pencil className="mr-1 size-4" aria-hidden />
            {t('g.new_post')}
          </Link>
        )}
      </div>

      {/* CommunityAttributes */}
      <div className="absolute bottom-0 left-0 ml-2 flex gap-2 min-[1200px]:ml-4">
        <button
          type="button"
          onClick={showRecentSubscribers}
          aria-label={t('g.subscribers')}
          className="cursor-pointer rounded-t-[5px] border-t border-l border-r border-[rgba(238,238,238,0.5)] bg-[rgba(51,51,51,0.6)] p-2 text-center align-baseline text-[0.9em] leading-normal hover:text-accent-foreground min-[1200px]:text-base"
        >
          {formatNumber(subscribers)}
          <span className="pl-[5px] text-[0.8em] whitespace-nowrap min-[1200px]:block">
            {subscribers === 1 ? t('g.subscriber') : t('g.subscribers')}
          </span>
        </button>
        <p className="m-0 rounded-t-[5px] border-t border-l border-r border-[rgba(238,238,238,0.5)] bg-[rgba(51,51,51,0.6)] p-2 text-center text-[0.9em] leading-normal min-[1200px]:text-base">
          ${formatNumber(community.sum_pending)}
          <span className="pl-[5px] text-[0.8em] whitespace-nowrap min-[1200px]:block">
            {t('g.pending_rewards')}
          </span>
        </p>
        <p className="m-0 rounded-t-[5px] border-t border-l border-r border-[rgba(238,238,238,0.5)] bg-[rgba(51,51,51,0.6)] p-2 text-center text-[0.9em] leading-normal min-[1200px]:text-base">
          {formatNumber(community.num_authors)}
          <span className="pl-[5px] text-[0.8em] whitespace-nowrap min-[1200px]:block">
            {t('g.active_posters')}
          </span>
        </p>
      </div>
    </div>
  );
}
