'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import MarkdownViewer from '@/components/elements/MarkdownViewer';

interface Notice {
  status: number;
  body: Record<string, string>;
}

/**
 * Announcement — right-rail notices module (legacy pages/Announcement.jsx).
 * Fetches turtle.get_notices via /api/steem/notices and renders active
 * notices (status === 1) as markdown, localized en/cn like legacy.
 */
export default function Announcement() {
  const locale = useLocale();
  const t = useTranslations();
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/steem/notices')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.data)) setNotices(data.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const active = notices.filter((n) => n.status === 1);
  if (active.length === 0) return null;

  const langKey = locale === 'zh' ? 'cn' : 'en';

  return (
    <div className="c-sidebar__module mb-4 rounded-[6px] border border-border bg-card p-[1.5em]">
      <div className="c-sidebar__content">
        <ul className="c-sidebar__list_ann">
          <li>
            <div className="c-sidebar__header mb-2 font-bold text-foreground">
              {t('g.announcement')}
            </div>
          </li>
          {active.map((notice, i) => (
            <li key={i}>
              <MarkdownViewer
                text={notice.body?.[langKey] ?? notice.body?.en ?? ''}
                className="Announcement__content"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
