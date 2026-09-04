'use client';

import Link from 'next/link';
import { Calendar, Link2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { proxifyImageUrl } from '@/lib/media/proxify-url';
import Userpic from '@/components/elements/Userpic';
import Follow from '@/components/elements/Follow';
import TimeAgo from '@/components/elements/TimeAgo';

interface UserProfileHeaderProps {
  accountname: string;
  profile?: {
    name?: string;
    about?: string;
    location?: string;
    website?: string;
    profile_image?: string;
    cover_image?: string;
    [key: string]: unknown;
  } | null;
  currentUser?: string;
  stats?: {
    rank: number;
    following: number;
    followers: number;
    sp?: number;
  };
  reputation?: string;
  postCount?: number;
  created?: string;
  /** Last account activity (bridge `active`), for "Active x ago". */
  active?: string;
  blacklists?: string[];
}

const numberWithCommas = (x: number): string =>
  String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * UserProfileHeader — legacy full-bleed banner: cover image background,
 * white text with shadow, centered, stats with divider links.
 * (cards/UserProfileHeader.jsx + pages/UserProfile.scss)
 */
export default function UserProfileHeader({
  accountname,
  profile,
  currentUser,
  stats,
  reputation,
  postCount,
  created,
  active,
  blacklists = [],
}: UserProfileHeaderProps) {
  const t = useTranslations();
  const displayName = profile?.name || accountname;

  const coverImage = profile?.cover_image;
  const coverStyle: React.CSSProperties = coverImage
    ? { backgroundImage: `url(${proxifyImageUrl(coverImage, '2048x512')})` }
    : {};

  const websiteLabel = profile?.website
    ? profile.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
    : null;

  const joinDate = created
    ? new Date(created).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : null;

  const rep =
    reputation && !Number.isNaN(Number(reputation))
      ? Math.floor(Number(reputation))
      : null;

  return (
    <div className="UserProfile__banner mb-4 text-center text-white [&_a]:text-white">
      <div
        className="bg-[#1C252B] bg-cover bg-center bg-no-repeat px-4 pb-4 [text-shadow:1px_1px_2px_black]"
        style={{ ...coverStyle, minHeight: 155 }}
      >
        <div className="relative">
          {/* desktop follow button (legacy .UserProfile__buttons) */}
          <div className="absolute right-[5px] top-[15px] hidden min-[640px]:block [&_button]:!bg-white [&_button]:!text-black">
            <Follow follower={currentUser} following={accountname} />
          </div>
        </div>

        <h1 className="pt-[15px] text-[1.13095rem] font-semibold min-[640px]:text-[1.84524rem]">
          <Userpic
            account={accountname}
            className="!mr-2 !inline-block !size-9 align-middle min-[640px]:!size-12"
          />
          {displayName}{' '}
          {rep !== null && (
            <span
              className="UserProfile__rep text-[80%] font-extralight"
              title={t('user_profile.reputation_title', { name: accountname })}
            >
              ({rep})
            </span>
          )}
          {blacklists.length > 0 && (
            <span
              className="account_warn ml-1 font-bold text-[#ff4d4f]"
              title={t('user_profile.blacklisted_on', { list: blacklists.join(', ') })}
            >
              ({blacklists.length})
            </span>
          )}
        </h1>

        <div>
          {profile?.about && (
            <p className="UserProfile__bio mx-auto mb-2 mt-[-0.4rem] max-w-[420px] text-[95%] leading-[1.4]">
              {profile.about}
            </p>
          )}

          <div className="UserProfile__stats mb-[5px] pb-[5px] text-[90%]">
            <span className="px-2.5">
              <Link href={`/@${accountname}/followers`}>
                <strong>{stats?.followers ?? 0}</strong>{' '}
                {t('user_profile.followers_label', { count: stats?.followers ?? 0 })}
              </Link>
            </span>
            <span className="border-l border-[#ccc] px-2.5">
              <Link href={`/@${accountname}`}>
                <strong>{postCount ?? 0}</strong>{' '}
                {t('user_profile.posts_label', { count: postCount ?? 0 })}
              </Link>
            </span>
            <span className="border-l border-[#ccc] px-2.5">
              <Link href={`/@${accountname}/followed`}>
                <strong>{stats?.following ?? 0}</strong>{' '}
                {t('user_profile.following_label', { count: stats?.following ?? 0 })}
              </Link>
            </span>
            {typeof stats?.sp === 'number' && stats.sp > 0 && (
              <span className="border-l border-[#ccc] px-2.5">
                {numberWithCommas(Math.round(stats.sp))} SP
              </span>
            )}
            {typeof stats?.rank === 'number' && stats.rank > 0 && (
              <span className="border-l border-[#ccc] px-2.5">
                #{numberWithCommas(stats.rank)}
              </span>
            )}
          </div>

          <p className="UserProfile__info flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[90%]">
            {profile?.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden /> {profile.location}
              </span>
            )}
            {profile?.website && websiteLabel && (
              <span className="inline-flex items-center gap-1">
                <Link2 className="size-4" aria-hidden />{' '}
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {websiteLabel}
                </a>
              </span>
            )}
            {joinDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" aria-hidden />{' '}
                {t('user_profile.joined_date', { date: joinDate })}
              </span>
            )}
            {active && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" aria-hidden /> {t('g.active')}{' '}
                <TimeAgo date={active} />
              </span>
            )}
          </p>
        </div>

        {/* mobile follow button (legacy .UserProfile__buttons_mobile) */}
        <div className="UserProfile__buttons_mobile mt-2 min-[640px]:hidden [&_button]:!bg-white [&_button]:!text-black">
          <Follow follower={currentUser} following={accountname} />
        </div>
      </div>
    </div>
  );
}
