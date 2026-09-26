import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { ReactNode } from 'react';

import { useUnreadNotifications } from '@/hooks/use-unread-notifications';
import { receiveUnreadNotifications } from '@/store/slices/globalSlice';
import globalReducer from '@/store/slices/globalSlice';
import { fetchUnreadNotificationsCount } from '@/lib/api/steem';

vi.mock('@/lib/api/steem', () => ({
  fetchUnreadNotificationsCount: vi.fn(),
}));

const fetchMock = fetchUnreadNotificationsCount as unknown as Mock;

function makeStore() {
  return configureStore({ reducer: { global: globalReducer } });
}

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useUnreadNotifications (T16 single source of truth)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('polls on mount, stores the snapshot in Redux and returns the count', async () => {
    fetchMock.mockResolvedValue({
      account: 'alice',
      unread_count: 3,
      lastread: '2026-09-26 09:00:00',
    });
    const store = makeStore();

    const { result } = renderHook(() => useUnreadNotifications('alice'), {
      wrapper: wrapper(store),
    });

    await act(async () => {});
    expect(store.getState().global.notifications.alice.unreadNotifications).toEqual({
      lastread: '2026-09-26 09:00:00',
      unread: 3,
    });
    expect(result.current).toBe(3);
  });

  it('re-polls every 60 seconds and stops on unmount', async () => {
    fetchMock.mockResolvedValue({
      account: 'alice',
      unread_count: 1,
      lastread: '2026-09-26 09:00:00',
    });
    const store = makeStore();

    const hook = renderHook(() => useUnreadNotifications('alice'), {
      wrapper: wrapper(store),
    });
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    hook.unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(180_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('keeps the last known count when the route errors', async () => {
    fetchMock.mockResolvedValueOnce({
      account: 'alice',
      unread_count: 2,
      lastread: '2026-09-26 09:00:00',
    });
    fetchMock.mockResolvedValue({ account: 'alice', unread_count: 0, error: 'boom' });
    const store = makeStore();

    const { result } = renderHook(() => useUnreadNotifications('alice'), {
      wrapper: wrapper(store),
    });
    await act(async () => {});
    expect(result.current).toBe(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    // The errored poll must not zero the badge.
    expect(result.current).toBe(2);
    expect(store.getState().global.notifications.alice.unreadNotifications?.unread).toBe(2);
  });

  it('survives a rejected fetch without zeroing', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    const store = makeStore();

    const { result } = renderHook(() => useUnreadNotifications('alice'), {
      wrapper: wrapper(store),
    });

    await act(async () => {});
    expect(result.current).toBe(0);
    expect(store.getState().global.notifications.alice).toBeUndefined();
  });

  it('does not poll without a username', async () => {
    const store = makeStore();

    const { result } = renderHook(() => useUnreadNotifications(undefined), {
      wrapper: wrapper(store),
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toBe(0);
  });

  it('a mark-read dispatch stays zeroed against a stale poll (guard wiring)', async () => {
    // Order that produced the T16 race: poll in flight before mark-read
    // resolves with the pre-setLastRead pair afterwards.
    fetchMock.mockResolvedValue({
      account: 'alice',
      unread_count: 7,
      lastread: '2026-09-26 09:59:00',
    });
    const store = makeStore();

    const { result } = renderHook(() => useUnreadNotifications('alice'), {
      wrapper: wrapper(store),
    });
    await act(async () => {});
    expect(result.current).toBe(7);

    // Mark-all-as-read lands (immediate local marker, no 6s delay).
    act(() => {
      store.dispatch(
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T10:00:00', unread: 0 },
        })
      );
    });
    expect(result.current).toBe(0);

    // Next poll still carries hivemind's stale pair — the badge stays 0.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(result.current).toBe(0);
  });
});
