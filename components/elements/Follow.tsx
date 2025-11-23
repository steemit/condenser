'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { showLogin } from '@/store/slices/userSlice';
import { broadcastOperation } from '@/store/slices/transactionSlice';
import { updateFollowState } from '@/store/slices/globalSlice';

interface FollowProps {
  following: string; // The user to follow/unfollow
  follower?: string; // The current user (optional, defaults to logged-in user)
  showFollow?: boolean; // Show follow button
  showMute?: boolean; // Show mute/ignore button
  fat?: boolean; // Use fat button style
  children?: React.ReactNode;
}

/**
 * Follow component
 * Handles following, unfollowing, muting, and unmuting users
 * Migrated from legacy/src/app/components/elements/Follow/index.jsx
 */
export default function Follow({
  following,
  follower: propFollower,
  showFollow = true,
  showMute = true,
  fat = false,
  children,
}: FollowProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.current?.username);
  const follower = propFollower || currentUser;

  // Get follow state from Redux
  const followState = useAppSelector((state) => {
    if (!follower) return null;
    return state.global.follow?.getFollowingAsync?.[follower];
  });

  const [busy, setBusy] = useState(false);

  // Determine current follow state
  const followingWhat = followState?.blog_result?.includes(following) ? 'blog' : '';
  const ignoreWhat = followState?.ignore_result?.includes(following) ? 'ignore' : '';
  const loading = followState?.blog_loading || followState?.ignore_loading || false;

  // Can't follow or ignore self
  if (follower === following) {
    return null;
  }

  // Show login prompt if not logged in
  if (!follower || !following) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          dispatch(showLogin());
        }}
        className={`${fat ? '' : 'px-2 py-1 text-sm'} border border-gray-300 rounded text-gray-700 hover:bg-gray-50`}
      >
        Follow
      </button>
    );
  }

  // Show loading indicator
  if (loading) {
    return (
      <span className="text-sm text-gray-500">
        Loading...
      </span>
    );
  }

  const handleFollow = () => {
    if (busy) return;
    setBusy(true);

    const what = [followingWhat, ignoreWhat];
    what[0] = 'blog'; // Set follow action
    if (what[1] === '') {
      what[1] = ignoreWhat || '';
    }

    updateFollow(follower, following, what, () => {
      setBusy(false);
    });
  };

  const handleUnfollow = () => {
    if (busy) return;
    setBusy(true);

    const what = [followingWhat, ignoreWhat];
    what[0] = ''; // Clear follow action
    if (what[1] === '') {
      what[1] = ignoreWhat || '';
    }

    updateFollow(follower, following, what, () => {
      setBusy(false);
    });
  };

  const handleIgnore = () => {
    if (busy) return;
    setBusy(true);

    const what = [followingWhat, ignoreWhat];
    what[1] = 'ignore'; // Set ignore action
    if (what[0] === '') {
      what[0] = followingWhat || '';
    }

    updateFollow(follower, following, what, () => {
      setBusy(false);
    });
  };

  const handleUnignore = () => {
    if (busy) return;
    setBusy(true);

    const what = [followingWhat, ignoreWhat];
    what[1] = ''; // Clear ignore action
    if (what[0] === '') {
      what[0] = followingWhat || '';
    }

    updateFollow(follower, following, what, () => {
      setBusy(false);
    });
  };

  const updateFollow = (
    followerUser: string,
    followingUser: string,
    what: string[],
    done: () => void
  ) => {
    const json = ['follow', { follower: followerUser, following: followingUser, what }];
    
    // Optimistic update
    dispatch(
      updateFollowState({
        follower: followerUser,
        following: followingUser,
        what,
      })
    );

    // Broadcast operation
    dispatch(
      broadcastOperation({
        type: 'custom_json',
        operation: {
          id: 'follow',
          required_posting_auths: [followerUser],
          json: JSON.stringify(json),
        },
        successCallback: done,
        errorCallback: () => {
          // Revert optimistic update on error
          // TODO: Revert the follow state
          done();
        },
      })
    );
  };

  const buttonClass = `${
    fat ? 'px-4 py-2' : 'px-2 py-1 text-sm'
  } border rounded transition-colors ${
    busy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  }`;

  const activeButtonClass = `${buttonClass} bg-blue-600 text-white border-blue-600 hover:bg-blue-700`;
  const inactiveButtonClass = `${buttonClass} border-gray-300 text-gray-700 hover:bg-gray-50`;

  return (
    <span className="flex items-center gap-2">
      {showFollow && followingWhat !== 'blog' && (
        <button
          onClick={handleFollow}
          disabled={busy}
          className={inactiveButtonClass}
        >
          Follow
        </button>
      )}

      {showFollow && followingWhat === 'blog' && (
        <button
          onClick={handleUnfollow}
          disabled={busy}
          className={activeButtonClass}
        >
          Unfollow
        </button>
      )}

      {showMute && ignoreWhat !== 'ignore' && (
        <button
          onClick={handleIgnore}
          disabled={busy}
          className={inactiveButtonClass}
        >
          Mute
        </button>
      )}

      {showMute && ignoreWhat === 'ignore' && (
        <button
          onClick={handleUnignore}
          disabled={busy}
          className={activeButtonClass}
        >
          Unmute
        </button>
      )}

      {children && <span>{children}</span>}
    </span>
  );
}

