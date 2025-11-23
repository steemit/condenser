'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

interface VotingProps {
  post: {
    author: string;
    permlink: string;
    net_rshares?: string;
    active_votes?: Array<{
      voter: string;
      weight: number;
    }>;
    pending_payout_value?: string;
  };
  onVote?: (weight: number) => void;
}

/**
 * Voting component
 * Handles upvotes and downvotes for posts
 * Simplified version migrated from legacy/src/app/components/elements/Voting.jsx
 */
export default function Voting({ post, onVote }: VotingProps) {
  const [voting, setVoting] = useState(false);
  const username = useAppSelector((state) => state.user.current?.username);

  // Find user's vote
  const myVote = post.active_votes?.find((v) => v.voter === username);
  const myVoteWeight = myVote ? myVote.weight : 0;

  const handleVote = async (weight: number) => {
    if (!username) {
      // TODO: Show login modal
      return;
    }

    if (voting) return;

    setVoting(true);
    try {
      // If already voted with same weight, remove vote (weight = 0)
      const newWeight = myVoteWeight === weight ? 0 : weight;
      
      if (onVote) {
        await onVote(newWeight);
      } else {
        // TODO: Dispatch vote action to Redux
        console.log('Vote:', { author: post.author, permlink: post.permlink, weight: newWeight });
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleUpvote = () => handleVote(10000); // Max weight
  const handleDownvote = () => handleVote(-10000); // Max negative weight

  const upvoteActive = myVoteWeight > 0;
  const downvoteActive = myVoteWeight < 0;

  return (
    <div className="Voting flex items-center gap-2">
      <button
        onClick={handleUpvote}
        disabled={voting}
        className={`px-3 py-1 rounded transition-colors ${
          upvoteActive
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Upvote"
      >
        ▲ {upvoteActive && '✓'}
      </button>
      
      <button
        onClick={handleDownvote}
        disabled={voting}
        className={`px-3 py-1 rounded transition-colors ${
          downvoteActive
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Downvote"
      >
        ▼ {downvoteActive && '✓'}
      </button>

      {post.pending_payout_value && (
        <span className="text-sm text-gray-600 ml-2">
          {post.pending_payout_value}
        </span>
      )}
    </div>
  );
}

