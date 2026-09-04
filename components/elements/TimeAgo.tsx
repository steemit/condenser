'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * TimeAgo — relative timestamp like legacy's TimeAgoWrapper
 * ("3 hours ago"), with the absolute date in the title tooltip.
 * Re-renders every minute to stay fresh.
 */

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;

export type TimeAgoUnit =
  | 'just_now'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years';

/** Pick the time_ago.* message key and its count for a given age. */
export function timeAgoUnit(
  date: Date,
  now: number = Date.now()
): { unit: TimeAgoUnit; count: number } {
  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  if (seconds < 45) return { unit: 'just_now', count: 0 };
  const minutes = Math.floor(seconds / MINUTE);
  if (minutes < 45) return { unit: 'minutes', count: minutes };
  const hours = Math.floor(seconds / HOUR);
  if (hours < 22) return { unit: 'hours', count: hours };
  const days = Math.floor(seconds / DAY);
  if (days < 7) return { unit: 'days', count: days };
  const weeks = Math.floor(seconds / WEEK);
  if (weeks < 4) return { unit: 'weeks', count: weeks };
  const months = Math.floor(days / 30);
  if (months < 12) return { unit: 'months', count: months };
  return { unit: 'years', count: Math.floor(days / 365) };
}

interface TimeAgoProps {
  /** ISO date string (chain timestamps are UTC, e.g. "2024-01-01T12:00:00"). */
  date: string;
  className?: string;
  /** Optional prefix (legacy shows "payout " before payout times). */
  prefix?: string;
}

export default function TimeAgo({ date, className, prefix }: TimeAgoProps) {
  const t = useTranslations();
  // Chain timestamps have no timezone suffix; they are UTC.
  const d = new Date(date.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(date) ? date : date + 'Z');
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const { unit, count } = timeAgoUnit(d);

  return (
    <span className={className} title={d.toLocaleString()}>
      {prefix}
      {t(`time_ago.${unit}`, { count })}
    </span>
  );
}
