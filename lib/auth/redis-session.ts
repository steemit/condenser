/**
 * Redis-based session storage for distributed deployments
 * Configurable session management that can use Redis or fallback to JWT
 */

import { Redis } from 'ioredis';
import { SessionData } from './session';

let redisClient: Redis | null = null;

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
        // Use Redis URL (e.g., redis://localhost:6379)
        redisClient = new Redis(process.env.REDIS_URL);
      } else {
        // Use individual Redis configuration
        redisClient = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
          keyPrefix: process.env.REDIS_KEY_PREFIX || 'steem:session:',
          maxRetriesPerRequest: 3,
        });
      }

      // Test connection
      redisClient.on('error', (error) => {
        console.error('Redis connection error:', error);
        redisClient = null; // Fallback to JWT
      });

      redisClient.on('connect', () => {
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
 * Update session data in Redis
 */
export async function updateSession(sessionId: string, data: SessionData, ttlSeconds: number = 2592000): Promise<boolean> {
  return storeSession(sessionId, data, ttlSeconds);
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
 * Extend session TTL in Redis
 */
export async function extendSession(sessionId: string, ttlSeconds: number = 2592000): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) {
    return false;
  }

  try {
    await redis.expire(sessionId, ttlSeconds);
    return true;
  } catch (error) {
    console.error('Failed to extend session TTL:', error);
    return false;
  }
}

/**
 * Get all active sessions for a user (for logout from all devices)
 */
export async function getUserSessions(username: string): Promise<string[]> {
  const redis = getRedisClient();
  if (!redis) {
    return [];
  }

  try {
    const pattern = `*`; // All sessions
    const keys = await redis.keys(pattern);
    const userSessions: string[] = [];

    // Check each session to see if it belongs to the user
    for (const key of keys) {
      try {
        const sessionData = await redis.get(key);
        if (sessionData) {
          const data = JSON.parse(sessionData) as SessionData;
          if (data.username === username) {
            userSessions.push(key);
          }
        }
      } catch {
        // Skip invalid sessions
      }
    }

    return userSessions;
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    return [];
  }
}

/**
 * Cleanup expired sessions (optional maintenance task)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const redis = getRedisClient();
  if (!redis) {
    return 0;
  }

  try {
    // Redis automatically handles TTL expiration, but we can scan for any orphaned keys
    const pattern = `*`;
    const keys = await redis.keys(pattern);
    let cleaned = 0;

    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        // Key exists but has no TTL, set a default TTL
        await redis.expire(key, 2592000); // 30 days
        cleaned++;
      }
    }

    return cleaned;
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return 0;
  }
}

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
