import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getCommunity: vi.fn(),
}));

import { GET } from '@/app/api/steem/community/route';
import { getCommunity } from '@/lib/steem/client';

const getCommunityMock = vi.mocked(getCommunity);

describe('GET /api/steem/community', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 without a name', async () => {
    const res = await GET(makeGetRequest('/api/steem/community'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Community name is required',
    });
    expect(getCommunityMock).not.toHaveBeenCalled();
  });

  it('returns 400 for a non-community name', async () => {
    // The route serves community ids only — plain tags and account names are
    // not valid lookups here (and keep the cache key space bounded).
    const res = await GET(
      makeGetRequest('/api/steem/community', { name: 'bitcoin' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid community name' });
    expect(getCommunityMock).not.toHaveBeenCalled();
  });

  it('passes the observer through (personalised context)', async () => {
    getCommunityMock.mockResolvedValue({ name: 'hive-1', title: 'One' });

    const res = await GET(
      makeGetRequest('/api/steem/community', {
        name: 'hive-1',
        observer: 'alice',
      })
    );
    expect(res.status).toBe(200);
    expect(getCommunityMock).toHaveBeenCalledWith({
      name: 'hive-1',
      observer: 'alice',
    });
    expect(await res.json()).toEqual({ name: 'hive-1', title: 'One' });
  });

  it('returns 404 when hivemind has no community (legacy community.name guard)', async () => {
    getCommunityMock.mockResolvedValue({ name: '' });

    const res = await GET(
      makeGetRequest('/api/steem/community', { name: 'hive-999999999' })
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Community not found' });
  });

  it('returns 404 when the RPC returns null', async () => {
    getCommunityMock.mockResolvedValue(null);

    const res = await GET(
      makeGetRequest('/api/steem/community', { name: 'hive-1' })
    );
    expect(res.status).toBe(404);
  });

  it('returns 500 with a generic message on RPC failure (audit N-20)', async () => {
    getCommunityMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/community', { name: 'hive-1' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch community' });
  });
});
