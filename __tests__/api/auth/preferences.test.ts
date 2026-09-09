import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/auth/session', () => ({
  COOKIE_NAME: 'session',
  getSession: vi.fn(),
  setSessionCookie: vi.fn(),
  updateSession: vi.fn(),
}));

import { POST } from '@/app/api/auth/preferences/route';
import { getSession, setSessionCookie, updateSession } from '@/lib/auth/session';

const getSessionMock = getSession as unknown as Mock;
const updateSessionMock = updateSession as unknown as Mock;
const setSessionCookieMock = setSessionCookie as unknown as Mock;

const loggedInSession = {
  username: 'alice',
  uid: 'uid-1',
  lastVisit: 1700000000,
  newVisit: false,
  userPreferences: { nsfwPref: 'warn' },
};

describe('POST /api/auth/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateSessionMock.mockResolvedValue('updated-token');
  });

  it('rejects anonymous sessions with 401', async () => {
    getSessionMock.mockResolvedValue({ uid: 'uid-2', userPreferences: {} });

    const res = await POST(makePostRequest('/api/auth/preferences', { payload: { nsfwPref: 'hide' } }));
    expect(res.status).toBe(401);
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('rejects non-object payloads with 400', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    for (const payload of [null, 'str', 42, [1, 2]]) {
      const res = await POST(makePostRequest('/api/auth/preferences', { payload }));
      expect(res.status).toBe(400);
    }
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('rejects payloads over the 1024-char cap', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: { blob: 'x'.repeat(2000) } })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'the data is too long' });
    expect(updateSessionMock).not.toHaveBeenCalled();
  });

  it('merges the payload into session userPreferences and re-issues the cookie', async () => {
    getSessionMock.mockResolvedValue(loggedInSession);

    const res = await POST(
      makePostRequest('/api/auth/preferences', { payload: { nsfwPref: 'hide', theme: 'dark' } })
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
});
