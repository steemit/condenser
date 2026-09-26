import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import userReducer from '@/store/slices/userSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
  usePathname: () => '/trending',
}));

// steem-js's ecc stack cannot run under vitest's jsdom (noble/hashes rejects
// the jsdom-realm Uint8Array), so the WIF<->pubkey helpers are faked with a
// fixed WIF->PUB table. eligiblePostingPublicKeys is pure (no crypto) and
// stays real — it is the code under test.
const { validatePostingKeyMock, PUB_BY_WIF } = vi.hoisted(() => {
  const PUB_BY_WIF: Record<string, string> = {
    '5J-test-wif-1': 'STMtestpub1',
    '5J-test-wif-2': 'STMtestpub2',
    '5J-test-wif-3': 'STMtestpub3',
  };
  const validatePostingKeyMock = vi.fn(
    (wif: string, expected: string | string[]) => {
      const expectedKeys = Array.isArray(expected) ? expected : [expected];
      const pub = PUB_BY_WIF[wif];
      if (!pub) {
        return { isValid: false, error: 'Invalid private key format' };
      }
      if (!expectedKeys.includes(pub)) {
        return {
          isValid: false,
          error: 'Private key does not match any eligible posting public key for this account',
        };
      }
      return { isValid: true, publicKey: pub };
    }
  );
  return { validatePostingKeyMock, PUB_BY_WIF };
});

const WIF1 = '5J-test-wif-1';
const WIF2 = '5J-test-wif-2';
const WIF3 = '5J-test-wif-3';
const PUB1 = PUB_BY_WIF[WIF1];
const PUB2 = PUB_BY_WIF[WIF2];

vi.mock('@/lib/crypto/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/crypto/client')>();
  return {
    ...actual,
    isWifFormat: (key: string) => key in PUB_BY_WIF,
    isPublicKeyFormat: (key: string) => key.startsWith('STMtestpub'),
    validatePostingKey: validatePostingKeyMock,
    signAuthData: (wif: string, username: string, challenge: string) => ({
      signature: `sig-${wif}`,
      publicKey: PUB_BY_WIF[wif],
      data: JSON.stringify({
        username,
        challenge,
        timestamp: Date.now(),
        action: 'login',
      }),
    }),
  };
});

vi.mock('@/lib/crypto/key-storage', () => ({
  encryptAndStoreKey: vi.fn().mockResolvedValue(undefined),
}));

const postJsonWithCsrfMock = vi.fn();
vi.mock('@/lib/api/csrf', () => ({
  postJsonWithCsrf: (...args: unknown[]) => postJsonWithCsrfMock(...args),
}));

// Avoid the real thunk's follow-state fetches; the form only needs
// dispatch(loginThunk(payload)).unwrap() to resolve.
vi.mock('@/store/thunks/authThunks', () => ({
  loginThunk: vi.fn(() => async () => ({ unwrap: async () => undefined })),
}));

import LoginForm from '@/components/modules/LoginForm';

const MULTI_KEY_ACCOUNT = {
  name: 'alice',
  posting: {
    weight_threshold: 1,
    key_auths: [
      [PUB1, 1],
      [PUB2, 1],
    ],
  },
};

const fetchMock = vi.fn();

function mockAccountAndChallenge(account: unknown) {
  fetchMock.mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith('/api/steem/account')) {
      return Promise.resolve({ ok: true, json: async () => account });
    }
    if (url === '/api/auth/challenge') {
      return Promise.resolve({ ok: true, json: async () => ({ challenge: 'ch-1' }) });
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`));
  });
}

function renderForm() {
  const store = configureStore({ reducer: { user: userReducer } });
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <LoginForm />
      </IntlWrapper>
    </Provider>
  );
}

async function submitLogin(wif: string) {
  // The inputs have no <label>; target them by id like a user typing into
  // the visible fields.
  fireEvent.change(document.getElementById('username')!, {
    target: { value: 'alice' },
  });
  fireEvent.change(document.getElementById('password')!, {
    target: { value: wif },
  });
  fireEvent.click(screen.getByRole('button', { name: /^login$/i }));
}

describe('LoginForm posting-key matching (audit S4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    postJsonWithCsrfMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('logs in with the second posting key of a multi-key account', async () => {
    mockAccountAndChallenge(MULTI_KEY_ACCOUNT);

    renderForm();
    await submitLogin(WIF2);

    // The form must hand validatePostingKey every eligible key, not only
    // key_auths[0] (legacy AuthSaga pubkeyThreshold matched all entries).
    await waitFor(() => {
      expect(validatePostingKeyMock).toHaveBeenCalledWith(WIF2, [PUB1, PUB2]);
    });
    await waitFor(() => {
      expect(postJsonWithCsrfMock).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({ username: 'alice', publicKey: PUB2 })
      );
    });
  });

  it('still logs in with the first posting key', async () => {
    mockAccountAndChallenge(MULTI_KEY_ACCOUNT);

    renderForm();
    await submitLogin(WIF1);

    await waitFor(() => {
      expect(postJsonWithCsrfMock).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({ username: 'alice', publicKey: PUB1 })
      );
    });
  });

  it('rejects a WIF matching none of the posting keys', async () => {
    mockAccountAndChallenge(MULTI_KEY_ACCOUNT);

    renderForm();
    await submitLogin(WIF3);

    await waitFor(() => {
      expect(
        screen.getByText(/does not match any eligible posting public key/i)
      ).toBeInTheDocument();
    });
    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();
  });

  it('rejects a listed key whose weight alone cannot meet the threshold', async () => {
    // PUB2 is listed with weight=0: the chain does not forbid such entries,
    // but legacy authStr semantics classify the key as 'none' — it must not
    // authenticate anyone.
    mockAccountAndChallenge({
      name: 'alice',
      posting: {
        weight_threshold: 1,
        key_auths: [
          [PUB1, 1],
          [PUB2, 0],
        ],
      },
    });

    renderForm();
    await submitLogin(WIF2);

    await waitFor(() => {
      expect(validatePostingKeyMock).toHaveBeenCalledWith(WIF2, [PUB1]);
    });
    await waitFor(() => {
      expect(
        screen.getByText(/does not match any eligible posting public key/i)
      ).toBeInTheDocument();
    });
    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();
  });
});
