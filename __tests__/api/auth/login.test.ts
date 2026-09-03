import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  getAccount: vi.fn(),
  callSteemApi: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
  loginUser: vi.fn(),
  setSessionCookie: vi.fn(),
}));

const { verifySignatureMock } = vi.hoisted(() => ({ verifySignatureMock: vi.fn() }));

vi.mock('@steemit/steem-js', () => ({
  steem: {
    auth: {
      verifySignature: verifySignatureMock,
    },
  },
}));

import { POST } from '@/app/api/auth/login/route';
import { callSteemApi, getAccount } from '@/lib/steem/client';
import { getSession, loginUser, setSessionCookie } from '@/lib/auth/session';

const getAccountMock = vi.mocked(getAccount);
const callSteemApiMock = vi.mocked(callSteemApi);
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
    verifySignatureMock.mockReturnValue(true);
    // The challenge route stores the issued challenge in the session cookie;
    // the login route verifies the signed challenge against it.
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE } as never);
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
    getSessionMock.mockResolvedValue({ loginChallenge: 'different' } as never);

    const res = await POST(
      makePostRequest('/api/auth/login', { ...validBody(), challenge: 'different' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid authentication data' });
  });

  it('returns 400 when the challenge does not match the session', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue({ loginChallenge: 'other-challenge' } as never);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid or expired login challenge' });
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('returns 400 when the session has no stored challenge', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue(null);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid or expired login challenge' });
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the signature does not verify', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    verifySignatureMock.mockReturnValue(false);

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid signature' });
  });

  it('creates a session and sets the cookie on success', async () => {
    getAccountMock.mockResolvedValue(accountWithPostingKey());
    getSessionMock.mockResolvedValue({ loginChallenge: CHALLENGE } as never);
    loginUserMock.mockResolvedValue('new-session-token');

    const res = await POST(makePostRequest('/api/auth/login', validBody()));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.username).toBe('alice');
    expect(loginUserMock).toHaveBeenCalledWith({ loginChallenge: CHALLENGE }, 'alice');
    expect(setSessionCookieMock).toHaveBeenCalledWith(res, 'new-session-token');
    // Legacy login_account checkpoint: sign-in is reported to overseer.
    expect(callSteemApiMock).toHaveBeenCalledWith('overseer.collect', [
      'custom',
      {
        measurement: 'user_login',
        tags: { entry: 'condenser', version: 'next' },
        fields: { username: 'alice' },
      },
    ]);
  });
});
