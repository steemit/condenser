'use client';

import { createContext, useContext } from 'react';

import type { Community } from '@/types/steem';

/**
 * Page-scoped community context (community feed pages /<sort>/hive-*).
 *
 * The [sort]/[tag] page fetches bridge.get_community once and provides it
 * here; both the feed banner (center column) and the sidebar pane (right
 * rail, rendered inside FeedLayout) consume it. cachedFetch does not dedupe
 * concurrent cold requests, so sharing via context is what keeps this at one
 * RPC per page view — widgets must not refetch on their own.
 *
 * Null means "not a community / not loadable" — consumers render nothing,
 * matching legacy's absent state.global.community entry.
 */
const CommunityContext = createContext<Community | null>(null);

export function CommunityProvider({
  community,
  children,
}: {
  community: Community | null;
  children: React.ReactNode;
}) {
  return (
    <CommunityContext.Provider value={community}>
      {children}
    </CommunityContext.Provider>
  );
}

/** The current page's community, or null outside community feeds. */
export function useCommunity(): Community | null {
  return useContext(CommunityContext);
}
