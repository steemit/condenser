import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import {
  csrfHeader,
  makePostRequest,
  TEST_CSRF_TOKEN,
} from '@/__tests__/helpers/request';

vi.mock('@/lib/auth/session', () => ({
  COOKIE_NAME: 'session',
  getSession: vi.fn(),
  setSessionCookie: vi.fn(),
  updateSession: vi.fn(),
}));

// Partial mock: keep the real RATE_LIMITS / rateLimitResponse, stub only the
// Redis-backed check (audit N-08) — same pattern as the following route test.
vi.mock('@/lib/cache/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cache/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: vi.fn(async () => ({ allowed: true })),
  };
});

import { POST } from '@/app/api/auth/preferences/route';
import { getSession, setSessionCookie, updateSession } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/cache/rate-limit';

const getSessionMock = getSession as unknown as Mock;
const updateSessionMock = updateSession as unknown as Mock;
const setSessionCookieMock = setSessionCookie as unknown as Mock;
const checkRateLimitMock = checkRateLimit as unknown as Mock;

const loggedInSession = {
  username: 'alice',
  uid: 'uid-1',
  csrfToken: TEST_CSRF_TOKEN,
  lastVisit: 1700000000,
  newVisit: false,
  userPreferences: { nsfwPref: 'warn' },
};

describe('POST /api/auth/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateSessionMock.mockResolvedValue('updated-token');
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('checks the auth:preferences limit (60/min/IP) before touching the session', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    await POST(
      makePostRequest('/api/auth/preferences', { payload: { nsfwPref: 'hide' } }, csrfHeader())
    );
    expect(checkRateLimitMock).toHaveBeenCalledWith(expect.anything(), {
      key: 'auth:preferences',
      limit: 60,
      windowSeconds: 60,
    });
  });

  it('returns 429 with Retry-After and never reaches the session when limited', async () => {
    checkRateLimitMock.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 33,
    });

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: { nsfwPref: 'hide' } }, csrfHeader())
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('33');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    // Limited before the session lookup: no session read, no rewrite.
    expect(getSessionMock).not.toHaveBeenCalled();
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('rejects anonymous sessions with 401', async () => {
    getSessionMock.mockResolvedValue({ uid: 'uid-2', userPreferences: {} });

    const res = await POST(makePostRequest('/api/auth/preferences', { payload: { nsfwPref: 'hide' } }, csrfHeader()));
    expect(res.status).toBe(401);
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('rejects non-object payloads with 400', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    for (const payload of [null, 'str', 42, [1, 2]]) {
      const res = await POST(makePostRequest('/api/auth/preferences', { payload }, csrfHeader()));
      expect(res.status).toBe(400);
    }
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('rejects payloads over the 1024-char cap', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: { blob: 'x'.repeat(2000) } }, csrfHeader())
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'the data is too long' });
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('rejects when the merged result exceeds the cap', async () => {
    getSessionMock.mockResolvedValue({
      ...loggedInSession,
      userPreferences: { blob: 'x'.repeat(900) },
    });

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: { extra: 'y'.repeat(900) } }, csrfHeader())
    );
    expect(res.status).toBe(400);
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('treats __proto__ keys as inert own properties (no pollution)', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: JSON.parse('{"__proto__":{"x":1}}') }, csrfHeader())
    );
    expect(res.status).toBe(200);
    const merged = updateSessionMock.mock.calls[0][1].userPreferences;
    expect(({} as Record<string, unknown>).x).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(merged, '__proto__')).toBe(true);
  });

  it('merges the payload into session userPreferences and re-issues the cookie', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: { nsfwPref: 'hide', theme: 'dark' } }, csrfHeader())
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
    expect(updateSessionMock).toHaveBeenCalledWith(
      loggedInSession,
      { userPreferences: { nsfwPref: 'hide', theme: 'dark' } },
      undefined
    );
    expect(setSessionCookieMock).toHaveBeenCalledWith(res, 'updated-token');
  });

  it('rejects a missing X-CSRF-Token header with 403 (audit N-22)', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: { nsfwPref: 'hide' } })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Invalid or missing CSRF token' });
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('rejects a mismatched token with 403 and a non-JSON Content-Type with 415 (audit N-22)', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    const mismatched = await POST(
      makePostRequest('/api/auth/preferences', { payload: {} }, csrfHeader('b'.repeat(64)))
    );
    expect(mismatched.status).toBe(403);

    const badType = await POST(
      makePostRequest('/api/auth/preferences', { payload: {} }, {
        ...csrfHeader(),
        'content-type': 'text/plain',
      })
    );
    expect(badType.status).toBe(415);
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('returns 413 when the body exceeds the 64KB request cap (audit N-08)', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: { blob: 'x'.repeat(70 * 1024) } }, csrfHeader())
    );
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large' });
    // The 1024-char stored-state cap is separate; the request never got that far.
    expect(updateSessionMock).not.toHaveBeenCalled();
  });
});
