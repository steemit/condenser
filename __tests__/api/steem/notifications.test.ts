import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getAccountNotifications: vi.fn(),
}));

import { GET } from '@/app/api/steem/notifications/route';
import { getAccountNotifications } from '@/lib/steem/client';

const getNotificationsMock = vi.mocked(getAccountNotifications);

const NOTIFICATIONS = [
  { id: 3, type: 'vote', msg: 'bob voted', score: 0 },
  { id: 2, type: 'comment', msg: 'carol replied', score: 0 },
];

describe('GET /api/steem/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 when account is missing', async () => {
    const res = await GET(makeGetRequest('/api/steem/notifications'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Account is required' });
    expect(getNotificationsMock).not.toHaveBeenCalled();
  });

  it('returns the notification list for an account', async () => {
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

  it('propagates RPC failures as 500', async () => {
    getNotificationsMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/notifications', { account: 'alice' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });
});
