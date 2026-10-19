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

import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  createSession,
  loginUser,
  logoutUser,
  revokeSession,
  updateSession,
  verifySession,
  withSession,
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

  describe('single live Redis id per session lineage (audit CD-02)', () => {
    // Map-backed fake of the Redis session store: one key = one live id.
    // updateSession mirrors the SET ... XX contract (no key minting), so the
    // store's size directly proves how many live ids a lineage holds.
    let store: Map<string, unknown>;

    beforeEach(() => {
      redisSessionMocks.isRedisAvailable.mockReturnValue(true);
      store = new Map();
      redisSessionMocks.getSession.mockImplementation(async (sid: string) =>
        store.get(sid) ?? null
      );
      redisSessionMocks.updateSession.mockImplementation(
        async (sid: string, data: unknown) => {
          if (!store.has(sid)) return false; // SET ... XX: key must exist
          store.set(sid, data);
          return true;
        }
      );
      redisSessionMocks.storeSession.mockImplementation(
        async (sid: string, data: unknown) => {
          store.set(sid, data);
          return true;
        }
      );
      redisSessionMocks.deleteSession.mockImplementation(async (sid: string) => {
        store.delete(sid);
        return true;
      });
    });

    /** GET-style request carrying a session cookie, like a browser hit. */
    function requestWithCookie(sid: string): NextRequest {
      return new NextRequest(new URL('http://localhost/api/auth/session'), {
        headers: { cookie: `${COOKIE_NAME}=${sid}` },
      });
    }

    /** A logged-in session as it sits in Redis. */
    function persistentSession() {
      return {
        uid: 'u1',
        username: 'alice',
        ttlClass: 'persistent' as const,
        csrfToken: 'c'.repeat(64),
        lastVisit: Math.floor(Date.now() / 1000) - 60,
        newVisit: false,
      };
    }

    it('withSession rewrites the SAME id: no second live key, old key still resolves', async () => {
      const sid = 'b'.repeat(26);
      store.set(sid, persistentSession());

      const response = await withSession(requestWithCookie(sid), async (session) =>
        NextResponse.json({ authenticated: !!session?.username })
      );

      // The same id goes back to the browser — no fresh id was minted on read.
      expect(response.cookies.get(COOKIE_NAME)?.value).toBe(sid);
      expect(redisSessionMocks.storeSession).not.toHaveBeenCalled();
      expect(store.size).toBe(1);
      // The id still resolves: this was an in-place rewrite, not a silent
      // rotate-and-orphan.
      expect(await verifySession(sid)).toMatchObject({ username: 'alice' });
    });

    it('read refresh keeps the 30-day TTL for logged-in sessions', async () => {
      const sid = 'b'.repeat(26);
      store.set(sid, persistentSession());

      await withSession(requestWithCookie(sid), async () => NextResponse.json({}));

      expect(redisSessionMocks.updateSession).toHaveBeenCalledWith(
        sid,
        expect.objectContaining({ username: 'alice', ttlClass: 'persistent' }),
        2592000
      );
    });

    it('read refresh then logout kills the whole lineage — no surviving older id', async () => {
      // Audit CD-02 sequence: "read session (rotation happens) → logout with
      // the new id → the old id no longer authenticates". Refresh used to
      // mint a new id per read while the old key lived on, so logout (which
      // revokes only the current cookie) left the older id valid for up to
      // 30 days.
      const sid = 'b'.repeat(26);
      store.set(sid, persistentSession());

      // 1. Session read — the id the response cookie now carries.
      const response = await withSession(requestWithCookie(sid), async () =>
        NextResponse.json({})
      );
      const refreshedId = response.cookies.get(COOKIE_NAME)?.value;
      expect(refreshedId).toBeDefined();

      // 2. Logout with the current cookie id (what POST /api/auth/logout
      //    hands to revokeSession).
      await revokeSession(refreshedId as string);

      // 3. Both the refreshed id AND the pre-read id are dead: with same-id
      //    refresh they are one and the same key, and no sibling key was
      //    ever created. Under the old rotate-without-revoke behavior,
      //    verifySession(sid) below still resolved and this test failed.
      expect(await verifySession(refreshedId as string)).toBeNull();
      expect(await verifySession(sid)).toBeNull();
      expect(store.size).toBe(0);
    });

    it('a full login → read → logout lineage holds at most one live id', async () => {
      // Seed the anonymous pre-login (challenge) session.
      const anonSid = 'e'.repeat(26);
      store.set(anonSid, {
        uid: 'u1',
        loginChallenge: 'abc',
        ttlClass: 'challenge',
        csrfToken: 'c'.repeat(64),
        lastVisit: 1,
        newVisit: true,
      });

      // Login: mint the persistent id, revoke the pre-login one (audit N-12).
      const loginSid = await loginUser(await verifySession(anonSid), 'alice');
      await revokeSession(anonSid);
      expect(await verifySession(anonSid)).toBeNull();
      expect(store.size).toBe(1);

      // Reads refresh in place: still exactly one live id (audit CD-02).
      await withSession(requestWithCookie(loginSid), async () =>
        NextResponse.json({})
      );
      expect(store.size).toBe(1);

      // Logout: the lineage dies with the current cookie id, replaced by a
      // single fresh anonymous session (audit N-05).
      const loggedIn = await verifySession(loginSid);
      expect(loggedIn?.username).toBe('alice');
      const logoutSid = await logoutUser(loggedIn as never);
      await revokeSession(loginSid);
      expect(await verifySession(loginSid)).toBeNull();
      expect(store.has(logoutSid)).toBe(true);
      expect(store.size).toBe(1);
    });

    it('updateSession revokes the old id when the in-place rewrite fails (no orphans)', async () => {
      // e.g. the key expired between the read and the write (XX miss), or
      // Redis hiccuped: the fallback replacement must not leave the old id
      // live next to the new one.
      redisSessionMocks.updateSession.mockResolvedValue(false);
      const sid = 'd'.repeat(26);
      store.set(sid, persistentSession());

      const replacement = await updateSession(
        persistentSession(),
        {},
        sid
      );

      expect(replacement).toMatch(/^[a-f0-9]+$/);
      expect(replacement).not.toBe(sid);
      // The superseded id was revoked — it cannot outlive its replacement.
      expect(redisSessionMocks.deleteSession).toHaveBeenCalledWith(sid);
      expect(await verifySession(sid)).toBeNull();
    });
  });
});
