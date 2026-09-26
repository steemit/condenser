import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import appReducer, {
  setUserPreferences,
  toggleBlogmode,
  toggleNightmode,
} from '@/store/slices/appSlice';
import userReducer, { logout, setUser, set } from '@/store/slices/userSlice';
import { createPreferencesPersistenceMiddleware } from '@/store/middleware/preferencesPersistence';

const postJsonWithCsrfMock = vi.fn();
vi.mock('@/lib/api/csrf', () => ({
  postJsonWithCsrf: (...args: unknown[]) => postJsonWithCsrfMock(...args),
}));

function makeStore(loggedIn: boolean) {
  const store = configureStore({
    reducer: { app: appReducer, user: userReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        createPreferencesPersistenceMiddleware({ debounceMs: 100 })
      ),
  });
  if (loggedIn) store.dispatch(setUser({ username: 'alice' }));
  return store;
}

describe('preferencesPersistence middleware (legacy SagaShared parity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('POSTs the toggled preferences to /api/auth/preferences after the debounce', async () => {
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
    const store = makeStore(true);

    store.dispatch(toggleNightmode());
    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(postJsonWithCsrfMock).toHaveBeenCalledTimes(1);
    expect(postJsonWithCsrfMock).toHaveBeenCalledWith('/api/auth/preferences', {
      payload: expect.objectContaining({ nightmode: true }),
    });
  });

  it('sends only the middleware-owned keys — never locale/nsfwPref', async () => {
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
    const store = makeStore(true);

    store.dispatch(toggleNightmode());
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).toHaveBeenCalledTimes(1);
    const [, body] = postJsonWithCsrfMock.mock.calls[0] as [
      string,
      { payload: Record<string, unknown> },
    ];
    // Exactly the two persisted toggles: locale is cookie-managed by
    // I18nProvider and nsfwPref saves through UserSettings' explicit
    // button — neither may ride along into the session.
    expect(body.payload).toEqual({ nightmode: true, blogmode: false });
    expect(body.payload).not.toHaveProperty('locale');
    expect(body.payload).not.toHaveProperty('nsfwPref');
  });

  it('debounces rapid toggles into a single request with the latest value', async () => {
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
    const store = makeStore(true);

    store.dispatch(toggleNightmode());
    store.dispatch(toggleNightmode());
    store.dispatch(toggleBlogmode());

    await vi.advanceTimersByTimeAsync(100);
    expect(postJsonWithCsrfMock).toHaveBeenCalledTimes(1);
    expect(postJsonWithCsrfMock).toHaveBeenCalledWith('/api/auth/preferences', {
      payload: expect.objectContaining({ nightmode: false, blogmode: true }),
    });
  });

  it('persists blogmode toggles too', async () => {
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
    const store = makeStore(true);

    store.dispatch(toggleBlogmode());
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).toHaveBeenCalledWith('/api/auth/preferences', {
      payload: expect.objectContaining({ blogmode: true }),
    });
  });

  it('skips the request for anonymous visitors (route requires a session)', async () => {
    const store = makeStore(false);

    store.dispatch(toggleNightmode());
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();
    // Redux still applied the toggle; only persistence is skipped.
    expect(store.getState().app.user_preferences.nightmode).toBe(true);
  });

  it('cancels the pending timer on logout — no POST after the session is gone', async () => {
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
    const store = makeStore(true);

    store.dispatch(toggleNightmode());
    store.dispatch(logout());
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();
  });

  it('re-checks login at flush time, not only dispatch time', async () => {
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
    const store = makeStore(true);

    store.dispatch(toggleNightmode());
    // Clear the account through a path the middleware does not watch, so
    // the pending timer survives and only the flush-time re-check (not the
    // logout cancellation) can skip the doomed 401 POST.
    store.dispatch(set({ key: ['current'], value: {} }));
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();
  });

  it('does not persist setUserPreferences (hydration / explicit-save path)', async () => {
    const store = makeStore(true);

    store.dispatch(setUserPreferences({ nsfwPref: 'hide' }));
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();
  });

  it('warns silently on failure instead of throwing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    postJsonWithCsrfMock.mockResolvedValue({ ok: false, status: 401 });
    const store = makeStore(true);

    store.dispatch(toggleNightmode());
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalled();

    // Network rejection is swallowed the same way.
    postJsonWithCsrfMock.mockRejectedValue(new Error('offline'));
    store.dispatch(toggleNightmode());
    await vi.advanceTimersByTimeAsync(100);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
