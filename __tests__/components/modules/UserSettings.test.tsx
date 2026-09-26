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

function renderSettings(store: ReturnType<typeof makeStore>) {
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <UserSettings accountname="alice" profile={null} />
      </IntlWrapper>
    </Provider>
  );
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
