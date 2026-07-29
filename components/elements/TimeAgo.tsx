'use client';

import { useEffect, useState } from 'react';

/**
 * TimeAgo — relative timestamp like legacy's TimeAgoWrapper
 * ("3 hours ago"), with the absolute date in the title tooltip.
 * Re-renders every minute to stay fresh.
 */

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;

export function timeAgo(date: Date, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  if (seconds < 45) return 'just now';
  const minutes = Math.floor(seconds / MINUTE);
  if (minutes < 45) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(seconds / HOUR);
  if (hours < 22) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(seconds / DAY);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(seconds / WEEK);
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

interface TimeAgoProps {
  /** ISO date string (chain timestamps are UTC, e.g. "2024-01-01T12:00:00"). */
  date: string;
  className?: string;
  /** Optional prefix (legacy shows "payout " before payout times). */
  prefix?: string;
}

export default function TimeAgo({ date, className, prefix }: TimeAgoProps) {
  // Chain timestamps have no timezone suffix; they are UTC.
  const d = new Date(date.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(date) ? date : date + 'Z');
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} title={d.toLocaleString()}>
      {prefix}
      {timeAgo(d)}
    </span>
  );
}
