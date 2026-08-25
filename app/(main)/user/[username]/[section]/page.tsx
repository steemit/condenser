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

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { username } = await params;
  const accountname = normalizeUsername(username).toLowerCase();
  try {
    const profile = (await getProfile({ account: accountname })) as BridgeProfile | null;
    return buildAccountMetadata(accountname, profile?.metadata?.profile ?? null);
  } catch (error) {
    console.error('generateMetadata: failed to fetch profile:', error);
    return { title: 'Steemit' };
  }
}

export default function UserProfileSectionPage() {
  return <UserSectionClient />;
}
