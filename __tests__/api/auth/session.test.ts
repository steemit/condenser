import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/auth/session', () => ({
  withSession: vi.fn(),
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

import { GET } from '@/app/api/auth/session/route';
import { withSession } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/cache/rate-limit';

const withSessionMock = withSession as unknown as Mock;
const checkRateLimitMock = vi.mocked(checkRateLimit);

/** Drive the mocked withSession so it invokes the handler with a fixed session. */
function givenSession(session: unknown) {
  withSessionMock.mockImplementation((_req: unknown, handler: (s: unknown) => unknown) =>
    handler(session)
  );
}

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('reports unauthenticated when there is no session', async () => {
    givenSession(null);

    const res = await GET(makeGetRequest('/api/auth/session'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ authenticated: false, session: null });
  });

  it('returns the user for a logged-in session', async () => {
    givenSession({
      username: 'alice',
      uid: 'uid-1',
      lastVisit: 1700000000,
      newVisit: false,
      userPreferences: { locale: 'en' },
    });

    const res = await GET(makeGetRequest('/api/auth/session'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      authenticated: true,
      session: {
        username: 'alice',
        uid: 'uid-1',
        lastVisit: 1700000000,
        newVisit: false,
        userPreferences: { locale: 'en' },
      },
    });
  });

  it('returns an anonymous session shape when no user is logged in', async () => {
    givenSession({ uid: 'uid-2', lastVisit: 1700000000, newVisit: true });

    const res = await GET(makeGetRequest('/api/auth/session'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
    expect(body.session).toEqual({
      username: null,
      uid: 'uid-2',
      lastVisit: 1700000000,
      newVisit: true,
      userPreferences: {},
    });
  });

  it('checks the auth:session limit (120/min/IP) before doing any work', async () => {
    givenSession(null);

    await GET(makeGetRequest('/api/auth/session'));
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1);
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      expect.anything(),
      { key: 'auth:session', limit: 120, windowSeconds: 60 }
    );
  });

  it('returns 429 with Retry-After and mints no session when the limit is hit', async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfterSeconds: 17 });

    const res = await GET(makeGetRequest('/api/auth/session'));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('17');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    // Rejected before withSession could mint a session for the cookie-less hit.
    expect(withSessionMock).not.toHaveBeenCalled();
  });
});
