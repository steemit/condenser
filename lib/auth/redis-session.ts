/**
 * Redis-based session storage for distributed deployments
 * Configurable session management that can use Redis or fallback to JWT
 */

import { Redis } from 'ioredis';
import { SessionData } from './session';

let redisClient: Redis | null = null;

/**
 * Session key prefix (S8 split from the shared REDIS_KEY_PREFIX).
 *
 * REDIS_KEY_PREFIX is the pre-split shared name that set BOTH the session
 * and the content-cache prefix at once (see lib/cache/redis.ts); it still
 * works for existing deployments, but new setups should set
 * REDIS_SESSION_KEY_PREFIX here and REDIS_CACHE_KEY_PREFIX for the cache.
 */
const SESSION_KEY_PREFIX =
  process.env.REDIS_SESSION_KEY_PREFIX ||
  process.env.REDIS_KEY_PREFIX ||
  'steem:session:';

/**
 * Sub-prefix for the JWT revocation denylist (audit CS-01), inside the
 * session namespace. Session ids are hex-only, so the `:` and letters here
 * can never collide with a session key.
 */
const DENYLIST_KEY_PREFIX = 'revoked-jwt:';

/**
 * Initialize Redis client if configured
 */
function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    return null; // Redis not configured, use JWT fallback
  }

  if (!redisClient) {
    try {
      if (process.env.REDIS_URL) {
        // Use Redis URL (e.g. redis://localhost:6379). Unprefixed, matching
        // the pre-split behavior — a URL-based deployment's sessions live
        // under their raw session ids, and changing that now would orphan
        // every live session.
        redisClient = new Redis(process.env.REDIS_URL);
      } else {
        // Use individual Redis configuration
        redisClient = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
          keyPrefix: SESSION_KEY_PREFIX,
          maxRetriesPerRequest: 3,
        });
      }

      // Test connection
      const client = redisClient;
      client.on('error', (error) => {
        console.error('Redis connection error:', error);
        // Retire the errored client, not just the singleton slot (S9):
        // nulling redisClient alone leaks the connection — ioredis keeps
        // retrying forever while the next getRedisClient() call mints a
        // second client. Quit this one (graceful QUIT when the link is
        // usable, force-close when it is not) and only clear the singleton
        // if this client is still the current one (a stale client's error
        // must not null a newer instance that replaced it).
        if (redisClient === client) {
          redisClient = null; // Fallback to JWT
        }
        void client.quit().catch(() => client.disconnect());
      });

      client.on('connect', () => {
        console.log('Redis session store connected');
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      redisClient = null;
    }
  }

  return redisClient;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return getRedisClient() !== null;
}

/**
 * Store session data in Redis
 */
export async function storeSession(sessionId: string, data: SessionData, ttlSeconds: number = 2592000): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) {
    return false; // Redis not available, caller should use JWT fallback
  }

  try {
    const serializedData = JSON.stringify(data);
    await redis.setex(sessionId, ttlSeconds, serializedData);
    return true;
  } catch (error) {
    console.error('Failed to store session in Redis:', error);
    return false;
  }
}

/**
 * Retrieve session data from Redis
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  const redis = getRedisClient();
  if (!redis) {
    return null; // Redis not available, caller should use JWT fallback
  }

  try {
    const serializedData = await redis.get(sessionId);
    if (!serializedData) {
      return null;
    }

    return JSON.parse(serializedData) as SessionData;
  } catch (error) {
    console.error('Failed to retrieve session from Redis:', error);
    return null;
  }
}

/**
 * Update session data in Redis, strictly in place (audit CD-02).
 *
 * This rewrites the data under the SAME session id and only when that key
 * already exists (SET with the XX option): it can never mint a new key, so a
 * caller cannot silently fork one login session into two live ids. Returns
 * false when the key is gone (expired between the caller's read and this
 * write) so the caller falls back to createSession + explicit revocation of
 * the superseded id. Minting ids is storeSession/createSession's job;
 * retiring them is deleteSession's (revokeSession).
 */
export async function updateSession(sessionId: string, data: SessionData, ttlSeconds: number = 2592000): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) {
    return false; // Redis not available, caller should use JWT fallback
  }

  try {
    const serializedData = JSON.stringify(data);
    // 'EX' + 'XX': set the TTL but only replace an existing key — a missing
    // key resolves to null, not 'OK'.
    const result = await redis.set(
      sessionId,
      serializedData,
      'EX',
      ttlSeconds,
      'XX'
    );
    return result === 'OK';
  } catch (error) {
    console.error('Failed to update session in Redis:', error);
    return false;
  }
}

/**
 * Delete session from Redis
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) {
    return false;
  }

  try {
    await redis.del(sessionId);
    return true;
  } catch (error) {
    console.error('Failed to delete session from Redis:', error);
    return false;
  }
}

/**
 * Store a JWT fallback revocation marker (audit CS-01). The value is
 * irrelevant (always '1'); the key's TTL — the revoked token's remaining
 * lifetime — is the whole point. Returns false when Redis is unavailable so
 * the caller keeps its in-process denylist entry and retries later.
 */
export async function setDenylistEntry(key: string, ttlSeconds: number): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) {
    return false;
  }

  try {
    await redis.setex(`${DENYLIST_KEY_PREFIX}${key}`, ttlSeconds, '1');
    return true;
  } catch (error) {
    console.error('Failed to store JWT denylist entry in Redis:', error);
    return false;
  }
}

/**
 * Read a JWT fallback revocation marker (audit CS-01). Returns false on miss
 * and when Redis is unavailable — callers treat that as "not revoked
 * here", never as an error.
 */
export async function hasDenylistEntry(key: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) {
    return false;
  }

  try {
    return (await redis.get(`${DENYLIST_KEY_PREFIX}${key}`)) !== null;
  } catch (error) {
    console.error('Failed to read JWT denylist entry from Redis:', error);
    return false;
  }
}
