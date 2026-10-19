import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  csrfHeader,
  makePostRequest,
  makeRawPostRequest,
  sessionCookieHeader,
  TEST_CSRF_TOKEN,
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
import { checkRateLimit, getClientIp, type RateLimitOptions } from '@/lib/cache/rate-limit';

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

function accountWithPostingAuthority(
  keyAuths: Array<[string, number]>,
  weightThreshold = 1
) {
  return {
    name: 'alice',
    posting: { weight_threshold: weightThreshold, key_auths: keyAuths },
  };
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    verifySignatureMock.mockReturnValue(true);
    // The challenge route stores the issued challenge in the session cookie;
    // the login route verifies the signed challenge against it.
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE, csrfToken: TEST_CSRF_TOKEN } as never);
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

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Account not found' });
  });

  it('returns 401 when the public key is not a posting authority', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey('STMother key'));

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('not authorized for posting');
  });

  // Audit S4: multi-posting-key accounts. Legacy AuthSaga pubkeyThreshold
  // matched the login key against every key_auths entry — never only [0].
  it('accepts the second posting key of a multi-key account', async () => {
    getAccountMock.mockResolvedValue(
      accountWithPostingAuthority([
        ['STMfirst key', 1],
        [POSTING_KEY, 1],
      ])
    );
    loginUserMock.mockResolvedValue('new-session-token');
    revokeSessionMock.mockResolvedValue();

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(200);
    expect((await res.json()).user.public_key).toBe(POSTING_KEY);
  });

  it('still accepts the first posting key of a multi-key account', async () => {
    getAccountMock.mockResolvedValue(
      accountWithPostingAuthority([
        [POSTING_KEY, 1],
        ['STMsecond key', 1],
      ])
    );
    loginUserMock.mockResolvedValue('new-session-token');
    revokeSessionMock.mockResolvedValue();

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(200);
  });

  it('rejects a listed key whose weight alone cannot meet the threshold', async () => {
    // weight=0 is not forbidden by the chain, but legacy authStr semantics
    // classify this key as 'none' — it must not authenticate anyone.
    getAccountMock.mockResolvedValue(
      accountWithPostingAuthority([
        ['STMkey1', 1],
        [POSTING_KEY, 0],
      ])
    );

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(401);
    expect((await res.json()).error).toContain('not authorized for posting');
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('rejects a multi-sig posting key that only reaches the threshold together with others', async () => {
    // threshold=2 with two weight-1 keys: a single key is 'partial', not 'full'.
    getAccountMock.mockResolvedValue(
      accountWithPostingAuthority(
        [
          [POSTING_KEY, 1],
          ['STMkey2', 1],
        ],
        2
      )
    );

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(401);
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('returns 400 when data is not valid JSON', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());

    const res = await POST(
      makePostRequest('/api/auth/login', { ...validBody(), data: 'not-json' }, csrfHeader())
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid data format' });
  });

  it('returns 400 when the signed data does not match the request', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue({ loginChallenge: 'different', csrfToken: TEST_CSRF_TOKEN } as never);

    const res = await POST(
      makePostRequest('/api/auth/login', { ...validBody(), challenge: 'different' }, csrfHeader())
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid authentication data' });
  });

  it('returns 400 when the challenge does not match the session', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue({ loginChallenge: 'other-challenge', csrfToken: TEST_CSRF_TOKEN } as never);

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid or expired login challenge' });
    expect(loginUserMock).not.toHaveBeenCalled();
    // A failed login keeps the old session alive (challenge retry), so
    // nothing is revoked.
    expect(revokeSessionMock).not.toHaveBeenCalled();
  });

  it('returns 403 when there is no session at all (CSRF fails closed, audit N-22)', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue(null);

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    // No session -> no stored token to match -> the CSRF gate rejects
    // before the challenge check (a client without the challenge session
    // could never satisfy the login challenge either).
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Invalid or missing CSRF token' });
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
    const res = await POST(makePostRequest('/api/auth/login', staleBody, csrfHeader()));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid or expired login challenge' });
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the signature does not verify', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    verifySignatureMock.mockReturnValue(false);

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid signature' });
  });

  it('rejects a valid body without the X-CSRF-Token header with 403 (audit N-22)', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Invalid or missing CSRF token' });
    expect(loginUserMock).not.toHaveBeenCalled();
    // The gate sits before the account bucket, so only the IP check ran.
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1);
  });

  it('rejects a mismatched X-CSRF-Token header with 403 (audit N-22)', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader('f'.repeat(64)))
    );
    expect(res.status).toBe(403);
    expect(getAccountMock).not.toHaveBeenCalled();
  });

  it('rejects a correct token with a non-JSON Content-Type with 415 (audit N-22)', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), {
        ...csrfHeader(),
        'content-type': 'text/plain',
      })
    );
    expect(res.status).toBe(415);
    expect(getAccountMock).not.toHaveBeenCalled();
  });

  it('creates a session, revokes the old token, and sets the cookie on success', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE, csrfToken: TEST_CSRF_TOKEN } as never);
    loginUserMock.mockResolvedValue('new-session-token');

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), {
        ...sessionCookieHeader(OLD_SID),
        ...csrfHeader(),
      })
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.username).toBe('alice');
    expect(loginUserMock).toHaveBeenCalledWith(
      { loginChallenge: CHALLENGE, csrfToken: TEST_CSRF_TOKEN },
      'alice'
    );
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
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE, csrfToken: TEST_CSRF_TOKEN } as never);
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

  it('checks the IP bucket (10/min) first and the account bucket only after signature verification', async () => {
    await POST(makePostRequest('/api/auth/login', validBody(), csrfHeader()));

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
    // The account check runs after the signature verified (CD-04): the
    // request was fully attributed to the account holder by then.
    expect(checkRateLimitMock.mock.invocationCallOrder[1]).toBeGreaterThan(
      verifySignatureMock.mock.invocationCallOrder[0]
    );
  });

  it('skips the account bucket for bodies missing required fields', async () => {
    const res = await POST(makePostRequest('/api/auth/login', { username: 'alice' }));
    expect(res.status).toBe(400);
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1); // IP check only
  });

  it('returns 429 when the per-account bucket denies a VERIFIED login (audit CD-04)', async () => {
    checkRateLimitMock
      .mockResolvedValueOnce({ allowed: true }) // IP
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 17 }); // account (post-verification)

    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), csrfHeader())
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('17');
    // The account gate now sits after signature verification: the RPC
    // lookup and the signature check ran (attribution established), but no
    // session is minted for the denied request.
    expect(getAccountMock).toHaveBeenCalledTimes(1);
    expect(verifySignatureMock).toHaveBeenCalledTimes(1);
    expect(loginUserMock).not.toHaveBeenCalled();
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

  it('returns 400 invalid JSON for an unparseable body (not a 500)', async () => {
    const res = await POST(makeRawPostRequest('/api/auth/login', 'not-json'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid JSON' });
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1); // IP check ran, account never reached
    expect(getAccountMock).not.toHaveBeenCalled();
  });
});

