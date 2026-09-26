/**
 * Pending-broadcast overlay.
 *
 * Writes (votes, posts, edits, deletes) hit steemd immediately, but every
 * read path here goes through the bridge API backed by hivemind, which
 * indexes with a few seconds of lag. Within that window a page refresh
 * shows pre-write state — or a 404 for a brand-new post.
 *
 * This module records freshly broadcast changes in short-lived Redis keys
 * and merges them into read results AFTER the cache layer (merged data is
 * never written back to the content cache). Once hivemind catches up, the
 * chain data agrees with the overlay and the keys expire on their own.
 *
 * All functions degrade to no-ops when Redis is not configured.
 */

import { getRedis, redisKey } from '@/lib/cache/redis';
import type { Post, UserProfile } from '@/types/steem';

/** Covers the P99 hivemind indexing delay by a wide margin. */
export const PENDING_TTL_SEC = 120;

/** Max tree levels walked when merging pending replies into a discussion. */
const MAX_OVERLAY_DEPTH = 8;

export interface PendingVote {
  weight: number;
  ts: number;
}

export interface PendingContent {
  ts: number;
  post?: Record<string, unknown>;
}

export interface PendingProfile {
  ts: number;
  profile: Record<string, unknown>;
}

/** Subset of the bridge get_profile response the profile overlay touches,
 *  derived from the canonical UserProfile. */
export type ProfileLike = Pick<UserProfile, 'metadata'> & {
  [key: string]: unknown;
}

/**
 * Subset of the canonical Post the overlay reads and merges, derived (not
 * redeclared) from types/steem.ts. All named fields are optional on purpose:
 * the overlay guards on missing author/permlink before consulting Redis, and
 * partially-indexed bridge rows are normal inside the merge window.
 */
export type PostLike = Partial<
  Pick<Post, 'author' | 'permlink' | 'active_votes' | 'stats' | 'last_update' | 'created'>
> & {
  [key: string]: unknown;
};

function voteKey(author: string, permlink: string): string {
  return redisKey(`steem:pendingvote:${author}:${permlink}`);
}

function rootPostKey(author: string, permlink: string): string {
  return redisKey(`steem:pendingroot:${author}:${permlink}`);
}

function childrenKey(parentAuthor: string, parentPermlink: string): string {
  return redisKey(`steem:pendingchildren:${parentAuthor}:${parentPermlink}`);
}

function tombstoneKey(author: string, permlink: string): string {
  return redisKey(`steem:pendingtomb:${author}:${permlink}`);
}

function profileKey(account: string): string {
  return redisKey(`steem:pendingprofile:${account}`);
}

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Bridge timestamps are UTC without a trailing 'Z'. */
function chainTime(s?: string): number {
  if (!s) return 0;
  return Date.parse(s.endsWith('Z') ? s : `${s}Z`) || 0;
}

// ---------------------------------------------------------------------------
// Write side (called from the broadcast route after a successful broadcast)
// ---------------------------------------------------------------------------

export async function recordPendingVote(
  author: string,
  permlink: string,
  voter: string,
  weight: number
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    const key = voteKey(author, permlink);
    const entry: PendingVote = { weight, ts: Date.now() };
    await r.hset(key, voter, JSON.stringify(entry));
    await r.expire(key, PENDING_TTL_SEC);
  } catch {
    // Overlay write failure is non-critical — reads fall back to chain data.
  }
}

/** Record a new or edited root post (parent_author === ''). */
export async function recordPendingRootPost(post: Record<string, unknown>): Promise<void> {
  const r = getRedis();
  if (!r) return;
  const author = String(post.author || '');
  const permlink = String(post.permlink || '');
  if (!author || !permlink) return;
  try {
    const entry: PendingContent = { ts: Date.now(), post };
    await r.set(rootPostKey(author, permlink), JSON.stringify(entry), 'EX', PENDING_TTL_SEC);
  } catch {
    // non-critical
  }
}

