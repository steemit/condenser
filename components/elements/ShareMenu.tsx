'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ShareMenuProps {
  url: string;
  title: string;
  description?: string;
}

/**
 * ShareMenu component
 * Provides sharing options for posts (Facebook, Twitter, Reddit, LinkedIn)
 * Migrated from legacy/src/app/components/elements/ShareMenu.jsx
 */
export default function ShareMenu({ url, title, description }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}`
    : url;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/share?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
    reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?title=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}&source=Steemit&mini=true`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const shareUrl = shareLinks[platform];
    const width = 600;
    const height = 400;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    window.open(
      shareUrl,
      'Share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,status=0`
    );
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
      >
        Share
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => handleShare('facebook')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Twitter
              </button>
              <button
                onClick={() => handleShare('reddit')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Reddit
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                LinkedIn
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

