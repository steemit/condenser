import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getProfile: vi.fn(),
}));

import { GET } from '@/app/api/steem/profile/route';
import { getProfile } from '@/lib/steem/client';

const getProfileMock = vi.mocked(getProfile);

describe('GET /api/steem/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 without an account', async () => {
    const res = await GET(makeGetRequest('/api/steem/profile'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Account is required' });
    expect(getProfileMock).not.toHaveBeenCalled();
  });

  it('returns 404 when the profile is missing', async () => {
    getProfileMock.mockResolvedValue(null);

    const res = await GET(
      makeGetRequest('/api/steem/profile', { account: 'ghost' })
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Profile not found' });
  });

  it('returns the profile and forwards the observer (observer gates the cache)', async () => {
    const profile = { name: 'alice', about: 'hi' };
    getProfileMock.mockResolvedValue(profile);

    const res = await GET(
      makeGetRequest('/api/steem/profile', { account: 'alice', observer: 'bob' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(profile);
    expect(getProfileMock).toHaveBeenCalledWith({
      account: 'alice',
      observer: 'bob',
    });
  });

  it('propagates RPC failures as 500', async () => {
    getProfileMock.mockRejectedValue(new Error('boom'));

    const res = await GET(
      makeGetRequest('/api/steem/profile', { account: 'alice' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });
});
