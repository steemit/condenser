/**
 * Canonical Steem domain types.
 *
 * Single source of truth for the wire shapes that flow between the Steem
 * bridge RPC (lib/steem/client.ts), the /api/steem route handlers, the
 * browser fetch layer (lib/api/steem.ts) and Redux (store/slices/
 * globalSlice.ts). Before this module existed, near-identical copies of
 * these shapes lived in each layer and were cross-assigned through index
 * signatures, so field drift never surfaced at compile time.
 *
 * Narrowed consumer-side views are DERIVED from these types (Pick/Partial/
 * intersections) instead of being redeclared, keeping every intentional
 * narrowing visible and traceable back to the canonical shape.
 *
 * These describe the WIRE format (bridge / condenser_api JSON), not UI
 * state; UI-only extensions (e.g. the Redux collapsed flag) are derived in
 * the consumer.
 */

// ---------------------------------------------------------------------------
// Post (bridge get_ranked_posts / get_account_posts / get_discussion rows)
// ---------------------------------------------------------------------------

/**
 * A vote entry on a post.
 *
 * The bridge API returns only {voter, rshares}; the rshares sign is the vote
 * direction ("0" = cleared vote). weight/percent exist only on the optimistic
 * Redux entries written by globalSlice.voted.
 */
export interface Vote {
  voter: string;
  rshares?: string | number;
  weight?: number;
  percent?: number;
  [key: string]: unknown;
}

/** Bridge post.stats — hivemind display hints for cards / voting UI. */
export interface PostStats {
  gray?: boolean;
  is_pinned?: boolean;
  total_votes?: number;
  [key: string]: unknown;
}

/** Parsed post json_metadata (only the fields app code reads are named). */
export interface PostJsonMetadata {
  tags?: string[];
  [key: string]: unknown;
}

/** Bridge post row (ranked feeds, account posts, discussion tree nodes). */
export interface Post {
  author: string;
  permlink: string;
  category: string;
  title: string;
  body: string;
  created: string;
  net_rshares?: string;
  children?: number;
  active_votes?: Vote[];
  pending_payout_value?: string;
  // Legacy bridge fields read by cards / voting UI.
  stats?: PostStats;
  author_reputation?: string | number;
  last_update?: string;
  community_title?: string;
  payout_at?: string;
  author_payout_value?: string;
  curator_payout_value?: string;
  json_metadata?: PostJsonMetadata;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// User profile (bridge get_profile response)
// ---------------------------------------------------------------------------

/**
 * Editable profile sub-object stored under (posting_)json_metadata.profile
 * and broadcast via account_update2. All fields are user-controlled and
 * optional; consumers must treat them as untrusted input.
 */
export interface ProfileMetadata {
  name?: string;
  about?: string;
  location?: string;
  website?: string;
  profile_image?: string;
  cover_image?: string;
  version?: number;
  [key: string]: unknown;
}

/** bridge get_profile stats block. */
export interface UserProfileStats {
  rank: number;
  following: number;
  followers: number;
}

/**
 * Bridge get_profile response.
 *
 * metadata (and metadata.profile) are optional: hivemind omits them for
 * accounts that never saved profile metadata.
 */
export interface UserProfile {
  id: number;
  name: string;
  created: string;
  active: string;
  post_count: number;
  reputation: string;
  blacklists: string[];
  stats: UserProfileStats;
  metadata?: {
    profile?: ProfileMetadata;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Community (bridge get_community response)
// ---------------------------------------------------------------------------

/** bridge community.context — viewer-dependent state (role/subscribed). */
export interface CommunityContext {
  role?: string;
  title?: string;
  subscribed?: boolean;
  [key: string]: unknown;
}

/** bridge community.settings — community-managed presentation fields. */
export interface CommunitySettings {
  avatar_url?: string;
  cover_url?: string;
  [key: string]: unknown;
}

/**
 * Bridge get_community response (canonical single-community shape).
 *
 * `team` rows are hivemind tuples [account, role, title] (legacy
 * CommunityPane.jsx / CommunityRoles.jsx destructure tuple[0..2]).
 * `context` arrives as an EMPTY ARRAY for anonymous callers — read it only
 * through lib/community.ts viewerRole()/viewerSubscribed(), which default
 * like legacy's Immutable getIn fallbacks.
 * All string fields are community-controlled and untrusted input (validate
 * before style/href sinks, as with ProfileMetadata).
 */
export interface Community {
  name: string;
  title: string;
  about?: string;
  description?: string;
  lang?: string;
  type_id?: number;
  subscribers?: number;
  sum_pending?: number;
  num_pending?: number;
  num_authors?: number;
  created_at?: string;
  is_nsfw?: boolean;
  flag_text?: string;
  settings?: CommunitySettings;
  context?: CommunityContext | unknown[];
  team?: [string, string, string | null][];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Account (condenser_api get_accounts row)
// ---------------------------------------------------------------------------

/**
 * Condenser_api get_accounts row — intentionally minimal. The chain account
 * carries many more fields (authorities, balances, manabars; the SDK's
 * ExtendedAccount protocol type covers the full wire shape). App code reads
 * a small named subset and goes through the index signature for the rest, so
 * this does not duplicate the SDK's protocol definition.
 */
export interface Account {
  name: string;
  [key: string]: unknown;
}
