'use client';

import Link from 'next/link';

interface UserProfileHeaderProps {
  accountname: string;
  profile?: {
    name?: string;
    about?: string;
    location?: string;
    website?: string;
    profile_image?: string;
    cover_image?: string;
    [key: string]: any;
  } | null;
  currentUser?: string;
}

/**
 * UserProfileHeader component
 * Displays user profile information header
 * Migrated from legacy/src/app/components/cards/UserProfileHeader.jsx
 */
export default function UserProfileHeader({
  accountname,
  profile,
  currentUser,
}: UserProfileHeaderProps) {
  const isMyAccount = currentUser === accountname;
  const displayName = profile?.name || accountname;

  return (
    <div className="user-profile-header mb-8">
      {/* Cover image */}
      {profile?.cover_image && (
        <div
          className="h-48 bg-cover bg-center rounded-t-lg"
          style={{ backgroundImage: `url(${profile.cover_image})` }}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Profile image */}
          <div className="shrink-0">
            {profile?.profile_image ? (
              <img
                src={profile.profile_image}
                alt={displayName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                {accountname.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {displayName}
            </h1>
            <p className="text-gray-600 mb-4">@{accountname}</p>

            {profile?.about && (
              <p className="text-gray-700 mb-4">{profile.about}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  📍 {profile.location}
                </span>
              )}
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  🔗 Website
                </a>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex gap-2">
              {isMyAccount ? (
                <>
                  <Link
                    href={`/${accountname}/settings`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/submit"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    New Post
                  </Link>
                </>
              ) : (
                <>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Follow
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

