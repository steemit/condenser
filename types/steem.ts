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
  time?: string;
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
