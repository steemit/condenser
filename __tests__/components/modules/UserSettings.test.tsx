import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import appReducer, {
  setUserPreferences,
  type UserPreferences,
} from '@/store/slices/appSlice';
import userReducer, { setUser } from '@/store/slices/userSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

const postJsonWithCsrfMock = vi.fn();
vi.mock('@/lib/api/csrf', () => ({
  postJsonWithCsrf: (...args: unknown[]) => postJsonWithCsrfMock(...args),
}));

import UserSettings from '@/components/modules/UserSettings';

function makeStore() {
  const store = configureStore({
    reducer: { app: appReducer, user: userReducer },
  });
  store.dispatch(setUser({ username: 'alice' }));
  return store;
}

/**
 * Render UserSettings and return a rerender(props) that swaps its props in
 * place (same component instance — what a late profile refetch does).
 */
function renderSettings(
  store: ReturnType<typeof makeStore>,
  initialProfile: Record<string, string> | null = null,
  initialAccount = 'alice'
) {
  const props = {
    accountname: initialAccount,
    profile: initialProfile as never,
  };
  const view = render(
    <Provider store={store}>
      <IntlWrapper>
        <UserSettings {...props} />
      </IntlWrapper>
    </Provider>
  );
  return {
    ...view,
    rerenderProps(next: {
      accountname?: string;
      profile?: Record<string, string> | null;
    }) {
      view.rerender(
        <Provider store={store}>
          <IntlWrapper>
            <UserSettings
              accountname={next.accountname ?? props.accountname}
              profile={(next.profile ?? null) as never}
            />
          </IntlWrapper>
        </Provider>
      );
    },
  };
}

/** The Display Name input (label "Display Name", placeholder "Your display name"). */
function nameInput(): HTMLInputElement {
  return screen.getByPlaceholderText('Your display name') as HTMLInputElement;
}

describe('UserSettings "Save Preferences" payload whitelist', () => {
  beforeEach(() => {
    postJsonWithCsrfMock.mockReset();
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
  });
  afterEach(cleanup);

  it('POSTs exactly nightmode/blogmode/nsfwPref — never locale or unknown keys', async () => {
    const store = makeStore();
    // Simulate what Redux can hold at runtime: a cookie-managed locale plus
    // an unknown key carried back by the session-hydration merge.
    store.dispatch(
      setUserPreferences({
        nightmode: true,
        blogmode: false,
        nsfwPref: 'hide',
        locale: 'zh',
        futureKey: 'must-not-persist',
      } as Partial<UserPreferences>)
    );

    renderSettings(store);
    fireEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));

    await waitFor(() => {
      expect(postJsonWithCsrfMock).toHaveBeenCalledTimes(1);
    });
    expect(postJsonWithCsrfMock).toHaveBeenCalledWith('/api/auth/preferences', {
      // The explicit save and the persistence middleware stay consistent:
      // this page's key (nsfwPref) plus the middleware-owned toggles.
      payload: { nightmode: true, blogmode: false, nsfwPref: 'hide' },
    });
    const [, body] = postJsonWithCsrfMock.mock.calls[0] as [
      string,
      { payload: Record<string, unknown> },
    ];
    expect(body.payload).not.toHaveProperty('locale');
    expect(body.payload).not.toHaveProperty('futureKey');
    // Visible success feedback (why nsfwPref saves through this button).
    expect(await screen.findByText('Preferences saved.')).toBeTruthy();
  });
});

describe('UserSettings dirty-guard against late profile refetches (T15)', () => {
  afterEach(cleanup);

  it('fills the form from a profile that arrives after mount (pristine form)', async () => {
    const store = makeStore();
    const view = renderSettings(store, null);
    expect(nameInput().value).toBe('');

    view.rerenderProps({ profile: { name: 'Alice A.' } });

    await waitFor(() => {
      expect(nameInput().value).toBe('Alice A.');
    });
  });

  it('does not clobber in-progress edits when the profile refetches', async () => {
    const store = makeStore();
    const view = renderSettings(store, { name: 'Alice A.' });

    fireEvent.change(nameInput(), { target: { value: 'Alice (editing)' } });

    // Late refetch with the SAME account: the user's edit must survive.
    view.rerenderProps({ profile: { name: 'Alice A. (from chain)' } });
    // Let any (incorrect) effect-driven overwrite flush before asserting.
    await new Promise((r) => setTimeout(r, 0));
    expect(nameInput().value).toBe('Alice (editing)');
  });

  it('re-arms the fill when the viewed account changes (new form context)', async () => {
    const store = makeStore();
    const view = renderSettings(store, { name: 'Alice A.' }, 'alice');

    fireEvent.change(nameInput(), { target: { value: 'Alice (editing)' } });

    // Same component instance now views a different account the same user is
    // logged in as: the dirty flag resets and the fresh profile fills the
    // form (switching accounts is a new form context, not an edit).
    store.dispatch(setUser({ username: 'bob' }));
    view.rerenderProps({ accountname: 'bob', profile: { name: 'Bob B.' } });
    await waitFor(() => {
      expect(nameInput().value).toBe('Bob B.');
    });
  });
});
