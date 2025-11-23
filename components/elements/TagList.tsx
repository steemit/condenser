'use client';

import Link from 'next/link';

interface TagListProps {
  tags?: string[];
  category?: string;
}

/**
 * TagList component
 * Displays tags for a post
 */
export default function TagList({ tags, category }: TagListProps) {
  if (!tags || tags.length === 0) {
    if (!category) return null;
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${category}`}
          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          #{category}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => {
        const tagName = tag.startsWith('#') ? tag.substring(1) : tag;
        return (
          <Link
            key={index}
            href={`/${tagName}`}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            #{tagName}
          </Link>
        );
      })}
    </div>
  );
}

