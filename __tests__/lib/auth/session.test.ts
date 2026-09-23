// @vitest-environment node
// Server-only module: jose's instanceof checks need the plain Node realm
// (jsdom's TextEncoder/Uint8Array come from a different realm).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const redisSessionMocks = vi.hoisted(() => ({
  isRedisAvailable: vi.fn(() => false),
  storeSession: vi.fn(),
  getSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock('@/lib/auth/redis-session', () => redisSessionMocks);

import {
  createSession,
  loginUser,
  logoutUser,
  revokeSession,
  updateSession,
  verifySession,
} from '@/lib/auth/session';

const STRONG_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef'; // 56 bytes
const PLACEHOLDER_SECRET = 'your-secret-key-change-in-production';
const REDIS_SID = 'a'.repeat(26); // generateUID() length

describe('lib/auth/session', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', STRONG_SECRET);
    redisSessionMocks.isRedisAvailable.mockReturnValue(false);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('JWT_SECRET validation (audit N-04: fail closed in any environment)', () => {
    it('rejects createSession when JWT_SECRET is unset, regardless of NODE_ENV', async () => {
      for (const nodeEnv of ['development', 'test', 'production']) {
        vi.stubEnv('NODE_ENV', nodeEnv);
        delete process.env.JWT_SECRET;
        await expect(createSession()).rejects.toThrow(/JWT_SECRET is not configured/);
      }
    });

    it('rejects createSession when JWT_SECRET is empty', async () => {
      vi.stubEnv('JWT_SECRET', '');
      await expect(createSession()).rejects.toThrow(/JWT_SECRET is not configured/);
    });

    it('rejects createSession when JWT_SECRET is the shipped placeholder', async () => {
      vi.stubEnv('JWT_SECRET', PLACEHOLDER_SECRET);
      await expect(createSession()).rejects.toThrow(
        /insecure placeholder value/
      );
    });

    it('rejects createSession when JWT_SECRET is shorter than 32 bytes', async () => {
      vi.stubEnv('JWT_SECRET', 'a'.repeat(31));
      await expect(createSession()).rejects.toThrow(
        /JWT_SECRET must be at least 32 bytes \(got 31\)/
      );
    });

    it('accepts a secret of exactly 32 bytes (boundary)', async () => {
      vi.stubEnv('JWT_SECRET', 'b'.repeat(32));
      const token = await createSession({ username: 'alice' });
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('rejects verifySession when JWT_SECRET is unset, even for a well-formed token', async () => {
      const token = await createSession({ username: 'alice' });
      delete process.env.JWT_SECRET;
      await expect(verifySession(token)).rejects.toThrow(/JWT_SECRET is not configured/);
    });

    it('rejects createSession even when Redis sessions are in use (forged-JWT fallthrough)', async () => {
      // verifySession falls through to JWT verification for non-sid tokens,
      // so a JWT forged with a known secret would be accepted even in Redis
      // mode — the assertion must hold there too.
      redisSessionMocks.isRedisAvailable.mockReturnValue(true);
      redisSessionMocks.storeSession.mockResolvedValue(true);
      delete process.env.JWT_SECRET;
      await expect(createSession()).rejects.toThrow(/JWT_SECRET is not configured/);
    });
  });

  describe('JWT fallback sessions (no Redis)', () => {
    it('round-trips session data through a signed JWT', async () => {
      const token = await createSession({ username: 'alice' });
      expect(token.startsWith('eyJ')).toBe(true); // JWT shape, not a Redis sid

      const session = await verifySession(token);
      expect(session?.username).toBe('alice');
      expect(session?.uid).toMatch(/^[a-f0-9]+$/);
    });

    it('returns null for a garbage token instead of throwing', async () => {
      expect(await verifySession('not-a-token')).toBeNull();
    });
  });

  describe('Redis-backed sessions', () => {
    it('returns a hex session id and reads the session back from Redis', async () => {
      redisSessionMocks.isRedisAvailable.mockReturnValue(true);
      redisSessionMocks.storeSession.mockResolvedValue(true);
      redisSessionMocks.getSession.mockResolvedValue({
        uid: 'u1',
        username: 'alice',
        lastVisit: 1,
        newVisit: false,
      });

      const sid = await createSession({ username: 'alice' });
      expect(sid).toMatch(/^[a-f0-9]{1,32}$/);
      expect(redisSessionMocks.storeSession).toHaveBeenCalledWith(
        sid,
        expect.objectContaining({ username: 'alice' }),
        2592000 // logged-in sessions keep the 30-day TTL (audit N-08)
      );

      expect(await verifySession(sid)).toMatchObject({ username: 'alice' });
    });
  });

  describe('session TTL classes (audit N-08)', () => {
    beforeEach(() => {
      redisSessionMocks.isRedisAvailable.mockReturnValue(true);
      redisSessionMocks.storeSession.mockResolvedValue(true);
      redisSessionMocks.updateSession.mockResolvedValue(true);
    });

    it('stores a challenge-only session with the short 600s TTL', async () => {
      const sid = await createSession({ loginChallenge: 'abc' });
      expect(sid).toMatch(/^[a-f0-9]{1,32}$/);
      expect(redisSessionMocks.storeSession).toHaveBeenCalledWith(
        sid,
        expect.objectContaining({ ttlClass: 'challenge', loginChallenge: 'abc' }),
        600
      );
    });

    it('stores an anonymous createSession() call with the short TTL (withSession path)', async () => {
      await createSession(); // GET /api/auth/session with no cookie
      expect(redisSessionMocks.storeSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ ttlClass: 'challenge' }),
        600
      );
    });

    it('stores a logged-in session with the 30-day TTL', async () => {
      await createSession({ username: 'alice' });
      expect(redisSessionMocks.storeSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ ttlClass: 'persistent', username: 'alice' }),
        2592000
      );
    });

    it('updateSession does NOT reset a challenge-only session back to 30 days', async () => {
      const sid = await updateSession(
        { uid: 'u1', loginChallenge: 'abc', ttlClass: 'challenge', lastVisit: 1, newVisit: true },
        { loginChallenge: 'refreshed' },
        REDIS_SID
      );
      expect(sid).toBe(REDIS_SID); // same sid, rewritten in place
      expect(redisSessionMocks.updateSession).toHaveBeenCalledWith(
        REDIS_SID,
        expect.objectContaining({ ttlClass: 'challenge', loginChallenge: 'refreshed' }),
        600
      );
    });

    it('updateSession keeps the 30-day TTL for logged-in sessions', async () => {
      await updateSession(
        { uid: 'u1', username: 'alice', ttlClass: 'persistent', lastVisit: 1, newVisit: false },
        { userPreferences: { locale: 'zh' } },
        REDIS_SID
      );
      expect(redisSessionMocks.updateSession).toHaveBeenCalledWith(
        REDIS_SID,
        expect.objectContaining({ username: 'alice', ttlClass: 'persistent' }),
        2592000
      );
    });

    it('derives the class from username for marker-less legacy sessions', async () => {
      // Sessions written before this change carry no ttlClass marker.
      await updateSession(
        { uid: 'u1', username: 'alice', lastVisit: 1, newVisit: false },
        {},
        REDIS_SID
      );
      expect(redisSessionMocks.updateSession).toHaveBeenCalledWith(
        REDIS_SID,
        expect.objectContaining({ ttlClass: 'persistent' }),
        2592000
      );

      await updateSession(
        { uid: 'u2', loginChallenge: 'abc', lastVisit: 1, newVisit: false },
        {},
        REDIS_SID
      );
      expect(redisSessionMocks.updateSession).toHaveBeenLastCalledWith(
        REDIS_SID,
        expect.objectContaining({ ttlClass: 'challenge' }),
        600
      );
    });

    it('loginUser never leaks the pre-login challenge class into the 30-day session', async () => {
      await loginUser(
        { uid: 'u1', loginChallenge: 'abc', ttlClass: 'challenge', lastVisit: 1, newVisit: true },
        'alice'
      );
      expect(redisSessionMocks.storeSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ username: 'alice', ttlClass: 'persistent' }),
        2592000
      );
    });

    it('logoutUser lands back in the short challenge class', async () => {
      await logoutUser({
        uid: 'u1',
        username: 'alice',
        ttlClass: 'persistent',
        lastVisit: 1,
        newVisit: false,
      });
      expect(redisSessionMocks.storeSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ ttlClass: 'challenge' }),
        600
      );
    });
  });

  describe('session TTL in JWT fallback mode (audit N-08)', () => {
    beforeEach(() => {
      redisSessionMocks.isRedisAvailable.mockReturnValue(false);
    });

    it('signs challenge-only JWTs with a ~10-minute expiration', async () => {
      const token = await createSession({ loginChallenge: 'abc' });
      const session = await verifySession(token);
      expect(session?.ttlClass).toBe('challenge');
      expect((session?.exp ?? 0) - (session?.iat ?? 0)).toBe(600);
    });

    it('signs logged-in JWTs with a ~30-day expiration', async () => {
      const token = await createSession({ username: 'alice' });
      const session = await verifySession(token);
      expect(session?.ttlClass).toBe('persistent');
      expect((session?.exp ?? 0) - (session?.iat ?? 0)).toBe(2592000);
    });
  });

  describe('revokeSession (audit N-05/N-12)', () => {
    it('deletes the backing Redis session for a Redis sid', async () => {
      redisSessionMocks.deleteSession.mockResolvedValue(true);

      await revokeSession(REDIS_SID);

      expect(redisSessionMocks.deleteSession).toHaveBeenCalledWith(REDIS_SID);
    });

    it('is a no-op for stateless JWT tokens (cannot be revoked)', async () => {
      const token = await createSession({ username: 'alice' });
      await revokeSession(token);
      expect(redisSessionMocks.deleteSession).not.toHaveBeenCalled();
    });

    it('is a no-op for missing/empty tokens', async () => {
      await expect(revokeSession(undefined)).resolves.toBeUndefined();
      await expect(revokeSession(null)).resolves.toBeUndefined();
      await expect(revokeSession('')).resolves.toBeUndefined();
      expect(redisSessionMocks.deleteSession).not.toHaveBeenCalled();
    });

    it('never throws when the Redis delete fails (logout/login stay usable)', async () => {
      redisSessionMocks.deleteSession.mockRejectedValue(
        new Error('redis down')
      );
      await expect(revokeSession(REDIS_SID)).resolves.toBeUndefined();
    });

    it('never throws when Redis is not configured (deleteSession no-op path)', async () => {
      redisSessionMocks.deleteSession.mockResolvedValue(false); // no client
      await expect(revokeSession(REDIS_SID)).resolves.toBeUndefined();
      expect(redisSessionMocks.deleteSession).toHaveBeenCalledWith(REDIS_SID);
    });

    it('a revoked sid no longer resolves to a session', async () => {
      // Logout flow with Redis sessions: after revokeSession the sid is
      // deleted server-side, so verifySession cannot resolve it anymore.
      redisSessionMocks.isRedisAvailable.mockReturnValue(true);
      redisSessionMocks.deleteSession.mockResolvedValue(true);
      redisSessionMocks.getSession.mockResolvedValue(null); // deleted

      await revokeSession(REDIS_SID);
      expect(await verifySession(REDIS_SID)).toBeNull();
    });
  });
});
