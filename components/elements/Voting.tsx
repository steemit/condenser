'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { showLogin } from '@/store/slices/userSlice';
import { broadcastOperation } from '@/store/slices/transactionSlice';
import { voted, set } from '@/store/slices/globalSlice';
import { Post } from '@/lib/api/steem';

interface VotingProps {
  post: Post;
  showList?: boolean;
  enableSlider?: boolean;
  isComment?: boolean;
}

const MAX_WEIGHT = 10000;
const MIN_WEIGHT = 1;

/**
 * Voting component
 * Handles upvoting and downvoting for posts/comments with weight slider
 * Migrated from legacy/src/app/components/elements/Voting.jsx
 */
export default function Voting({ post, showList = true, enableSlider = false, isComment = false }: VotingProps) {
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.user.current?.username);
  const voting = useAppSelector((state) => {
    const key = `transaction_vote_active_${post.author}_${post.permlink}`;
    return state.global[key] || false;
  });

  const [showWeight, setShowWeight] = useState(false);
  const [sliderWeight, setSliderWeight] = useState({
    up: MAX_WEIGHT,
    down: MAX_WEIGHT,
  });

  // Load saved slider weights from localStorage
  useEffect(() => {
    if (enableSlider && username && typeof window !== 'undefined') {
      const savedUp = localStorage.getItem(`voteWeight-${username}${isComment ? '-comment' : ''}`);
      const savedDown = localStorage.getItem(`voteWeightDown-${username}${isComment ? '-comment' : ''}`);
      
      if (savedUp) {
        setSliderWeight(prev => ({ ...prev, up: Number(savedUp) }));
      }
      if (savedDown) {
        setSliderWeight(prev => ({ ...prev, down: Number(savedDown) }));
      }
    }
  }, [enableSlider, username, isComment]);

  // Find user's vote
  const myVote = post.active_votes?.find((v) => v.voter === username);
  const myVoteWeight = myVote ? myVote.weight : 0;
  const myVotePercent = myVoteWeight > 0 ? myVoteWeight : (myVoteWeight < 0 ? -myVoteWeight : 0);

  // Calculate rshares (simplified, would need net_vests from user account)
  const calculateRshares = (weight: number): number => {
    // Placeholder calculation - in real implementation, would use user's net_vests
    const netVests = 1000000; // Mock value
    return Math.floor(0.05 * netVests * 1e6 * (weight / 10000.0));
  };

  const handleVote = (up: boolean) => {
    if (!username) {
      dispatch(showLogin());
      return;
    }

    if (voting) return;

    let weight: number;
    if (myVoteWeight > 0 || myVoteWeight < 0) {
      // If there is a current vote, we're clearing it
      weight = 0;
    } else if (enableSlider && showWeight) {
      // If slider is enabled and shown, read its value
      weight = up ? sliderWeight.up : -sliderWeight.down;
    } else {
      // Otherwise, use max power
      weight = up ? MAX_WEIGHT : -MAX_WEIGHT;
    }

    const rshares = calculateRshares(Math.abs(weight));
    const isFlag = up ? null : true;

    // Generate confirmation message
    const confirm = () => {
      if (myVoteWeight == null) return null; // New vote, no confirmation needed

      if (weight === 0) {
        return isFlag
          ? 'Removing your vote'
          : 'Removing your vote will reset curation rewards for this post';
      }
      if (weight > 0) {
        return isFlag
          ? 'Changing to an upvote'
          : 'Changing to an upvote will reset curation rewards for this post';
      }
      if (weight < 0) {
        return isFlag
          ? 'Changing to a downvote'
          : 'Changing to a downvote will reset curation rewards for this post';
      }
      return null;
    };

    // Set voting state for immediate feedback
    dispatch(
      set({
        key: `transaction_vote_active_${post.author}_${post.permlink}`,
        value: true,
      })
    );

    // Update vote in global state immediately (optimistic update)
    dispatch(
      voted({
        voter: username!,
        author: post.author,
        permlink: post.permlink,
        weight,
      })
    );

    // Dispatch vote operation
    dispatch(
      broadcastOperation({
        type: 'vote',
        operation: {
          voter: username,
          author: post.author,
          permlink: post.permlink,
          weight,
          __rshares: rshares,
          __config: {
            title: weight < 0 ? 'Confirm Downvote' : null,
          },
        },
        confirm: confirm(),
        errorCallback: (errorKey: string) => {
          console.error('Transaction Error:', errorKey);
          // Reset voting state on error
          dispatch(
            set({
              key: `transaction_vote_active_${post.author}_${post.permlink}`,
              value: false,
            })
          );
        },
      })
    );

    // Hide weight slider after voting
    if (showWeight) {
      setShowWeight(false);
    }
  };

  const handleWeightChange = (up: boolean, weight: number) => {
    if (up) {
      setSliderWeight(prev => ({ ...prev, up: weight }));
    } else {
      setSliderWeight(prev => ({ ...prev, down: weight }));
    }
  };

  const saveSliderWeight = (up: boolean) => {
    if (!username || !enableSlider) return;
    
    const weight = up ? sliderWeight.up : sliderWeight.down;
    const key = `voteWeight${up ? '' : 'Down'}-${username}${isComment ? '-comment' : ''}`;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, weight.toString());
    }
  };

  const toggleWeightSlider = () => {
    setShowWeight(!showWeight);
  };

  const upvoteActive = myVoteWeight > 0;
  const downvoteActive = myVoteWeight < 0;

  // Format pending payout
  const formatPayout = (payout: string | undefined): string => {
    if (!payout) return '0.000 SBD';
    return payout;
  };

  return (
    <div className="Voting flex items-center gap-2">
      {/* Upvote button */}
      <div className="relative">
        <button
          onClick={() => handleVote(true)}
          disabled={voting}
          className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
            upvoteActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={upvoteActive ? 'Remove upvote' : 'Upvote'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
          {upvoteActive && <span className="text-xs">✓</span>}
        </button>

        {/* Weight slider for upvote */}
        {enableSlider && showWeight && (
          <div className="absolute bottom-full left-0 mb-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vote Weight: {sliderWeight.up / 100}%
              </label>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                step={100}
                value={sliderWeight.up}
                onChange={(e) => {
                  const weight = Number(e.target.value);
                  handleWeightChange(true, weight);
                  saveSliderWeight(true);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>100%</span>
              </div>
            </div>
            <button
              onClick={() => handleVote(true)}
              className="w-full px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Vote {sliderWeight.up / 100}%
            </button>
          </div>
        )}
      </div>

      {/* Pending payout */}
      {post.pending_payout_value && (
        <span className="text-sm text-gray-600">
          {formatPayout(post.pending_payout_value)}
        </span>
      )}

      {/* Downvote button */}
      <div className="relative">
        <button
          onClick={() => handleVote(false)}
          disabled={voting}
          className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
            downvoteActive
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={downvoteActive ? 'Remove downvote' : 'Downvote'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 10-2 0v-3.586L7.707 10.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 9.414V13z" clipRule="evenodd" />
          </svg>
          {downvoteActive && <span className="text-xs">✓</span>}
        </button>

        {/* Weight slider for downvote */}
        {enableSlider && showWeight && (
          <div className="absolute bottom-full left-0 mb-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Downvote Weight: {sliderWeight.down / 100}%
              </label>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                step={100}
                value={sliderWeight.down}
                onChange={(e) => {
                  const weight = Number(e.target.value);
                  handleWeightChange(false, weight);
                  saveSliderWeight(false);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>100%</span>
              </div>
            </div>
            <button
              onClick={() => handleVote(false)}
              className="w-full px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Downvote {sliderWeight.down / 100}%
            </button>
          </div>
        )}
      </div>

      {/* Toggle weight slider button */}
      {enableSlider && (
        <button
          onClick={toggleWeightSlider}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
          title="Adjust vote weight"
        >
          {showWeight ? 'Hide' : 'Weight'}
        </button>
      )}

      {/* Vote count */}
      {showList && post.active_votes && post.active_votes.length > 0 && (
        <span className="text-xs text-gray-500 ml-2">
          ({post.active_votes.length} {post.active_votes.length === 1 ? 'vote' : 'votes'})
        </span>
      )}

      {/* My vote percentage display */}
      {myVotePercent > 0 && (
        <span className="text-xs text-gray-600">
          {myVotePercent / 100}%
        </span>
      )}
    </div>
  );
}
