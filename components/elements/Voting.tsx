'use client';

import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { showLogin } from '@/store/slices/userSlice';
import { broadcastOperation } from '@/store/slices/transactionSlice';
import { voted, set } from '@/store/slices/globalSlice';
import { Post } from '@/lib/api/steem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VotingProps {
  post: Post;
  showList?: boolean;
  enableSlider?: boolean;
  isComment?: boolean;
}

const MAX_WEIGHT = 10000;
const MIN_WEIGHT = 100;
const MAX_VOTES_DISPLAY = 20;

/** "$12.34" from "12.345 SBD" (legacy FormattedAsset). */
function fmtPayout(value?: string | number): string {
  if (value === undefined || value === null) return '$0.00';
  const amount = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
}

/** Legacy chevron-up/down-circle icons (assets/icons/chevron-*-circle.svg). */
function ChevronCircle({
  dir,
  className,
}: {
  dir: 'up' | 'down';
  className?: string;
}) {
  return (
    <svg viewBox="0 0 33 33" className={className} aria-hidden>
      {dir === 'up' ? (
        <path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" />
      ) : (
        <path d="M22.3,12.393l-6.285,6.195l-6.285-6.196c-0.394-0.391-1.034-0.391-1.429,0 c-0.394,0.391-0.394,1.024,0,1.414l6.999,6.9c0.384,0.38,1.044,0.381,1.429,0l6.999-6.899c0.394-0.391,0.394-1.024,0-1.414 C23.334,12.003,22.695,12.003,22.3,12.393z" />
      )}
    </svg>
  );
}

