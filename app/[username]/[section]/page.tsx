'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { fetchAccountPosts, Post } from '@/lib/api/steem';
import { normalizeUsername, formatUsername } from '@/lib/utils/username';
import PostsList from '@/components/cards/PostsList';
import UserProfileHeader from '@/components/cards/UserProfileHeader';
import NotificationsList from '@/components/cards/NotificationsList';

/**
 * User profile page with section
 * Route: /@[username]/[section]
 * Sections: blog, posts, comments, replies, payout, followers, followed, settings, notifications, communities
 * Note: proxy.ts ensures only @username format reaches here
 * Equivalent to old route: UserProfile with params [@username, section]
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
  const [profile, setProfile] = useState<any>(null);

  // Set pathname in global state (use @username format)
  useEffect(() => {
    const pathname = `/@${accountname}${section !== 'blog' ? `/${section}` : ''}`;
    dispatch(setPathname(pathname));
  }, [accountname, section, dispatch]);

  // Determine order based on section
  const order = ['blog', 'posts', 'comments', 'replies', 'payout'].includes(section)
    ? section
    : 'blog';

  // Fetch user profile
  useEffect(() => {
    // TODO: Implement fetchProfile action
    // For now, create a placeholder profile
    setProfile({
      name: accountname,
      // TODO: Fetch actual profile data
    });
  }, [accountname]);

  // Fetch posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const fetchedPosts = await fetchAccountPosts({
          account: accountname,
          order: order as any,
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

    if (['blog', 'posts', 'comments', 'replies', 'payout'].includes(section)) {
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
        order: order as any,
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

  // Handle different sections
  if (section === 'settings') {
    // TODO: Implement settings page
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="text-gray-600">Settings page coming soon...</p>
      </div>
    );
  }

  if (section === 'followers' || section === 'followed') {
    // TODO: Implement followers/following lists
    return (
      <div className="container mx-auto px-4 py-8">
        <UserProfileHeader
          accountname={accountname}
          profile={profile}
          currentUser={username}
        />
        <h2 className="text-2xl font-bold mt-6 mb-4">
          {section === 'followers' ? 'Followers' : 'Following'}
        </h2>
        <p className="text-gray-600">User list coming soon...</p>
      </div>
    );
  }

  if (section === 'notifications') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <UserProfileHeader
          accountname={accountname}
          profile={profile}
          currentUser={username}
        />
        <NotificationsList username={accountname} />
      </div>
    );
  }

  if (section === 'communities') {
    // TODO: Implement communities list
    return (
      <div className="container mx-auto px-4 py-8">
        <UserProfileHeader
          accountname={accountname}
          profile={profile}
          currentUser={username}
        />
        <h2 className="text-2xl font-bold mt-6 mb-4">Communities</h2>
        <p className="text-gray-600">Communities coming soon...</p>
      </div>
    );
  }

  // Default: show posts list
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <UserProfileHeader
        accountname={accountname}
        profile={profile}
        currentUser={username}
      />

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['blog', 'posts', 'comments', 'replies', 'payout'].map((tab) => (
            <a
              key={tab}
              href={`/${accountname}/${tab}`}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                section === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </a>
          ))}
        </nav>
      </div>

      {/* Posts list */}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {isMyAccount
              ? "You haven't posted anything yet."
              : `@${accountname} hasn't posted anything yet.`}
          </p>
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
    </div>
  );
}

