import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getCommunityNotifications: vi.fn(),
}));

import { GET } from '@/app/api/steem/community-notifications/route';
import { getCommunityNotifications } from '@/lib/steem/client';

const getCommunityNotificationsMock = vi.mocked(getCommunityNotifications);

describe('GET /api/steem/community-notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 without a name', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/community-notifications')
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Community name is required',
    });
    expect(getCommunityNotificationsMock).not.toHaveBeenCalled();
  });

  it('rejects user account names (audit N-14: no per-account oracle)', async () => {
    // /api/steem/notifications gates reads to the signed-in account so our
    // routes are not an unauthenticated per-account notifications oracle;
    // this public sibling must only ever serve hive-* community names.
    const res = await GET(
      makeGetRequest('/api/steem/community-notifications', {
        name: 'alice',
      })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid community name' });
    expect(getCommunityNotificationsMock).not.toHaveBeenCalled();
  });

  it('serves a community without a session', async () => {
    getCommunityNotificationsMock.mockResolvedValue([
      { id: 1, type: 'set_role', msg: '@alice is now mod', date: '2024-01-01 00:00:00' },
    ]);

    const res = await GET(
      makeGetRequest('/api/steem/community-notifications', {
        name: 'hive-166405',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { id: 1, type: 'set_role', msg: '@alice is now mod', date: '2024-01-01 00:00:00' },
    ]);
    expect(getCommunityNotificationsMock).toHaveBeenCalledWith({
      account: 'hive-166405',
      last_id: undefined,
      limit: 100,
    });
  });

  it('clamps the limit and parses last_id', async () => {
    getCommunityNotificationsMock.mockResolvedValue([]);

    const res = await GET(
      makeGetRequest('/api/steem/community-notifications', {
        name: 'hive-166405',
        limit: '5000',
        last_id: '42',
      })
    );
    expect(res.status).toBe(200);
    expect(getCommunityNotificationsMock).toHaveBeenCalledWith({
      account: 'hive-166405',
      last_id: 42,
      limit: 100,
    });
  });

  it('returns 500 with a generic message on RPC failure (audit N-20)', async () => {
    getCommunityNotificationsMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/community-notifications', {
        name: 'hive-166405',
      })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Failed to fetch community notifications',
    });
  });
});
