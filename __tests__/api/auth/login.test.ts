import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getAccount: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
  loginUser: vi.fn(),
  setSessionCookie: vi.fn(),
}));

const { verifyMock } = vi.hoisted(() => ({ verifyMock: vi.fn() }));

vi.mock('@steemit/steem-js', () => ({
  verify: verifyMock,
}));

import { POST } from '@/app/api/auth/login/route';
import { getAccount } from '@/lib/steem/client';
import { getSession, loginUser, setSessionCookie } from '@/lib/auth/session';

const getAccountMock = vi.mocked(getAccount);
const getSessionMock = vi.mocked(getSession);
const loginUserMock = vi.mocked(loginUser);
const setSessionCookieMock = vi.mocked(setSessionCookie);

const POSTING_KEY = 'STM6 posting key';
const CHALLENGE = 'abc123';

function validBody() {
  return {
    username: 'alice',
    signature: 'deadbeef',
    publicKey: POSTING_KEY,
    data: JSON.stringify({
      username: 'alice',
      challenge: CHALLENGE,
      action: 'login',
    }),
    challenge: CHALLENGE,
  };
}

function accountWithPostingKey(key = POSTING_KEY) {
  return { name: 'alice', posting: { key_auths: [[key, 1]] } };
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    verifyMock.mockReturnValue(true);
  });

  it('rejects bodies missing required fields', async () => {
    const res = await POST(makePostRequest('/api/auth/login', { username: 'alice' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Missing required fields');
  });

  it('returns 404 for an unknown account', async () => {
    getAccountMock.mockResolvedValue(null);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Account not found' });
  });

  it('returns 401 when the public key is not a posting authority', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey('STMother key'));

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('not authorized for posting');
  });

  it('returns 400 when data is not valid JSON', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());

    const res = await POST(
      makePostRequest('/api/auth/login', { ...validBody(), data: 'not-json' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid data format' });
  });

  it('returns 400 when the signed data does not match the request', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());

    const res = await POST(
      makePostRequest('/api/auth/login', { ...validBody(), challenge: 'different' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid authentication data' });
  });

  it('returns 401 when the signature does not verify', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    verifyMock.mockReturnValue(false);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid signature' });
  });

  it('creates a session and sets the cookie on success', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue(null);
    loginUserMock.mockResolvedValue('new-session-token');

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.username).toBe('alice');
    expect(loginUserMock).toHaveBeenCalledWith(null, 'alice');
    expect(setSessionCookieMock).toHaveBeenCalledWith(res, 'new-session-token');
  });
});
