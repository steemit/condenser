'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setPathname } from '@/store/slices/globalSlice';
import { fetchCommunityRoles, fetchCommunitySubscribers, CommunityRole, CommunitySubscriber } from '@/lib/api/steem';
import Link from 'next/link';

interface CommunityRolesPageProps {
  params: {
    tag: string;
  };
}

export default function CommunityRolesPage({ params }: CommunityRolesPageProps) {
  const dispatch = useAppDispatch();
  const { tag } = useParams();
  const [roles, setRoles] = useState<CommunityRole[]>([]);
  const [subscribers, setSubscribers] = useState<CommunitySubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'subscribers'>('roles');

  useEffect(() => {
    dispatch(setPathname(`/roles/${tag}`));
  }, [dispatch, tag]);

  // Load community data
  useEffect(() => {
    const loadData = async () => {
      if (!tag || typeof tag !== 'string') return;
      
      setLoading(true);
      try {
        const [rolesData, subscribersData] = await Promise.all([
          fetchCommunityRoles(tag),
          fetchCommunitySubscribers(tag),
        ]);
        setRoles(rolesData);
        setSubscribers(subscribersData);
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tag]);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mod':
        return 'bg-yellow-100 text-yellow-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading community data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Community Management</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <Link href={`/trending/${tag}`} className="hover:text-blue-600">
            {tag}
          </Link>
          <span>/</span>
          <span>Roles & Members</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roles ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscribers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subscribers ({subscribers.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'roles' ? (
        <div className="space-y-4">
          {roles.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No roles found for this community.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {roles.map((roleItem, index) => (
                <div
                  key={`${roleItem.name}-${index}`}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-400">
                      {roleItem.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <Link
                        href={`/@${roleItem.name}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        @{roleItem.name}
                      </Link>
                      {roleItem.title && (
                        <p className="text-sm text-gray-500">{roleItem.title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(roleItem.role)}`}>
                      {roleItem.role}
                    </span>
                    <Link
                      href={`/@${roleItem.name}`}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {subscribers.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No subscribers found for this community.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {subscribers.map((subscriber, index) => (
                <div
                  key={`${subscriber.name}-${index}`}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-400">
                      {subscriber.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <Link
                        href={`/@${subscriber.name}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        @{subscriber.name}
                      </Link>
                      {subscriber.title && (
                        <p className="text-sm text-gray-500">{subscriber.title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {subscriber.role && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(subscriber.role)}`}>
                        {subscriber.role}
                      </span>
                    )}
                    <Link
                      href={`/@${subscriber.name}`}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
