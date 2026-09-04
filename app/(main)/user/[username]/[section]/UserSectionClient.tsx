'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import {
  fetchAccountPosts,
  fetchUserProfile,
  type AccountPostsOrder,
  type Post,
  type UserProfile,
} from '@/lib/api/steem';
import { normalizeUsername } from '@/lib/utils/username';
import PostsList from '@/components/cards/PostsList';
import { FeedLayout } from '@/components/layout/FeedLayout';
import UserProfileHeader from '@/components/cards/UserProfileHeader';
import NotificationsList from '@/components/cards/NotificationsList';
import FollowList from '@/components/cards/FollowList';
import CommunitiesList from '@/components/cards/CommunitiesList';
import UserSettings from '@/components/modules/UserSettings';

/**
 * User profile page with section — client content.
 * Rendered by the server page shell in ./page.tsx, which owns
 * generateMetadata; this component keeps the original client-side
 * fetch/render behaviour.
 * Sections: blog, posts, comments, replies, payout, feed, followers, followed, settings, notifications, communities
 * Note: proxy.ts ensures only @username format reaches here
 * Equivalent to old route: UserProfile with params [@username, section];
 * `feed` is legacy PostsIndex ['home', user] (bridge get_account_posts, sort 'feed')
 */
export default function UserSectionClient() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const username = useAppSelector((state) => state.user.current?.username);
  
  const usernameRaw = params.username as string;
  const accountname = normalizeUsername(usernameRaw).toLowerCase();
  const section = (params.section as string) || 'blog';
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Set pathname in global state (use @username format)
  useEffect(() => {
    const pathname = `/@${accountname}${section !== 'blog' ? `/${section}` : ''}`;
    dispatch(setPathname(pathname));
  }, [accountname, section, dispatch]);

  const order: AccountPostsOrder = [
    'blog',
    'posts',
    'comments',
    'replies',
    'payout',
    'feed',
  ].includes(section)
    ? (section as AccountPostsOrder)
    : 'blog';

  // Fetch user profile
  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const fetchedProfile = await fetchUserProfile(accountname, username);
        setProfile(fetchedProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [accountname, username]);

  // Fetch posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const fetchedPosts = await fetchAccountPosts({
          account: accountname,
          order,
          limit: 20,
        });
        setPosts(fetchedPosts);
        setHasMore(fetchedPosts.length >= 20);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (['blog', 'posts', 'comments', 'replies', 'payout', 'feed'].includes(section)) {
      loadPosts();
    } else {
      setLoading(false);
    }
  }, [accountname, order, section]);

  const handleLoadMore = async () => {
    if (loading || !hasMore || posts.length === 0) return;

    const lastPost = posts[posts.length - 1];
    setLoading(true);
    try {
      const fetchedPosts = await fetchAccountPosts({
        account: accountname,
        order,
        start_author: lastPost.author,
        start_permlink: lastPost.permlink,
        limit: 20,
      });

      if (fetchedPosts.length > 0) {
        setPosts((prev) => [...prev, ...fetchedPosts]);
        setHasMore(fetchedPosts.length >= 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const isMyAccount = username === accountname;

  const profileHeader = (
    <UserProfileHeader
      accountname={accountname}
      profile={profile?.metadata?.profile || null}
      currentUser={username}
      stats={profile?.stats}
      reputation={profile?.reputation}
      postCount={profile?.post_count}
      created={profile?.created}
      active={profile?.active}
      blacklists={profile?.blacklists}
    />
  );

  // While the profile loads, the banner already renders (it falls back to
  // the accountname) and post sections show the same skeleton cards as the
  // feed pages instead of a bare loading label.
  if (profileLoading) {
    const isPostsSection = ['blog', 'posts', 'comments', 'replies', 'payout', 'feed'].includes(section);
    return (
      <FeedLayout hideRightRail banner={profileHeader}>
        {isPostsSection ? (
          <PostsList
            posts={[]}
            loading
            category={`@${accountname}`}
            order={order}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <p className="text-muted-foreground">{t('user_profile.loading_profile')}</p>
          </div>
        )}
      </FeedLayout>
    );
  }

  if (!profile) {
    return (
      <FeedLayout hideRightRail>
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-destructive">{t('user_profile.user_not_found')}</p>
        </div>
      </FeedLayout>
    );
  }

  // Handle different sections
  if (section === 'settings') {
    if (!isMyAccount) {
      return (
        <FeedLayout centerClassName="md:max-w-4xl" hideRightRail>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-foreground">
              {t('user_profile.only_view_own_settings')}
            </p>
          </div>
        </FeedLayout>
      );
    }

    return (
      <FeedLayout
        centerClassName="md:max-w-4xl"
        hideRightRail
        banner={profileHeader}
      >
        <div className="mt-8">
          <UserSettings 
            accountname={accountname} 
            profile={profile?.metadata?.profile || null}
            onProfileUpdate={(updatedProfile) => {
              // Update local profile state
              if (profile) {
                setProfile({
                  ...profile,
                  metadata: {
                    ...profile.metadata,
                    profile: updatedProfile,
                  },
                });
              }
            }}
          />
        </div>
      </FeedLayout>
    );
  }

  if (section === 'followers' || section === 'followed') {
    const followType = section === 'followers' ? 'followers' : 'following';
    return (
      <FeedLayout
        centerClassName="md:max-w-4xl"
        hideRightRail
        banner={profileHeader}
      >
        <h3 className="mt-6 mb-4 text-lg font-bold text-foreground">
          {section === 'followers' ? t('user_profile.followers') : t('user_profile.following')}
        </h3>
        <FollowList
          accountname={accountname}
          type={followType}
          total={
            section === 'followers'
              ? profile?.stats?.followers
              : profile?.stats?.following
          }
        />
      </FeedLayout>
    );
  }

  if (section === 'notifications') {
    return (
      <FeedLayout
        centerClassName="md:max-w-4xl lg:max-w-6xl"
        hideRightRail
        banner={profileHeader}
      >
        <NotificationsList username={accountname} />
      </FeedLayout>
    );
  }

  if (section === 'communities') {
    return (
      <FeedLayout
        centerClassName="md:max-w-4xl lg:max-w-6xl"
        hideRightRail
        banner={profileHeader}
      >
        <CommunitiesList accountname={accountname} />
      </FeedLayout>
    );
  }

  return (
    <FeedLayout hideRightRail banner={profileHeader}>
      {loading && posts.length === 0 ? (
        // Same skeleton placeholders as the feed pages (PostsList renders
        // PostSummarySkeleton cards while the first page loads).
        <PostsList
          posts={[]}
          loading
          category={`@${accountname}`}
          order={order}
        />
      ) : posts.length === 0 ? (
        <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
          {emptySectionText(t, section, accountname, isMyAccount)}
        </div>
      ) : (
        <PostsList
          posts={posts}
          loading={loading}
          onLoadMore={hasMore ? handleLoadMore : undefined}
          category={`@${accountname}`}
          order={order}
        />
      )}
    </FeedLayout>
  );
}

/** Legacy UserProfile empty-state copy per section (UserProfile.jsx:23-69). */
function emptySectionText(
  t: ReturnType<typeof useTranslations>,
  section: string,
  accountname: string,
  isMyAccount: boolean
): React.ReactNode {
  switch (section) {
    case 'replies':
      return t('user_profile.user_hasnt_had_any_replies_yet', { name: `@${accountname}` });
    case 'payout':
      return t('user_profile.no_pending_payouts');
    case 'comments':
      return t('user_profile.user_hasnt_made_any_comments_yet', { name: `@${accountname}` });
    case 'posts':
      return t('user_profile.user_hasnt_made_any_posts_yet', { name: `@${accountname}` });
    case 'feed':
      // Legacy PostsIndex noFriendsText (empty home feed).
      return (
        <span className="flex flex-col items-center gap-2">
          <span>{t('user_profile.no_friends_feed')}</span>
          <span className="flex flex-wrap justify-center gap-3">
            <Link href="/trending" className="text-accent-foreground underline">
              {t('user_profile.explore_trending')}
            </Link>
            <a
              href="https://steemit.com/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-foreground underline"
            >
              {t('user_profile.new_users_guide')}
            </a>
          </span>
        </span>
      );
    default:
      break;
  }
  if (isMyAccount) {
    return (
      <span className="flex flex-col items-center gap-2">
        <span>{t('user_profile.looks_like_you_havent_posted_anything_yet')}</span>
        <span className="flex flex-wrap justify-center gap-3">
          <Link href="/communities" className="text-accent-foreground underline">
            {t('g.explore_communities')}
          </Link>
          <Link href="/submit" className="text-accent-foreground underline">
            {t('user_profile.create_a_post')}
          </Link>
          <Link href="/trending" className="text-accent-foreground underline">
            {t('user_profile.explore_trending_articles')}
          </Link>
          <a
            href="https://steemit.com/welcome"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-foreground underline"
          >
            {t('g.welcome_guide')}
          </a>
        </span>
      </span>
    );
  }
  return t('user_profile.user_hasnt_posted_anything_yet', { name: `@${accountname}` });
}

