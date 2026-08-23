import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
  logoutUser: vi.fn(),
  setSessionCookie: vi.fn(),
  clearSessionCookie: vi.fn(),
}));

import { POST } from '@/app/api/auth/logout/route';
import {
  clearSessionCookie,
  getSession,
  logoutUser,
  setSessionCookie,
} from '@/lib/auth/session';

const getSessionMock = vi.mocked(getSession);
const logoutUserMock = vi.mocked(logoutUser);
const setSessionCookieMock = vi.mocked(setSessionCookie);
const clearSessionCookieMock = vi.mocked(clearSessionCookie);

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 when there is no active session', async () => {
    getSessionMock.mockResolvedValue(null);

    const res = await POST(makePostRequest('/api/auth/logout'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'No active session' });
  });

  it('rotates the session cookie when a user was logged in', async () => {
    const session = {
      username: 'alice',
      uid: 'uid-1',
      lastVisit: 1700000000,
      newVisit: false,
    };
    getSessionMock.mockResolvedValue(session);
    logoutUserMock.mockResolvedValue('fresh-token');

    const res = await POST(makePostRequest('/api/auth/logout'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: 'Logged out successfully',
    });
    expect(logoutUserMock).toHaveBeenCalledWith(session);
    expect(setSessionCookieMock).toHaveBeenCalledWith(res, 'fresh-token');
    expect(clearSessionCookieMock).not.toHaveBeenCalled();
  });

  it('clears the cookie for an anonymous session', async () => {
    getSessionMock.mockResolvedValue({
      uid: 'uid-2',
      lastVisit: 1700000000,
      newVisit: true,
    });

    const res = await POST(makePostRequest('/api/auth/logout'));
    expect(res.status).toBe(200);
    expect(logoutUserMock).not.toHaveBeenCalled();
    expect(clearSessionCookieMock).toHaveBeenCalledWith(res);
  });
});
