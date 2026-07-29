'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showLogin } from '@/store/slices/userSlice';
import { broadcastOperation } from '@/store/slices/transactionSlice';
import LoadingIndicator from '@/components/elements/LoadingIndicator';

interface SubscribeButtonProps {
  community: string;
  /** Current subscription state (from bridge community context). */
  subscribed?: boolean;
}

/**
 * SubscribeButton — legacy community subscribe toggle (SubscribeButton.jsx).
 * Text: Subscribe → Joined (hover: Leave); hollow style when subscribed.
 */
export default function SubscribeButton({
  community,
  subscribed = false,
}: SubscribeButtonProps) {
  const dispatch = useAppDispatch();
  const username = useAppSelector((s) => s.user.current?.username);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(subscribed);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!username) {
      dispatch(showLogin({}));
      return;
    }
    if (loading) return;
    setLoading(true);

    const json = [
      isSubscribed ? 'unsubscribe' : 'subscribe',
      { community },
    ];

    dispatch(
      broadcastOperation({
        type: 'custom_json',
        confirm: isSubscribed
          ? `Unsubscribe from ${community}?`
          : `Subscribe to ${community}?`,
        operation: {
          id: 'community',
          required_posting_auths: [username],
          json: JSON.stringify(json),
        },
        successCallback: () => {
          setIsSubscribed(!isSubscribed);
          setLoading(false);
        },
        errorCallback: () => {
          setLoading(false);
        },
      })
    );
  };

  const buttonText = isHovered
    ? isSubscribed
      ? 'Leave'
      : 'Subscribe'
    : isSubscribed
      ? 'Joined'
      : 'Subscribe';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={loading}
      className={`rounded-[3px] border border-[#06D6A9] px-4 py-1.5 text-sm font-bold transition-colors ${
        isSubscribed
          ? 'bg-transparent text-[#06D6A9] hover:bg-[#06D6A9] hover:text-white'
          : 'bg-[#06D6A9] text-white hover:opacity-90'
      } disabled:opacity-50`}
    >
      {loading ? <LoadingIndicator type="dots" /> : buttonText}
    </button>
  );
}