/** Circle outline + chevron, colored by direction/state (legacy Voting.scss). */
function VoteCircle({
  dir,
  active,
  voting,
  onClick,
  title,
}: {
  dir: 'up' | 'down';
  active: boolean;
  voting: boolean;
  onClick: () => void;
  title: string;
}) {
  const color = dir === 'up' ? 'text-[#1FBF8F] dark:text-[#06D6A9]' : 'text-[#f99]';
  const hover =
    dir === 'up'
      ? 'hover:text-white hover:[&_.v-circle]:fill-[#004EFF] hover:[&_.v-circle]:stroke-[#004EFF] dark:hover:[&_.v-circle]:fill-[#06D6A9] dark:hover:[&_.v-circle]:stroke-[#06D6A9]'
      : 'hover:text-white hover:[&_.v-circle]:fill-[#f66] hover:[&_.v-circle]:stroke-[#f66]';
  const activeFill =
    dir === 'up'
      ? '[&_.v-circle]:fill-[#004EFF] [&_.v-circle]:stroke-[#004EFF] dark:[&_.v-circle]:fill-[#06D6A9] dark:[&_.v-circle]:stroke-[#06D6A9] text-white'
      : '[&_.v-circle]:fill-[#f66] [&_.v-circle]:stroke-[#f66] text-white';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={voting}
      title={title}
      className={`relative inline-flex rounded-full transition-colors ${color} ${hover} ${
        active ? activeFill : ''
      } ${voting ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {voting ? (
        <span
          className={`block size-[22px] animate-spin rounded-full border-2 ${
            dir === 'up' ? 'border-[#06D6A9]' : 'border-[#f66]'
          } border-t-transparent`}
        />
      ) : (
        <span className="relative inline-flex size-[22px] items-center justify-center">
          <svg viewBox="0 0 33 33" className="absolute inset-0 size-full" aria-hidden>
            <circle
              cx="16"
              cy="16"
              r="15"
              fill="none"
              stroke="currentColor"
              className="v-circle"
            />
          </svg>
          <ChevronCircle dir={dir} className="relative size-[14px] fill-current" />
        </span>
      )}
    </button>
  );
}

/**
 * Voting — legacy layout: circular up/down icons, $ payout with details
 * dropdown, "N votes" dropdown listing voters (elements/Voting.jsx).
 */
export default function Voting({
  post,
  showList = true,
  enableSlider = false,
  isComment = false,
}: VotingProps) {
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.user.current?.username);
  const voting = useAppSelector((state) => {
    const key = `transaction_vote_active_${post.author}_${post.permlink}`;
    return state.global[key] || false;
  });

  const [showWeight, setShowWeight] = useState<'up' | 'down' | null>(null);
  const [sliderWeight, setSliderWeight] = useState({
    up: MAX_WEIGHT,
    down: MAX_WEIGHT,
  });
  const sliderLoaded = useRef(false);

  // Read saved slider weights on demand (when the slider opens) instead of
  // in an effect, to keep this component SSR-safe without cascading renders.
  const loadSliderWeights = () => {
    if (!enableSlider || !username || typeof window === 'undefined') return;
    if (sliderLoaded.current) return;
    sliderLoaded.current = true;
    const savedUp = localStorage.getItem(
      `voteWeight-${username}${isComment ? '-comment' : ''}`
    );
    const savedDown = localStorage.getItem(
      `voteWeightDown-${username}${isComment ? '-comment' : ''}`
    );
    setSliderWeight((prev) => ({
      up: savedUp ? Number(savedUp) : prev.up,
      down: savedDown ? Number(savedDown) : prev.down,
    }));
  };

  // Find user's vote
  const myVote = post.active_votes?.find((v) => v.voter === username);
  const myVoteWeight = myVote ? myVote.weight : 0;

  const calculateRshares = (weight: number): number => {
    const netVests = 1000000; // Mock value, as before
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
      weight = 0; // clearing an existing vote
    } else if (enableSlider && showWeight) {
      weight = up ? sliderWeight.up : -sliderWeight.down;
    } else {
      weight = up ? MAX_WEIGHT : -MAX_WEIGHT;
    }

    const rshares = calculateRshares(Math.abs(weight));
    const isFlag = up ? null : true;

    const confirm = () => {
      if (myVoteWeight == null) return null;
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

    dispatch(
      set({
        key: `transaction_vote_active_${post.author}_${post.permlink}`,
        value: true,
      })
    );

    dispatch(
      voted({
        voter: username!,
        author: post.author,
        permlink: post.permlink,
        weight,
      })
    );

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
          dispatch(
            set({
              key: `transaction_vote_active_${post.author}_${post.permlink}`,
              value: false,
            })
          );
        },
      })
    );

    if (showWeight) setShowWeight(null);
  };

  const handleChevronClick = (up: boolean) => {
    if (!username) {
      dispatch(showLogin());
      return;
    }
    // Legacy: with the slider enabled and no existing vote, the chevron
    // opens the weight dropdown; otherwise it votes directly.
    if (enableSlider && myVoteWeight === 0) {
      loadSliderWeights();
      setShowWeight(showWeight === (up ? 'up' : 'down') ? null : up ? 'up' : 'down');
      return;
    }
    handleVote(up);
  };

  const saveSliderWeight = (up: boolean, weight: number) => {
    if (!username || !enableSlider) return;
    const key = `voteWeight${up ? '' : 'Down'}-${username}${isComment ? '-comment' : ''}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, weight.toString());
    }
  };

  const upvoteActive = myVoteWeight > 0;
  const downvoteActive = myVoteWeight < 0;

  const totalVotes = post.stats?.total_votes ?? post.active_votes?.length ?? 0;
  type Vote = { voter: string; weight: number; rshares?: number | string; percent?: number };
  const votes = [...((post.active_votes ?? []) as Vote[])]
    .sort(
      (a, b) =>
        Math.abs(Number(b.rshares ?? b.weight)) -
        Math.abs(Number(a.rshares ?? a.weight))
    )
    .slice(0, MAX_VOTES_DISPLAY);
  const extraVoters = Math.max(0, totalVotes - votes.length);

  const payoutValue =
    post.pending_payout_value ?? (post.payout !== undefined ? String(post.payout) : undefined);

  return (
    <span className="Voting inline-flex items-center">
      <span className="Voting__inner inline-flex items-center gap-1 border-r border-border py-0.5 pr-[0.8rem] mr-[0.6rem]">
        <span className="relative">
          <VoteCircle
            dir="up"
            active={upvoteActive}
            voting={Boolean(voting)}
            onClick={() => handleChevronClick(true)}
            title={upvoteActive ? 'Remove Vote' : 'Upvote'}
          />
          {enableSlider && showWeight === 'up' && (
            <div className="absolute left-1/2 top-full z-[100] mt-1 w-[180px] -translate-x-1/2 rounded-[6px] border border-border bg-card p-3 shadow-lg">
              <div className="mb-1 text-center font-bold text-accent-foreground">
                {sliderWeight.up / 100}%
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                step={100}
                value={sliderWeight.up}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setSliderWeight((prev) => ({ ...prev, up: w }));
                  saveSliderWeight(true, w);
                }}
                className="w-full"
                aria-label="Vote weight"
              />
              <button
                type="button"
                onClick={() => handleVote(true)}
                className="mt-2 w-full rounded bg-[#06D6A9] px-2 py-1 text-sm font-bold text-white"
              >
                Vote {sliderWeight.up / 100}%
              </button>
            </div>
          )}
        </span>

        <span className="relative">
          <VoteCircle
            dir="down"
            active={downvoteActive}
            voting={Boolean(voting)}
            onClick={() => handleChevronClick(false)}
            title={downvoteActive ? 'Remove Vote' : 'Downvote'}
          />
          {enableSlider && showWeight === 'down' && (
            <div className="absolute left-1/2 top-full z-[100] mt-1 w-[180px] -translate-x-1/2 rounded-[6px] border border-border bg-card p-3 shadow-lg">
              <div className="mb-1 text-center font-bold text-[#f66]">
                -{sliderWeight.down / 100}%
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                step={100}
                value={sliderWeight.down}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setSliderWeight((prev) => ({ ...prev, down: w }));
                  saveSliderWeight(false, w);
                }}
                className="w-full"
                aria-label="Downvote weight"
              />
              <button
                type="button"
                onClick={() => handleVote(false)}
                className="mt-2 w-full rounded bg-[#f66] px-2 py-1 text-sm font-bold text-white"
              >
                Downvote {sliderWeight.down / 100}%
              </button>
            </div>
          )}
        </span>

        {payoutValue !== undefined && (
          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton={false}
              render={
                <button
                  type="button"
                  className="flex items-center gap-0.5 px-1 text-foreground hover:text-accent-foreground"
                  title="Payout details"
                />
              }
            >
              <span>{fmtPayout(payoutValue)}</span>
              <svg viewBox="0 0 10 6" className="size-2 fill-current" aria-hidden>
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              <DropdownMenuItem disabled>
                Pending Payout {fmtPayout(post.pending_payout_value)}
              </DropdownMenuItem>
              {post.payout_at && (
                <DropdownItemText text={`Payout Date ${new Date(post.payout_at + 'Z').toLocaleString()}`} />
              )}
              {post.author_payout_value && (
                <DropdownItemText text={`Author Payout ${fmtPayout(post.author_payout_value)}`} />
              )}
              {post.curator_payout_value && (
                <DropdownItemText text={`Curator Payout ${fmtPayout(post.curator_payout_value)}`} />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </span>

      {showList && totalVotes > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            render={
              <button
                type="button"
                className="px-1 text-foreground hover:text-accent-foreground"
                title="Voters"
              />
            }
          >
            {totalVotes} vote{totalVotes === 1 ? '' : 's'}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {votes.map((v) => (
              <DropdownItemText
                key={v.voter}
                text={`${Number(v.weight) < 0 ? '-' : '+'} ${v.voter}`}
              />
            ))}
            {extraVoters > 0 && (
              <DropdownItemText text={`and ${extraVoters} more`} />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </span>
  );
}

function DropdownItemText({ text }: { text: string }) {
  return (
    <div className="px-2 py-1.5 text-sm text-foreground">{text}</div>
  );
}
