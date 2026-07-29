'use client';

import Link from 'next/link';

interface TagListProps {
  tags?: string[];
  category?: string;
}

/**
 * TagList — legacy horizontal tag pills (TagList.scss): neutral gray chips,
 * the post's own category is excluded from the list.
 */
export default function TagList({ tags, category }: TagListProps) {
  const list = (tags || [])
    .map((t) => (t.startsWith('#') ? t.substring(1) : t))
    .filter((t) => t && t !== category);

  if (list.length === 0) return null;

  return (
    <div className="TagList__horizontal mx-auto mb-2 max-w-[40rem]">
      {list.map((tag) => (
        <Link
          key={tag}
          href={`/trending/${tag}`}
          className="m-[0.1rem_0.4rem_0.1rem_0] inline-block rounded-[0.3rem] border border-border bg-background px-[0.3rem] py-[0.1rem] text-[95%] text-foreground transition-all hover:border-[#788187] hover:text-foreground"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
