import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getAccount: vi.fn(),
}));

import { GET } from '@/app/api/steem/account/route';
import { getAccount } from '@/lib/steem/client';

const getAccountMock = vi.mocked(getAccount);

describe('GET /api/steem/account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 without a username', async () => {
    const res = await GET(makeGetRequest('/api/steem/account'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Username is required' });
    expect(getAccountMock).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown account', async () => {
    getAccountMock.mockResolvedValue(null);

    const res = await GET(
      makeGetRequest('/api/steem/account', { username: 'ghost' })
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Account not found' });
  });

  it('returns the account on success', async () => {
    const account = { name: 'alice', reputation: 42 };
    getAccountMock.mockResolvedValue(account);

    const res = await GET(
      makeGetRequest('/api/steem/account', { username: 'alice' })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(account);
    expect(getAccountMock).toHaveBeenCalledWith('alice');
  });

  it('propagates RPC failures as 500', async () => {
    getAccountMock.mockRejectedValue(new Error('timeout'));

    const res = await GET(
      makeGetRequest('/api/steem/account', { username: 'alice' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'timeout' });
  });
});
