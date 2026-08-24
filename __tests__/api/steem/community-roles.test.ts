import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getCommunityRoles: vi.fn(),
  getCommunitySubscribers: vi.fn(),
}));

import { GET } from '@/app/api/steem/community-roles/route';
import { getCommunityRoles, getCommunitySubscribers } from '@/lib/steem/client';

const getCommunityRolesMock = vi.mocked(getCommunityRoles);
const getCommunitySubscribersMock = vi.mocked(getCommunitySubscribers);

describe('GET /api/steem/community-roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 without a community', async () => {
    const res = await GET(makeGetRequest('/api/steem/community-roles'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Community is required' });
    expect(getCommunityRolesMock).not.toHaveBeenCalled();
    expect(getCommunitySubscribersMock).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown type', async () => {
    const res = await GET(
      makeGetRequest('/api/steem/community-roles', {
        community: 'hive-1',
        type: 'bogus',
      })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Type must be "roles" or "subscribers"',
    });
  });

  it('maps list_community_roles [name, role, title] tuples to objects', async () => {
    // Tuple order per legacy pages/CommunityRoles.jsx (tuple[0]=name,
    // tuple[1]=role, tuple[2]=title).
    getCommunityRolesMock.mockResolvedValue([
      ['alice', 'admin', 'founder'],
      ['bob', 'mod', ''],
    ]);

    const res = await GET(
      makeGetRequest('/api/steem/community-roles', { community: 'hive-1' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { name: 'alice', role: 'admin', title: 'founder' },
      { name: 'bob', role: 'mod', title: '' },
    ]);
    expect(getCommunityRolesMock).toHaveBeenCalledWith({ community: 'hive-1' });
  });

  it('maps list_subscribers [name, role, title, created_at] tuples to objects', async () => {
    // Tuple order per legacy modules/CommunitySubscriberList.jsx (s[0]=name,
    // s[1]=role, s[2]=title); hivemind appends created_at at index 3.
    getCommunitySubscribersMock.mockResolvedValue([
      ['carol', 'guest', '', '2024-01-01T00:00:00'],
    ]);

    const res = await GET(
      makeGetRequest('/api/steem/community-roles', {
        community: 'hive-1',
        type: 'subscribers',
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { name: 'carol', role: 'guest', title: '', created_at: '2024-01-01T00:00:00' },
    ]);
    expect(getCommunitySubscribersMock).toHaveBeenCalledWith({
      community: 'hive-1',
    });
  });

  it('passes through already-object rows unchanged', async () => {
    getCommunityRolesMock.mockResolvedValue([
      { name: 'alice', role: 'admin', title: 'founder' },
    ]);

    const res = await GET(
      makeGetRequest('/api/steem/community-roles', { community: 'hive-1' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { name: 'alice', role: 'admin', title: 'founder' },
    ]);
  });

  it('propagates RPC failures as 500', async () => {
    getCommunityRolesMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/community-roles', { community: 'hive-1' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });
});
