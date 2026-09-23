import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest, sessionCookieHeader } from '@/__tests__/helpers/request';

vi.mock('@/lib/auth/session', () => ({
  COOKIE_NAME: 'steem-session',
  getSession: vi.fn(),
  logoutUser: vi.fn(),
  revokeSession: vi.fn(),
  setSessionCookie: vi.fn(),
  clearSessionCookie: vi.fn(),
}));

import { POST } from '@/app/api/auth/logout/route';
import {
  clearSessionCookie,
  getSession,
  logoutUser,
  revokeSession,
  setSessionCookie,
} from '@/lib/auth/session';

const getSessionMock = vi.mocked(getSession);
const logoutUserMock = vi.mocked(logoutUser);
const revokeSessionMock = vi.mocked(revokeSession);
const setSessionCookieMock = vi.mocked(setSessionCookie);
const clearSessionCookieMock = vi.mocked(clearSessionCookie);

const OLD_SID = 'a'.repeat(26); // Redis session id shape

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    revokeSessionMock.mockResolvedValue();
  });

  it('returns 400 when there is no active session', async () => {
    getSessionMock.mockResolvedValue(null);

    const res = await POST(makePostRequest('/api/auth/logout'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'No active session' });
    expect(revokeSessionMock).not.toHaveBeenCalled();
  });

  it('returns 413 when the (ignored) body exceeds the 64KB cap (audit N-08)', async () => {
    getSessionMock.mockResolvedValue({
      username: 'alice',
      uid: 'uid-1',
      lastVisit: 1700000000,
      newVisit: false,
    } as never);

    const res = await POST(
      makePostRequest('/api/auth/logout', { blob: 'x'.repeat(70 * 1024) })
    );
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large' });
    // Rejected before any session work happens.
    expect(getSessionMock).not.toHaveBeenCalled();
    expect(revokeSessionMock).not.toHaveBeenCalled();
  });

  it('revokes the old token, then rotates the session cookie when a user was logged in', async () => {
    const session = {
      username: 'alice',
      uid: 'uid-1',
      lastVisit: 1700000000,
      newVisit: false,
    };
    getSessionMock.mockResolvedValue(session);
    logoutUserMock.mockResolvedValue('fresh-token');

    const res = await POST(
      makePostRequest('/api/auth/logout', undefined, sessionCookieHeader(OLD_SID))
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: 'Logged out successfully',
    });
    // The pre-logout token is revoked server-side (audit N-05) before the
    // replacement cookie is minted.
    expect(revokeSessionMock).toHaveBeenCalledWith(OLD_SID);
    expect(revokeSessionMock.mock.invocationCallOrder[0]).toBeLessThan(
      logoutUserMock.mock.invocationCallOrder[0]
    );
    expect(logoutUserMock).toHaveBeenCalledWith(session);
    expect(setSessionCookieMock).toHaveBeenCalledWith(res, 'fresh-token');
    expect(clearSessionCookieMock).not.toHaveBeenCalled();
  });

  it('revokes the old token and clears the cookie for an anonymous session', async () => {
    getSessionMock.mockResolvedValue({
      uid: 'uid-2',
      lastVisit: 1700000000,
      newVisit: true,
    });

    const res = await POST(
      makePostRequest('/api/auth/logout', undefined, sessionCookieHeader(OLD_SID))
    );
    expect(res.status).toBe(200);
    expect(revokeSessionMock).toHaveBeenCalledWith(OLD_SID);
    expect(logoutUserMock).not.toHaveBeenCalled();
    expect(clearSessionCookieMock).toHaveBeenCalledWith(res);
  });

  it('tolerates a missing cookie when revoking', async () => {
    getSessionMock.mockResolvedValue({
      username: 'alice',
      uid: 'uid-3',
      lastVisit: 1700000000,
      newVisit: false,
    });
    logoutUserMock.mockResolvedValue('fresh-token');

    const res = await POST(makePostRequest('/api/auth/logout'));
    expect(res.status).toBe(200);
    expect(revokeSessionMock).toHaveBeenCalledWith(undefined);
  });
});
