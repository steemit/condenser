import type { Metadata } from 'next';
import { getProfile } from '@/lib/steem/client';
import { normalizeUsername } from '@/lib/utils/username';
import { buildAccountMetadata, type SeoProfile } from '@/lib/seo';
import UserSectionClient from './UserSectionClient';

/**
 * User profile page with section (server shell).
 * Route: /@[username]/[section]
 * Sections: blog, posts, comments, replies, payout, feed, followers, followed, settings, notifications, communities
 * Note: proxy.ts ensures only @username format reaches here
 *
 * generateMetadata ports legacy ExtractMeta.addAccountMeta. Profile fetch
 * failures degrade to account-name defaults; hard errors to a bare title —
 * metadata must never 500 the page.
 */
interface PageParams {
  username: string;
  section: string;
}

interface BridgeProfile {
  metadata?: { profile?: SeoProfile };
}

/**
 * Sections that render account UI instead of public content: settings is the
 * own-account settings editor (gated to its owner) and notifications is the
 * signed-in user's inbox. Both are emitted with robots noindex. Legacy had no
 * noindex anywhere, but these pages carry no indexable content; every other
 * section (blog, comments, followers, ...) stays indexable for legacy parity.
 */
const PRIVATE_SECTIONS = new Set(['settings', 'notifications']);

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { username, section } = await params;
  const accountname = normalizeUsername(username).toLowerCase();
  // Private sections stay noindex even on the fetch-failure fallback.
  const robots = PRIVATE_SECTIONS.has(section)
    ? { index: false, follow: false }
    : undefined;
  try {
    const profile = (await getProfile({ account: accountname })) as BridgeProfile | null;
    return buildAccountMetadata(accountname, profile?.metadata?.profile ?? null, {
      noindex: PRIVATE_SECTIONS.has(section),
    });
  } catch (error) {
    console.error('generateMetadata: failed to fetch profile:', error);
    return robots ? { title: 'Steemit', robots } : { title: 'Steemit' };
  }
}

export default function UserProfileSectionPage() {
  return <UserSectionClient />;
}