/**
 * Minimal in-memory fixed-window limiter standing in for the Redis Lua
 * script (audit CD-04 tests): counts per bucket key + identity exactly like
 * the real checkRateLimit would, honoring limit/windowSeconds, so tests can
 * assert WHICH quota a request consumed — the property the fix protects is
 * "unverified traffic never consumes the named account's quota".
 */
function makeCountingLimiter() {
  const counts = new Map<string, number>();
  const check = vi.fn(async (request: Request, opts: RateLimitOptions) => {
    const identity = opts.identifier
      ? opts.identifier.toLowerCase()
      : getClientIp(request);
    const bucketKey = `${opts.key}:${identity}`;
    const count = (counts.get(bucketKey) ?? 0) + 1;
    counts.set(bucketKey, count);
    if (count <= opts.limit) {
      return { allowed: true as const, remaining: opts.limit - count };
    }
    return { allowed: false as const, retryAfterSeconds: opts.windowSeconds };
  });
  return { counts, check };
}

describe('POST /api/auth/login account-bucket attribution (audit CD-04)', () => {
  const ACCOUNT_BUCKET = 'auth:login:acct:alice';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    verifySignatureMock.mockReturnValue(true);
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE, csrfToken: TEST_CSRF_TOKEN } as never);
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    loginUserMock.mockResolvedValue('new-session-token');
    revokeSessionMock.mockResolvedValue();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('an invalid-signature flood naming the victim does not block the victim (targeted lockout)', async () => {
    const limiter = makeCountingLimiter();
    checkRateLimitMock.mockImplementation(limiter.check);
    verifySignatureMock.mockReturnValue(false);

    // Attack: 15 well-formed, CSRF-valid attempts naming 'alice', each with
    // an invalid signature, spread over 3 IPs (5 per IP — under the
    // 10/min/IP ceiling, so every request passes the IP gate and reaches
    // signature verification; under the pre-CD-04 code this exhausted the
    // victim's 10/min account bucket and locked her out).
    for (let i = 0; i < 15; i++) {
      const res = await POST(
        makePostRequest('/api/auth/login', validBody(), {
          ...csrfHeader(),
          'x-forwarded-for': `203.0.113.${(i % 3) + 1}`,
        })
      );
      expect(res.status).toBe(401);
    }
    // Each attack request was verified up to the signature step — it is
    // exactly the traffic that used to burn the victim's quota.
    expect(verifySignatureMock).toHaveBeenCalledTimes(15);
    // The victim's account bucket was never consumed...
    expect(limiter.counts.get(ACCOUNT_BUCKET)).toBeUndefined();

    // ...so her real login (valid signature, her own IP) succeeds.
    verifySignatureMock.mockReturnValue(true);
    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), {
        ...csrfHeader(),
        'x-forwarded-for': '198.51.100.9',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    // Her login is the one and only hit on the account bucket.
    expect(limiter.counts.get(ACCOUNT_BUCKET)).toBe(1);
  });

  it('still rate-limits VERIFIED logins per account across rotating IPs', async () => {
    const limiter = makeCountingLimiter();
    checkRateLimitMock.mockImplementation(limiter.check);

    // 10 verified logins for 'alice', one per rotating IP: all succeed (no
    // single IP bucket trips) and fill the account bucket.
    for (let i = 0; i < 10; i++) {
      const res = await POST(
        makePostRequest('/api/auth/login', validBody(), {
          ...csrfHeader(),
          'x-forwarded-for': `203.0.113.${i + 1}`,
        })
      );
      expect(res.status).toBe(200);
    }
    expect(loginUserMock).toHaveBeenCalledTimes(10);
    expect(limiter.counts.get(ACCOUNT_BUCKET)).toBe(10);

    // The 11th verified login for the same account is denied with 429 even
    // from a fresh IP, and mints no session.
    const res = await POST(
      makePostRequest('/api/auth/login', validBody(), {
        ...csrfHeader(),
        'x-forwarded-for': '198.51.100.9',
      })
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');
    expect(loginUserMock).toHaveBeenCalledTimes(10);
  });

  it('challenge-invalid, CSRF-invalid, unknown-account and malformed requests never touch the account quota', async () => {
    const limiter = makeCountingLimiter();
    checkRateLimitMock.mockImplementation(limiter.check);

    // Malformed body (missing fields): 400 before anything else.
    let res = await POST(makePostRequest('/api/auth/login', { username: 'alice' }));
    expect(res.status).toBe(400);

    // Valid body without the X-CSRF-Token header: 403 at the CSRF gate.
    res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(403);

    // Challenge that does not match the session: 400 after the RPC lookup.
    getSessionMock.mockResolvedValue({ loginChallenge: 'other-challenge', csrfToken: TEST_CSRF_TOKEN } as never);
    res = await POST(makePostRequest('/api/auth/login', validBody(), csrfHeader()));
    expect(res.status).toBe(400);

    // Unknown account: 404 at the RPC lookup.
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE, csrfToken: TEST_CSRF_TOKEN } as never);
    getAccountMock.mockResolvedValue(null);
    res = await POST(makePostRequest('/api/auth/login', validBody(), csrfHeader()));
    expect(res.status).toBe(404);

    // Not-a-posting-key public key: 401 at the authority check.
    getAccountMock.mockResolvedValue(accountWithPostingKey('STMother key'));
    res = await POST(makePostRequest('/api/auth/login', validBody(), csrfHeader()));
    expect(res.status).toBe(401);

    // Invalid signature: 401 at the signature check.
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    verifySignatureMock.mockReturnValue(false);
    res = await POST(makePostRequest('/api/auth/login', validBody(), csrfHeader()));
    expect(res.status).toBe(401);

    // None of the unverified failure paths consumed the account bucket.
    expect(limiter.counts.get(ACCOUNT_BUCKET)).toBeUndefined();
    expect(limiter.check).toHaveBeenCalled();
  });
});
