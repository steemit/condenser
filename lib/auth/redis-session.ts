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
