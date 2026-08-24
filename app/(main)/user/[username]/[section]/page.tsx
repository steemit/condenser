'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
 * User profile page with section
 * Route: /@[username]/[section]
 * Sections: blog, posts, comments, replies, payout, feed, followers, followed, settings, notifications, communities
 * Note: proxy.ts ensures only @username format reaches here
 * Equivalent to old route: UserProfile with params [@username, section];
 * `feed` is legacy PostsIndex ['home', user] (bridge get_account_posts, sort 'feed')
 */
export default function UserProfileSectionPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
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

  // Show loading state if profile is still loading
  if (profileLoading) {
    return (
      <FeedLayout>
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </FeedLayout>
    );
  }

  if (!profile) {
    return (
      <FeedLayout>
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-destructive">User not found</p>
        </div>
      </FeedLayout>
    );
  }

  // Handle different sections
  if (section === 'settings') {
    if (!isMyAccount) {
      return (
        <FeedLayout centerClassName="md:max-w-4xl">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-foreground">
              You can only view your own settings.
            </p>
          </div>
        </FeedLayout>
      );
    }

    return (
      <FeedLayout centerClassName="md:max-w-4xl">
        {profileHeader}
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
      <FeedLayout centerClassName="md:max-w-4xl">
        {profileHeader}
        <h3 className="mt-6 mb-4 text-lg font-bold text-foreground">
          {section === 'followers' ? 'Followers' : 'Following'}
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
      <FeedLayout centerClassName="md:max-w-4xl lg:max-w-6xl">
        {profileHeader}
        <NotificationsList username={accountname} />
      </FeedLayout>
    );
  }

  if (section === 'communities') {
    return (
      <FeedLayout centerClassName="md:max-w-4xl lg:max-w-6xl">
        {profileHeader}
        <CommunitiesList accountname={accountname} />
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      {profileHeader}

      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
          {emptySectionText(section, accountname, isMyAccount)}
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
  section: string,
  accountname: string,
  isMyAccount: boolean
): React.ReactNode {
  switch (section) {
    case 'replies':
      return `@${accountname} hasn't had any replies yet.`;
    case 'payout':
      return 'No pending payouts.';
    case 'comments':
      return `@${accountname} hasn't made any comments yet.`;
    case 'posts':
      return `@${accountname} hasn't made any posts yet.`;
    case 'feed':
      // Legacy PostsIndex noFriendsText (empty home feed).
      return (
        <span className="flex flex-col items-center gap-2">
          <span>You haven&apos;t followed anyone yet!</span>
          <span className="flex flex-wrap justify-center gap-3">
            <Link href="/trending" className="text-accent-foreground underline">
              Explore Trending
            </Link>
            <a
              href="https://steemit.com/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-foreground underline"
            >
              New users guide
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
        <span>You haven&apos;t posted anything yet.</span>
        <span className="flex flex-wrap justify-center gap-3">
          <Link href="/communities" className="text-accent-foreground underline">
            Explore Communities
          </Link>
          <Link href="/submit" className="text-accent-foreground underline">
            Create a post
          </Link>
          <Link href="/trending" className="text-accent-foreground underline">
            Trending Articles
          </Link>
          <a
            href="https://steemit.com/welcome"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-foreground underline"
          >
            Welcome Guide
          </a>
        </span>
      </span>
    );
  }
  return `@${accountname} hasn't posted anything yet.`;
}

