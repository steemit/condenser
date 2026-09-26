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

  it('skips the flush for anonymous visitors (route requires a session)', async () => {
    const store = makeStore(false);

    store.dispatch(toggleNightmode());
    await vi.advanceTimersByTimeAsync(100);

    // The debounce arms regardless of login state; the flush-time gate is
    // what skips the POST. Redux still applied the toggle.
    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();
    expect(store.getState().app.user_preferences.nightmode).toBe(true);
  });

  it('keeps a toggle dispatched anonymously when a login lands inside the debounce window', async () => {
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
    const store = makeStore(false);

    store.dispatch(toggleNightmode());
    // Login inside the window: the pending toggle now belongs to a valid
    // session — this is why the dispatch path does not filter on login.
    store.dispatch(setUser({ username: 'alice' }));
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).toHaveBeenCalledTimes(1);
    expect(postJsonWithCsrfMock).toHaveBeenCalledWith('/api/auth/preferences', {
      payload: { nightmode: true, blogmode: false },
    });
  });

  it('cancels the pending timer on logout — a re-login inside the window must not resurrect it', async () => {
    postJsonWithCsrfMock.mockResolvedValue({ ok: true });
    const store = makeStore(true);

    store.dispatch(toggleNightmode());
    store.dispatch(logout());
    // Re-login through a path the middleware does not watch: if the
    // cancellation branch were deleted, the surviving timer's flush would
    // pass the login gate and POST — that is what isolates this test from
    // the flush-time gate above.
    store.dispatch(setUser({ username: 'alice' }));
    await vi.advanceTimersByTimeAsync(100);

    expect(postJsonWithCsrfMock).not.toHaveBeenCalled();
  });

  it('skips the flush when the account was cleared through an unwatched path', async () => {
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
