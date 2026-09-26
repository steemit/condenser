import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/auth/session';
import { SortFeed } from '@/components/feed/SortFeed';

/**
 * Home page — legacy parity (server-rendered, no client redirect flash).
 *
 * Legacy ResolveRoute.js maps `/` to PostsIndex ['trending'] and SSRs the
 * trending feed at `/` directly; logged-in sessions are redirected to
 * /trending/my first (legacy src/server/server.js: "redirect to home
 * page/feed if known account"). The rewrite previously shipped a
 * client-side replace('/trending'), which flashed a loading shell and put
 * /trending in the address bar.
 *
 * Living in the (main) route group gives `/` the full AppShell (header,
 * navigation, right rail) while the URL stays `/`.
 */
export default async function HomePage() {
  const session = await getServerSession();
  if (session?.username) {
    redirect('/trending/my');
  }
  return <SortFeed sort="trending" />;
}
