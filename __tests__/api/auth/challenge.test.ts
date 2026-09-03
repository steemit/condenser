import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  COOKIE_NAME: 'steem-session',
  createSession: vi.fn(),
  getSession: vi.fn(),
  setSessionCookie: vi.fn(),
  updateSession: vi.fn(),
}));

import { GET } from '@/app/api/auth/challenge/route';
import { makeGetRequest } from '@/__tests__/helpers/request';
import {
  createSession,
  getSession,
  setSessionCookie,
  updateSession,
} from '@/lib/auth/session';

const createSessionMock = vi.mocked(createSession);
const getSessionMock = vi.mocked(getSession);
const updateSessionMock = vi.mocked(updateSession);
const setSessionCookieMock = vi.mocked(setSessionCookie);

describe('GET /api/auth/challenge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getSessionMock.mockResolvedValue(null);
    createSessionMock.mockResolvedValue('session-token');
    updateSessionMock.mockResolvedValue('updated-session-token');
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
});
