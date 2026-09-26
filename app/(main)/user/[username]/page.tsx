import type { Metadata } from 'next';
import { getProfile } from '@/lib/steem/client';
import { normalizeUsername } from '@/lib/utils/username';
import { buildAccountMetadata } from '@/lib/seo';
import type { UserProfile } from '@/types/steem';
import UserRedirectClient from './UserRedirectClient';

/**
 * User profile page root (server shell; redirects to /@username/blog).
 * Route: /@[username]
 * Note: proxy.ts ensures only @username format reaches here.
 *
 * generateMetadata ports legacy ExtractMeta.addAccountMeta. Profile fetch
 * failures degrade to account-name defaults; hard errors to a bare title —
 * metadata must never 500 the page.
 */
interface PageParams {
  username: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { username } = await params;
  const accountname = normalizeUsername(username).toLowerCase();
  try {
    const profile = (await getProfile({ account: accountname })) as UserProfile | null;
    return buildAccountMetadata(accountname, profile?.metadata?.profile ?? null);
  } catch (error) {
    console.error('generateMetadata: failed to fetch profile:', error);
    return { title: 'Steemit' };
  }
}

export default function UserProfilePage() {
  return <UserRedirectClient />;
}
