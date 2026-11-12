'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { fetchCommunitySubscribers } from '@/lib/api/steem';
import type { CommunitySubscriber } from '@/lib/api/steem';
import LoadingIndicator from '@/components/elements/LoadingIndicator';
import type { Community } from '@/types/steem';

// Legacy team row badges: .user_role (uppercase gray) / .affiliation pill
// (same strings as the sidebar pane's team list).
const roleBadge = 'ml-1 text-[0.8em] uppercase text-muted-foreground';
const affiliationBadge =
  'mx-1 rounded-[0.3rem] bg-muted px-[0.2rem] py-px text-xs font-normal [text-shadow:none]';

/**
 * CommunitySubscriberList — legacy modules/CommunitySubscriberList.jsx.
 * "Latest {title} Subscribers" dialog body, fed by bridge.list_subscribers.
 *
 * Legacy let moderators edit subscriber roles inline (UserTitle); role
 * editing is out of scope repo-wide today (the /roles page is read-only
 * too), so rows are display-only.
 */
export default function CommunitySubscriberList({
  community,
}: {
  community: Community;
}) {
  const t = useTranslations();
  const [subscribers, setSubscribers] = useState<CommunitySubscriber[]>([]);
  // Starts true: the fetch below only ever transitions it back to false.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCommunitySubscribers(community.name)
      .then((data) => {
        if (!cancelled) setSubscribers(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [community.name]);

  return (
    <div>
      <strong>
        {t('community_subscribers.latest_title', { title: community.title })}
      </strong>
      <hr className="my-3 border-border" />
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingIndicator type="circle" />
        </div>
      ) : (
        <div>
          {subscribers.map((s, idx) => (
            <div key={`${s.name}-${idx}`} className="py-0.5 text-[80%]">
              <Link
                href={`/@${s.name}`}
                className="text-accent-foreground hover:underline"
              >
                @{s.name}
              </Link>
              {s.role && <span className={roleBadge}> {s.role} </span>}
              {s.title && <span className={affiliationBadge}>{s.title}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
