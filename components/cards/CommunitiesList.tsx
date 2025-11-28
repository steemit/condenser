'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchUserSubscriptions, CommunitySubscription } from '@/lib/api/steem';

interface CommunitiesListProps {
  accountname: string;
}

/**
 * CommunitiesList component
 * Displays user's subscribed communities
 * Migrated from legacy/src/app/components/modules/CommunitySubscriberList.jsx
 */
export default function CommunitiesList({ accountname }: CommunitiesListProps) {
  const [communities, setCommunities] = useState<CommunitySubscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Load communities data
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
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading communities...</p>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">
          @{accountname} hasn't joined any communities yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {communities.map((community) => (
          <div
            key={community.name}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Community header */}
            <div className="flex items-start space-x-3 mb-3">
              {community.avatar_url ? (
                <img
                  src={community.avatar_url}
                  alt={community.title}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {community.title?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/trending/${community.name}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
                >
                  {community.title}
                </Link>
                <p className="text-sm text-gray-500 truncate">
                  {community.name}
                </p>
              </div>
            </div>

            {/* Community description */}
            {community.about && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {community.about}
              </p>
            )}

            {/* Community stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex space-x-4">
                {community.subscribers !== undefined && (
                  <span>
                    {community.subscribers.toLocaleString()} subscribers
                  </span>
                )}
                {community.num_authors !== undefined && (
                  <span>
                    {community.num_authors.toLocaleString()} authors
                  </span>
                )}
              </div>
              
              {/* User role in community */}
              {community.context?.role && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  community.context.role === 'admin' 
                    ? 'bg-red-100 text-red-800'
                    : community.context.role === 'mod'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {community.context.role}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                <Link
                  href={`/trending/${community.name}`}
                  className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  View Posts
                </Link>
                <Link
                  href={`/roles/${community.name}`}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Roles
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total count */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Member of {communities.length} communit{communities.length !== 1 ? 'ies' : 'y'}
      </div>
    </div>
  );
}