/** Record a new or edited reply, keyed under its immediate parent. */
export async function recordPendingChild(
  parentAuthor: string,
  parentPermlink: string,
  post: Record<string, unknown>
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  const author = String(post.author || '');
  const permlink = String(post.permlink || '');
  if (!author || !permlink) return;
  try {
    const key = childrenKey(parentAuthor, parentPermlink);
    const entry: PendingContent = { ts: Date.now(), post };
    await r.hset(key, `${author}/${permlink}`, JSON.stringify(entry));
    await r.expire(key, PENDING_TTL_SEC);
  } catch {
    // non-critical
  }
}

/** Record a delete_comment; merge drops the node until the indexer catches up. */
export async function recordPendingDeletion(author: string, permlink: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.set(tombstoneKey(author, permlink), String(Date.now()), 'EX', PENDING_TTL_SEC);
  } catch {
    // non-critical
  }
}

/**
 * Record an account_update2 profile save. `profile` is the profile sub-object
 * as broadcast (the op carries the complete new sub-object, including
 * version: 2) — recording happens only after the broadcast was accepted, so
 * the signer's posting authority authorizes it (same trust as chain data).
 */
export async function recordPendingProfile(
  account: string,
  profile: Record<string, unknown>
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  const normalized = account.toLowerCase();
  if (!normalized) return;
  try {
    const entry: PendingProfile = { ts: Date.now(), profile };
    await r.set(profileKey(normalized), JSON.stringify(entry), 'EX', PENDING_TTL_SEC);
  } catch {
    // non-critical
  }
}

/**
 * Build a bridge-shaped post object from a broadcast `comment` op, for
 * serving the post page/discussion before hivemind has indexed it.
 */
export function synthesizePostFromCommentOp(op: {
  parent_author?: string;
  parent_permlink?: string;
  author?: string;
  permlink?: string;
  title?: string;
  body?: string;
  json_metadata?: string;
}): Record<string, unknown> {
  const isRoot = !op.parent_author;
  let jsonMetadata: Record<string, unknown> = {};
  try {
    jsonMetadata = op.json_metadata ? JSON.parse(op.json_metadata) : {};
  } catch {
    // malformed metadata — keep empty
  }
  const now = new Date().toISOString();
  const category = isRoot ? op.parent_permlink || '' : '';
  return {
    author: op.author || '',
    permlink: op.permlink || '',
    category,
    title: op.title || '',
    body: op.body || '',
    created: now,
    last_update: now,
    depth: isRoot ? 0 : 1,
    parent_author: op.parent_author || '',
    parent_permlink: op.parent_permlink || '',
    children: 0,
    net_rshares: '0',
    active_votes: [],
    replies: [],
    pending_payout_value: '0.000 SBD',
    payout: 0,
    stats: { total_votes: 0, gray: false, hide: false, is_pinned: false },
    json_metadata: jsonMetadata,
    url: isRoot ? `/${category}/@${op.author}/${op.permlink}` : '',
  };
}

// ---------------------------------------------------------------------------
// Read side (called from lib/steem/client.ts after the cache layer)
// ---------------------------------------------------------------------------

/**
 * Merge a pending profile save into a bridge get_profile result.
 *
 * Convergence, mirroring the vote overlay's sign check: once the chain-side
 * profile already equals the saved one (hivemind indexed the save), the
 * overlay is a no-op. Within the window the saved profile replaces
 * metadata.profile wholesale — the broadcast carries the complete sub-object,
 * so fields the user cleared disappear too — while everything else on the
 * profile (stats, reputation, …) comes from chain data. A second save
 * rewrites the Redis key, so the overlay always reflects the newest intent.
 */
