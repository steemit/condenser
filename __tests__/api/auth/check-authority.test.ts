import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@steemit/steem-js', () => ({
  steem: {
    auth: {
      isWif: vi.fn(() => false),
      wifToPublic: vi.fn(() => 'STM_PUB'),
      toWif: vi.fn(() => 'WIF'),
    },
  },
}));

vi.mock('@/lib/steem/client', () => ({
  getAccount: vi.fn(),
}));

import { POST } from '@/app/api/auth/check-authority/route';
import { getAccount } from '@/lib/steem/client';

const getAccountMock = vi.mocked(getAccount);

describe('POST /api/auth/check-authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getAccountMock.mockResolvedValue(null);
  });

  it('returns 413 when the body exceeds the 64KB cap (audit N-08 follow-up)', async () => {
    // The endpoint is exempt from rate limiting (scheduled for removal,
    // audit TODO 11) but must not buffer an unbounded body.
    const res = await POST(
      makePostRequest('/api/auth/check-authority', {
        username: 'alice',
        password: 'x'.repeat(70 * 1024),
      })
    );
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large' });
    expect(getAccountMock).not.toHaveBeenCalled();
  });

  it('parses a within-cap body and keeps its existing behavior', async () => {
    const res = await POST(
      makePostRequest('/api/auth/check-authority', {
        username: 'alice',
        password: 'secret',
      })
    );
    // Unknown account keeps the pre-existing 404 shape.
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Account not found' });
    expect(getAccountMock).toHaveBeenCalledWith('alice');
  });

  it('returns 400 when username or password is missing', async () => {
    const res = await POST(
      makePostRequest('/api/auth/check-authority', { username: 'alice' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Username and password are required',
    });
  });
});
