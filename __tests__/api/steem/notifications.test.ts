import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getAccountNotifications: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

import { GET } from '@/app/api/steem/notifications/route';
import { getAccountNotifications } from '@/lib/steem/client';
import { getSession } from '@/lib/auth/session';

const getNotificationsMock = vi.mocked(getAccountNotifications);
const getSessionMock = getSession as unknown as Mock;

const NOTIFICATIONS = [
  { id: 3, type: 'vote', msg: 'bob voted', score: 0 },
  { id: 2, type: 'comment', msg: 'carol replied', score: 0 },
];

describe('GET /api/steem/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Default: alice is signed in.
    getSessionMock.mockResolvedValue({ username: 'alice' });
  });

  it('returns 400 when account is missing', async () => {
    const res = await GET(makeGetRequest('/api/steem/notifications'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Account is required' });
    expect(getNotificationsMock).not.toHaveBeenCalled();
  });

  it('returns 403 when there is no session (audit N-14)', async () => {
    getSessionMock.mockResolvedValue(null);

    const res = await GET(
      makeGetRequest('/api/steem/notifications', { account: 'alice' })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: 'Notifications are only readable for the signed-in account',
    });
    expect(getNotificationsMock).not.toHaveBeenCalled();
  });

  it('returns 403 for an anonymous (challenge-only) session', async () => {
    getSessionMock.mockResolvedValue({ uid: 'uid-1' });

    const res = await GET(
      makeGetRequest('/api/steem/notifications', { account: 'alice' })
    );
    expect(res.status).toBe(403);
    expect(getNotificationsMock).not.toHaveBeenCalled();
  });

  it('returns 403 when the account does not match the session', async () => {
    getSessionMock.mockResolvedValue({ username: 'bob' });

    const res = await GET(
      makeGetRequest('/api/steem/notifications', { account: 'alice' })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: 'Notifications are only readable for the signed-in account',
    });
    expect(getNotificationsMock).not.toHaveBeenCalled();
  });

  it('returns the notification list for the signed-in account', async () => {
    getNotificationsMock.mockResolvedValue(NOTIFICATIONS as Awaited<ReturnType<typeof getAccountNotifications>>);

    const res = await GET(
      makeGetRequest('/api/steem/notifications', { account: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(NOTIFICATIONS);
    expect(getNotificationsMock).toHaveBeenCalledWith({
      account: 'alice',
      last_id: undefined,
      limit: 100,
    });
  });

  it('matches the session account case-insensitively', async () => {
    getNotificationsMock.mockResolvedValue(NOTIFICATIONS as Awaited<ReturnType<typeof getAccountNotifications>>);

    const res = await GET(
      makeGetRequest('/api/steem/notifications', { account: 'Alice' })
    );
    expect(res.status).toBe(200);
    expect(getNotificationsMock).toHaveBeenCalledWith({
      account: 'Alice',
      last_id: undefined,
      limit: 100,
    });
  });

  it('passes last_id and limit through for pagination', async () => {
    getNotificationsMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/notifications', {
        account: 'alice',
        last_id: '42',
        limit: '25',
      })
    );
    expect(res.status).toBe(200);
    expect(getNotificationsMock).toHaveBeenCalledWith({
      account: 'alice',
      last_id: 42,
      limit: 25,
    });
  });

  it('returns 500 with a generic message on RPC failure (audit N-20)', async () => {
    getNotificationsMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/notifications', { account: 'alice' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch notifications' });
  });
});