export async function applyProfileOverlay<T extends ProfileLike>(
  account: string,
  profile: T | null
): Promise<T | null> {
  const r = getRedis();
  if (!r) return profile;
  const normalized = account.toLowerCase();
  if (!normalized) return profile;

  try {
    const raw = await r.get(profileKey(normalized));
    if (!raw) return profile;
    const entry = parseJson<PendingProfile>(raw);
    if (
      !entry ||
      typeof entry.profile !== 'object' ||
      entry.profile === null ||
      Array.isArray(entry.profile)
    ) {
      return profile;
    }

    // The account exists on-chain (the profile route would 404 otherwise) —
    // anchor the merge so a partially-indexed response stays complete.
    const base: ProfileLike = profile ?? { id: 0, name: normalized };
    const existing = (base.metadata?.profile ?? {}) as Record<string, unknown>;
    const pending = entry.profile;
    const pendingKeys = Object.keys(pending);

    // Chain data wins once it already matches the saved profile (indexed):
    // same keys, same values. The broadcast carries the COMPLETE new profile
    // sub-object, so key-count equality also catches cleared fields.
    const converged =
      Object.keys(existing).length === pendingKeys.length &&
      pendingKeys.every((k) => existing[k] === pending[k]);
    if (converged) return profile;

    // Replace (not merge) the profile sub-object: the op carries the complete
    // new profile, so replacing also clears fields the user emptied. Fields
    // outside metadata.profile are chain-owned and preserved.
    const metadata = { ...(base.metadata ?? {}), profile: pending };
    return { ...base, metadata } as T;
  } catch {
    // Overlay read failure — fall back to chain data only.
    return profile;
  }
}

/** Merge pending votes into a single post's active_votes. */
export function mergePendingVotes<T extends PostLike>(
  post: T,
  pending: Record<string, PendingVote>
): T {
  const votes = [...(post.active_votes ?? [])];
  let changed = false;
  let totalVotesDelta = 0;
  for (const [voter, { weight }] of Object.entries(pending)) {
    const idx = votes.findIndex((v) => v.voter === voter);
    if (weight === 0) {
      // Cancellation: drop the voter's entry until the chain confirms.
      if (idx >= 0) {
        // A zero-rshares entry is already excluded from stats.total_votes,
        // so removing it must not decrement the count again.
        const hadWeight = Number(votes[idx].rshares ?? votes[idx].weight ?? 0) !== 0;
        votes.splice(idx, 1);
        if (hadWeight) totalVotesDelta -= 1;
        changed = true;
      }
      continue;
    }
    // The exact rshares value is unknowable pre-index; the UI only needs
    // presence and sign.
    const synthesized = weight > 0 ? '1' : '-1';
    if (idx >= 0) {
      const current = Number(votes[idx].rshares ?? 0);
      // Chain data wins once it shows the intended direction (indexed).
      if (Math.sign(current) === Math.sign(weight)) continue;
      // Replacing a zero-rshares (cleared) entry makes the vote count again.
      if (current === 0) totalVotesDelta += 1;
      votes[idx] = { ...votes[idx], rshares: synthesized };
      changed = true;
    } else {
      votes.push({ voter, rshares: synthesized });
      totalVotesDelta += 1;
      changed = true;
    }
  }
  if (!changed) return post;
  const out: T = { ...post, active_votes: votes };
  // Keep the displayed vote count consistent with the overlaid entries.
  if (totalVotesDelta !== 0 && typeof post.stats?.total_votes === 'number') {
    out.stats = {
      ...post.stats,
      total_votes: Math.max(0, post.stats.total_votes + totalVotesDelta),
    };
  }
  return out;
}

/** Apply pending votes to a list of posts (one Redis pipeline round-trip). */
export async function applyVoteOverlayToPosts<T extends PostLike>(posts: T[]): Promise<T[]> {
  const r = getRedis();
  if (!r || posts.length === 0) return posts;

  const eligible: Array<{ index: number; author: string; permlink: string }> = [];
  posts.forEach((p, index) => {
    if (p && p.author && p.permlink) {
      eligible.push({ index, author: p.author, permlink: p.permlink });
    }
  });
  if (eligible.length === 0) return posts;

  try {
    const pipe = r.pipeline();
    for (const { author, permlink } of eligible) {
      pipe.hgetall(voteKey(author, permlink));
    }
    const results = await pipe.exec();
    if (!results) return posts;

    const out = [...posts];
    results.forEach(([err, hash], i) => {
      if (err || !hash || Object.keys(hash).length === 0) return;
      const pending: Record<string, PendingVote> = {};
      for (const [voter, raw] of Object.entries(hash)) {
        const entry = parseJson<PendingVote>(raw);
        if (entry) pending[voter] = entry;
      }
      if (Object.keys(pending).length > 0) {
        out[eligible[i].index] = mergePendingVotes(out[eligible[i].index], pending);
      }
    });
    return out;
  } catch {
    return posts;
  }
}

