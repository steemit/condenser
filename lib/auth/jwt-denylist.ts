/**
 * Revocation denylist for stateless fallback JWT sessions (audit CS-01).
 *
 * When Redis is unavailable, lib/auth/session.ts issues self-contained JWTs
 * that verifySession would otherwise accept until their `exp` — logout had no
 * server-side effect on them. This module closes that gap:
 *
 * - every fallback JWT carries a unique `jti` claim at signing time
 *   (tokens minted before the claim existed fall back to a SHA-256 digest of
 *   the full token as their revocation key);
 * - revokeJwt() records that key with a TTL equal to the token's remaining
 *   lifetime — ALWAYS in-process (this instance) and mirrored to Redis when
 *   reachable so other instances honor it;
 * - isJwtRevoked() is consulted by verifySession after signature
 *   verification and rejects denylisted keys.
 *
 * Residual limitation (documented in docs/AUTHENTICATION.md): during a full
 * Redis outage in a multi-instance deployment, only the instance that served
 * the logout rejects the revoked token until Redis recovers — an un-mirrored
 * in-process entry retries its mirror the next time its key is consulted.
 * That is strictly better than the pre-CS-01 behavior where logout did
 * nothing at all for fallback tokens.
 *
 * Like every Redis consumer in this repo, the mirror is best-effort: without
 * Redis the module degrades to the in-process map alone and never throws.
 */

import { createHash } from 'node:crypto';
import * as RedisSession from './redis-session';

/**
 * Upper bound for the in-process map. Entries die at the revoked token's
 * `exp` (<= the fallback persistent TTL), so the map is self-limiting in
 * normal operation; the cap is a safety valve against unbounded growth from
 * pathological logout churn.
 */
export const JWT_DENYLIST_MAX_ENTRIES = 10_000;

interface DenyEntry {
  /** Epoch ms when the entry stops applying (the revoked token's exp). */
  expiresAtMs: number;
  /** False until the Redis mirror write has succeeded. */
  mirrored: boolean;
}

/** Module-level per-instance denylist. Map preserves insertion order. */
const localEntries = new Map<string, DenyEntry>();

/**
 * Revocation key for a fallback JWT: the token's `jti` when present, else a
 * SHA-256 digest of the full token (tokens minted before the `jti` rollout).
 * revokeJwt/isJwtRevoked callers MUST derive the key the same way.
 */
export function denylistKeyFor(jti: string | undefined, token: string): string {
  return jti ?? createHash('sha256').update(token).digest('hex');
}

/**
 * Drop entries whose token has expired (lazy expiry — sweeps piggyback on
 * writes, no background timers).
 */
function sweepExpired(nowMs: number): void {
  for (const [key, entry] of localEntries) {
    if (entry.expiresAtMs <= nowMs) {
      localEntries.delete(key);
    }
  }
}

/**
 * Best-effort Redis mirror of a denylist entry. Succeeding flips
 * entry.mirrored so the write is not repeated; failures leave it false so a
 * later consultation (see isJwtRevoked) can retry once Redis recovers.
 */
async function mirrorToRedis(key: string, entry: DenyEntry): Promise<void> {
  if (entry.mirrored) {
    return;
  }
  const remainingSec = Math.ceil((entry.expiresAtMs - Date.now()) / 1000);
  if (remainingSec <= 0) {
    return;
  }
  try {
    entry.mirrored = await RedisSession.setDenylistEntry(key, remainingSec);
  } catch (error) {
    // Redis down/unconfigured: keep the in-process entry, retry later.
    console.error('Failed to mirror JWT denylist entry to Redis:', error);
  }
}

/**
 * Record a fallback JWT revocation until its original expiry.
 *
 * @param key revocation key (jti or token digest — see denylistKeyFor)
 * @param expiresAtSec the revoked token's `exp` (epoch seconds)
 */
export async function revokeJwt(key: string, expiresAtSec: number): Promise<void> {
  const nowMs = Date.now();
  const expiresAtMs = expiresAtSec * 1000;
  if (expiresAtMs <= nowMs) {
    // Token already expired — signature verification rejects it on its own.
    return;
  }

  // Expired entries die lazily on read; the sweep only runs once the map is
  // at capacity, so an ordinary write stays O(1).
  if (localEntries.size >= JWT_DENYLIST_MAX_ENTRIES) {
    sweepExpired(nowMs);
  }
  while (localEntries.size >= JWT_DENYLIST_MAX_ENTRIES) {
    // Safety valve: evict the oldest-inserted entry. sweepExpired ran first,
    // so this only trips on pathological churn, and touch-on-read in
    // isJwtRevoked keeps actively-checked keys recent.
    const oldest = localEntries.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    localEntries.delete(oldest);
  }

  const entry: DenyEntry = { expiresAtMs, mirrored: false };
  localEntries.set(key, entry);
  await mirrorToRedis(key, entry);
}

/**
 * Whether a fallback JWT's revocation key has been denylisted. In-process
 * first (always), then the Redis mirror when reachable (cross-instance
 * revocations). Never throws — a denylist outage must not take down session
 * verification, it only widens the window to the token's own `exp`.
 */
export async function isJwtRevoked(key: string): Promise<boolean> {
  const nowMs = Date.now();
  const entry = localEntries.get(key);
  if (entry) {
    if (entry.expiresAtMs <= nowMs) {
      // Lazy expiry: the revoked token itself has expired by now.
      localEntries.delete(key);
      return false;
    }
    // Refresh recency (LRU-ish eviction) and retry an un-mirrored write —
    // this is the post-outage recovery path for the Redis mirror.
    localEntries.delete(key);
    localEntries.set(key, entry);
    await mirrorToRedis(key, entry);
    return true;
  }
  try {
    return await RedisSession.hasDenylistEntry(key);
  } catch (error) {
    console.error('Failed to read JWT denylist entry from Redis:', error);
    return false;
  }
}
