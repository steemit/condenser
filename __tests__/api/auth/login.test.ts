import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  makePostRequest,
  sessionCookieHeader,
} from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getAccount: vi.fn(),
  callSteemApi: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/auth/session', () => ({
  COOKIE_NAME: 'steem-session',
  getSession: vi.fn(),
  loginUser: vi.fn(),
  revokeSession: vi.fn(),
  setSessionCookie: vi.fn(),
}));

const { verifySignatureMock } = vi.hoisted(() => ({ verifySignatureMock: vi.fn() }));

vi.mock('@steemit/steem-js', () => ({
  steem: {
    auth: {
      verifySignature: verifySignatureMock,
    },
  },
}));

// Partial mock: keep the real RATE_LIMITS / rateLimitResponse, stub only the
// Redis-backed check (audit N-08).
vi.mock('@/lib/cache/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cache/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: vi.fn(async () => ({ allowed: true })),
  };
});

import { POST } from '@/app/api/auth/login/route';
import { callSteemApi, getAccount } from '@/lib/steem/client';
import {
  getSession,
  loginUser,
  revokeSession,
  setSessionCookie,
} from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/cache/rate-limit';

const getAccountMock = vi.mocked(getAccount);
const callSteemApiMock = vi.mocked(callSteemApi);
const getSessionMock = vi.mocked(getSession);
const loginUserMock = vi.mocked(loginUser);
const revokeSessionMock = vi.mocked(revokeSession);
const setSessionCookieMock = vi.mocked(setSessionCookie);
const checkRateLimitMock = vi.mocked(checkRateLimit);

const POSTING_KEY = 'STM6 posting key';
const CHALLENGE = 'abc123';
const OLD_SID = 'b'.repeat(26); // Redis session id shape

function validBody() {
  return {
    username: 'alice',
    signature: 'deadbeef',
    publicKey: POSTING_KEY,
    data: JSON.stringify({
      username: 'alice',
      challenge: CHALLENGE,
      timestamp: Date.now(),
      action: 'login',
    }),
    challenge: CHALLENGE,
  };
}

function accountWithPostingKey(key = POSTING_KEY) {
  return { name: 'alice', posting: { key_auths: [[key, 1]] } };
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    verifySignatureMock.mockReturnValue(true);
    // The challenge route stores the issued challenge in the session cookie;
    // the login route verifies the signed challenge against it.
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE } as never);
    revokeSessionMock.mockResolvedValue();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('rejects bodies missing required fields', async () => {
    const res = await POST(makePostRequest('/api/auth/login', { username: 'alice' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Missing required fields');
  });

  it('returns 404 for an unknown account', async () => {
    getAccountMock.mockResolvedValue(null);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Account not found' });
  });

  it('returns 401 when the public key is not a posting authority', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey('STMother key'));

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('not authorized for posting');
  });

  it('returns 400 when data is not valid JSON', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());

    const res = await POST(
      makePostRequest('/api/auth/login', { ...validBody(), data: 'not-json' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid data format' });
  });

  it('returns 400 when the signed data does not match the request', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue({ loginChallenge: 'different' } as never);

    const res = await POST(
      makePostRequest('/api/auth/login', { ...validBody(), challenge: 'different' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid authentication data' });
  });

  it('returns 400 when the challenge does not match the session', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue({ loginChallenge: 'other-challenge' } as never);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid or expired login challenge' });
    expect(loginUserMock).not.toHaveBeenCalled();
    // A failed login keeps the old session alive (challenge retry), so
    // nothing is revoked.
    expect(revokeSessionMock).not.toHaveBeenCalled();
  });

  it('returns 400 when the session has no stored challenge', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue(null);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid or expired login challenge' });
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('returns 400 when the signed timestamp is stale', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());

    const staleBody = {
      ...validBody(),
      data: JSON.stringify({
        username: 'alice',
        challenge: CHALLENGE,
        timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes old
        action: 'login',
      }),
    };
    const res = await POST(makePostRequest('/api/auth/login', staleBody));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid or expired login challenge' });
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the signature does not verify', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    verifySignatureMock.mockReturnValue(false);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid signature' });
  });

  it('creates a session, revokes the old token, and sets the cookie on success', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE } as never);
    loginUserMock.mockResolvedValue('new-session-token');

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), sessionCookieHeader(OLD_SID))
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.username).toBe('alice');
    expect(loginUserMock).toHaveBeenCalledWith({ loginChallenge: CHALLENGE }, 'alice');
    expect(setSessionCookieMock).toHaveBeenCalledWith(res, 'new-session-token');
    // The pre-login session (which still holds the consumed loginChallenge)
    // is revoked after the new session is minted (audit N-12).
    expect(revokeSessionMock).toHaveBeenCalledWith(OLD_SID);
    expect(revokeSessionMock.mock.invocationCallOrder[0]).toBeGreaterThan(
      loginUserMock.mock.invocationCallOrder[0]
    );
    // Legacy login_account checkpoint: sign-in is reported to overseer.
    expect(callSteemApiMock).toHaveBeenCalledWith('overseer.collect', [
      'custom',
      {
        measurement: 'user_login',
        tags: { entry: 'condenser', version: 'next' },
        fields: { username: 'alice' },
      },
    ]);
  });
});

describe('POST /api/auth/login abuse wrappers (audit N-08)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    verifySignatureMock.mockReturnValue(true);
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE } as never);
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    loginUserMock.mockResolvedValue('new-session-token');
    revokeSessionMock.mockResolvedValue();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('returns 429 with Retry-After when the IP limit denies the request', async () => {
    checkRateLimitMock.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 30 });

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    expect(getAccountMock).not.toHaveBeenCalled();
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('checks the IP bucket (10/min) first and the account bucket second', async () => {
    await POST(makePostRequest('/api/auth/login', validBody()));

    expect(checkRateLimitMock).toHaveBeenCalledTimes(2);
    expect(checkRateLimitMock.mock.calls[0][1]).toEqual({
      key: 'auth:login:ip',
      limit: 10,
      windowSeconds: 60,
    });
    expect(checkRateLimitMock.mock.calls[1][1]).toEqual({
      key: 'auth:login:acct',
      limit: 10,
      windowSeconds: 60,
      identifier: 'alice',
    });
  });

  it('skips the account bucket for bodies missing required fields', async () => {
    const res = await POST(makePostRequest('/api/auth/login', { username: 'alice' }));
    expect(res.status).toBe(400);
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1); // IP check only
  });

  it('returns 429 when the per-account bucket denies the request', async () => {
    checkRateLimitMock
      .mockResolvedValueOnce({ allowed: true }) // IP
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 17 }); // account

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('17');
    expect(getAccountMock).not.toHaveBeenCalled();
  });

  it('returns 413 when the body exceeds the 64KB cap', async () => {
    const res = await POST(
      makePostRequest('/api/auth/login', {
        ...validBody(),
        username: 'a'.repeat(70 * 1024),
      })
    );
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large' });
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1); // IP check ran, account never reached
    expect(getAccountMock).not.toHaveBeenCalled();
  });

  it('returns 413 for an over-cap chunked body without Content-Length', async () => {
    // Chunked transfer encoding: no Content-Length header is derived from a
    // stream body, so the cap must be enforced by reading the stream.
    const body = 'x'.repeat(64 * 1024 + 1);
    const request = new NextRequest(new URL('/api/auth/login', 'http://localhost'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array([...body].map((c) => c.charCodeAt(0))));
          controller.close();
        },
      }),
      // Required by undici when the body is a stream.
      duplex: 'half',
    });

    const res = await POST(request);
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large' });
  });
});
