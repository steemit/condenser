'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchUserSubscriptions, CommunitySubscription } from '@/lib/api/steem';
import LoadingIndicator from '@/components/elements/LoadingIndicator';

interface CommunitiesListProps {
  accountname: string;
}

/**
 * CommunitiesList — a user's community subscriptions, as a simple list
 * (legacy cards/SubscriptionsList.jsx): h4 + one row per community with
 * role/affiliation text labels.
 */
export default function CommunitiesList({ accountname }: CommunitiesListProps) {
  const [communities, setCommunities] = useState<CommunitySubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCommunities = async () => {
      setLoading(true);
      try {
        const data = await fetchUserSubscriptions(accountname);
        setCommunities(data);
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, [accountname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator type="circle" />
      </div>
    );
  }

  return (
    <div className="SubscriptionsList mt-4">
      <h4 className="mb-2 font-bold text-foreground">Subscriptions</h4>
      {communities.length === 0 ? (
        <div className="rounded-[6px] border border-border bg-card px-6 py-8 text-center text-muted-foreground">
          @{accountname} hasn&apos;t joined any communities yet.
        </div>
      ) : (
        <ul>
          {communities.map((community) => (
            <li key={community.name} className="border-b border-border py-2">
              <Link
                href={`/trending/${community.name}`}
                className="font-semibold text-foreground hover:text-accent-foreground"
              >
                {community.title}
              </Link>
              {community.context?.role && community.context.role !== 'guest' && (
                <span className="user_role mx-1 text-[0.8em] uppercase text-gray-500">
                  {community.context.role}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