/** Overlay the mutable fields of an edited post onto chain data. */
function overlayEdit(existing: PostLike, entry: PendingContent): PostLike {
  const post = entry.post as PostLike;
  return {
    ...existing,
    title: post.title ?? existing.title,
    body: post.body ?? existing.body,
    json_metadata: post.json_metadata ?? existing.json_metadata,
  };
}

function isPendingNewer(entry: PendingContent, existing: PostLike): boolean {
  return entry.ts > chainTime(existing.last_update || existing.created);
}

/**
 * Merge pending content (new posts, replies, edits, deletes) and pending
 * votes into a bridge discussion map. Returns null when there is neither
 * chain data nor a pending root post (preserving the 404 contract).
 */
export async function applyDiscussionOverlays(
  author: string,
  permlink: string,
  discussion: Record<string, PostLike> | null
): Promise<Record<string, PostLike> | null> {
  const r = getRedis();
  if (!r) return discussion;

  const merged: Record<string, PostLike> = { ...(discussion ?? {}) };
  const rootKey = `${author}/${permlink}`;

  try {
    // Pending root post (covers the "shared URL 404s right after posting").
    const rootRaw = await r.get(rootPostKey(author, permlink));
    if (rootRaw) {
      const entry = parseJson<PendingContent>(rootRaw);
      if (entry?.post) {
        const existing = merged[rootKey];
        if (!existing) {
          merged[rootKey] = entry.post as PostLike;
        } else if (isPendingNewer(entry, existing)) {
          merged[rootKey] = overlayEdit(existing, entry);
        }
      }
    }

    // Pending replies/edits keyed by immediate parent, merged breadth-first
    // so nested replies land even when their parent is itself still pending.
    let frontier = Object.keys(merged);
    const seen = new Set(frontier);
    for (let depth = 0; depth < MAX_OVERLAY_DEPTH && frontier.length > 0; depth++) {
      const pipe = r.pipeline();
      for (const key of frontier) {
        const sep = key.indexOf('/');
        pipe.hgetall(childrenKey(key.slice(0, sep), key.slice(sep + 1)));
      }
      const results = await pipe.exec();
      const next: string[] = [];
      results?.forEach(([err, hash]) => {
        if (err || !hash) return;
        for (const [childKey, raw] of Object.entries(hash)) {
          const entry = parseJson<PendingContent>(raw);
          if (!entry?.post) continue;
          const existing = merged[childKey];
          if (!existing) {
            merged[childKey] = entry.post as PostLike;
            if (!seen.has(childKey)) {
              seen.add(childKey);
              next.push(childKey);
            }
          } else if (isPendingNewer(entry, existing)) {
            merged[childKey] = overlayEdit(existing, entry);
          }
        }
      });
      frontier = next;
    }

    // Pending deletions (tombstones) for every node currently in the map.
    const nodeKeys = Object.keys(merged);
    if (nodeKeys.length > 0) {
      const pipe = r.pipeline();
      for (const key of nodeKeys) {
        const sep = key.indexOf('/');
        pipe.get(tombstoneKey(key.slice(0, sep), key.slice(sep + 1)));
      }
      const results = await pipe.exec();
      results?.forEach(([err, val], i) => {
        if (!err && val) delete merged[nodeKeys[i]];
      });
    }
  } catch {
    // Overlay read failure — fall back to chain data only.
  }

  // Pending votes on every node (root + comments).
  const keys = Object.keys(merged);
  if (keys.length > 0) {
    const withVotes = await applyVoteOverlayToPosts(keys.map((k) => merged[k]));
    keys.forEach((k, i) => {
      merged[k] = withVotes[i];
    });
  }

  if (Object.keys(merged).length === 0) return null;
  return merged;
}
