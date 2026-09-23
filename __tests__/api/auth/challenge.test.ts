import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  COOKIE_NAME: 'steem-session',
  createSession: vi.fn(),
  getSession: vi.fn(),
  setSessionCookie: vi.fn(),
  updateSession: vi.fn(),
  verifySession: vi.fn(),
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

import { GET } from '@/app/api/auth/challenge/route';
import { makeGetRequest } from '@/__tests__/helpers/request';
import {
  createSession,
  getSession,
  setSessionCookie,
  updateSession,
  verifySession,
} from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/cache/rate-limit';

const createSessionMock = vi.mocked(createSession);
const getSessionMock = vi.mocked(getSession);
const updateSessionMock = vi.mocked(updateSession);
const setSessionCookieMock = vi.mocked(setSessionCookie);
const verifySessionMock = vi.mocked(verifySession);
const checkRateLimitMock = vi.mocked(checkRateLimit);

describe('GET /api/auth/challenge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getSessionMock.mockResolvedValue(null);
    createSessionMock.mockResolvedValue('session-token');
    // Mint path decodes the fresh session to mirror its CSRF token (N-22).
    verifySessionMock.mockResolvedValue({
      uid: 'uid-1',
      csrfToken:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    } as never);
    updateSessionMock.mockResolvedValue('updated-session-token');
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('returns a 64-hex challenge, stores it in the session, and sets the cookie', async () => {
    const res = await GET(makeGetRequest('/api/auth/challenge'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.challenge).toMatch(/^[0-9a-f]{64}$/);
    expect(createSessionMock).toHaveBeenCalledWith({
      loginChallenge: body.challenge,
    });
    // The cookie persists the challenge for the login route to verify.
    expect(setSessionCookieMock).toHaveBeenCalledWith(res, 'session-token');
    // The CSRF token is mirrored into the non-HttpOnly cookie (audit N-22).
    expect(res.cookies.get('steem-csrf')?.value).toBe(
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );
    expect(res.cookies.get('steem-csrf')?.httpOnly).toBe(false);
  });

  it('updates the existing session instead of minting a new one', async () => {
    getSessionMock.mockResolvedValue({ uid: 'u1', loginChallenge: 'old' } as never);

    const res = await GET(makeGetRequest('/api/auth/challenge'));
    const body = await res.json();

    expect(updateSessionMock).toHaveBeenCalledWith(
      { uid: 'u1', loginChallenge: 'old' },
      { loginChallenge: body.challenge },
      undefined
    );
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(setSessionCookieMock).toHaveBeenCalledWith(res, 'updated-session-token');
  });

  it('returns 500 when session creation fails', async () => {
    createSessionMock.mockRejectedValue(new Error('redis down'));

    const res = await GET(makeGetRequest('/api/auth/challenge'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to generate challenge' });
  });

  it('checks the auth:challenge limit (30/min/IP) before doing any work', async () => {
    await GET(makeGetRequest('/api/auth/challenge'));
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1);
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      expect.anything(),
      { key: 'auth:challenge', limit: 30, windowSeconds: 60 }
    );
  });

  it('returns 429 with Retry-After and no session write when the limit is hit', async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfterSeconds: 42 });

    const res = await GET(makeGetRequest('/api/auth/challenge'));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('42');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(updateSessionMock).not.toHaveBeenCalled();
    expect(setSessionCookieMock).not.toHaveBeenCalled();
  });
});
