import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getUnreadNotifications: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

import { GET } from '@/app/api/steem/unread-notifications/route';
import { getUnreadNotifications } from '@/lib/steem/client';
import { getSession } from '@/lib/auth/session';

const getUnreadMock = vi.mocked(getUnreadNotifications);
const getSessionMock = getSession as unknown as Mock;

describe('GET /api/steem/unread-notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Default: alice is signed in.
    getSessionMock.mockResolvedValue({ username: 'alice' });
  });

  it('returns 400 when account is missing', async () => {
    const res = await GET(makeGetRequest('/api/steem/unread-notifications'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Account is required' });
    expect(getUnreadMock).not.toHaveBeenCalled();
  });

  it('returns 403 when there is no session (audit N-14)', async () => {
    getSessionMock.mockResolvedValue(null);

    const res = await GET(
      makeGetRequest('/api/steem/unread-notifications', { account: 'alice' })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: 'Notifications are only readable for the signed-in account',
    });
    expect(getUnreadMock).not.toHaveBeenCalled();
  });

  it('returns 403 for an anonymous (challenge-only) session', async () => {
    getSessionMock.mockResolvedValue({ uid: 'uid-1' });

    const res = await GET(
      makeGetRequest('/api/steem/unread-notifications', { account: 'alice' })
    );
    expect(res.status).toBe(403);
    expect(getUnreadMock).not.toHaveBeenCalled();
  });

  it('returns 403 when the account does not match the session', async () => {
    getSessionMock.mockResolvedValue({ username: 'bob' });

    const res = await GET(
      makeGetRequest('/api/steem/unread-notifications', { account: 'alice' })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: 'Notifications are only readable for the signed-in account',
    });
    expect(getUnreadMock).not.toHaveBeenCalled();
  });

  it('returns the unread count for the signed-in account', async () => {
    getUnreadMock.mockResolvedValue({
      lastread: '2026-01-01 00:00:00',
      unread: 7,
    } as Awaited<ReturnType<typeof getUnreadNotifications>>);

    const res = await GET(
      makeGetRequest('/api/steem/unread-notifications', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      account: 'alice',
      unread_count: 7,
      lastread: '2026-01-01 00:00:00',
      result: { lastread: '2026-01-01 00:00:00', unread: 7 },
    });
    expect(getUnreadMock).toHaveBeenCalledWith({ account: 'alice' });
  });

  it('matches the session account case-insensitively', async () => {
    getUnreadMock.mockResolvedValue({
      lastread: null,
      unread: 0,
    } as Awaited<ReturnType<typeof getUnreadNotifications>>);

    const res = await GET(
      makeGetRequest('/api/steem/unread-notifications', { account: 'Alice' })
    );
    expect(res.status).toBe(200);
    expect(getUnreadMock).toHaveBeenCalledWith({ account: 'Alice' });
  });

  it('returns 500 with a generic message on RPC failure (audit N-20)', async () => {
    getUnreadMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/unread-notifications', { account: 'alice' })
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to fetch unread notifications');
    expect(body.unread_count).toBe(0);
  });
});
