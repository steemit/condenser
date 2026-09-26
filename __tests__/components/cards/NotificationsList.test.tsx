import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import NotificationsList from '@/components/cards/NotificationsList';
import { receiveUnreadNotifications } from '@/store/slices/globalSlice';
import globalReducer from '@/store/slices/globalSlice';
import { lastreadTimeMs } from '@/lib/utils/lastread';
import { IntlWrapper } from '@/__tests__/helpers/i18n';
import { broadcastCustomJson } from '@/lib/api/broadcast';
import { fetchUnreadNotificationsCount } from '@/lib/api/steem';
import { cachedFetch } from '@/lib/cache/client-fetch';

// Mark-all-as-read is a posting-auth custom_json broadcast — mock the signer
// boundary. The shared unread hook polls through the steem client and the
// list loads through the browser SWR cache; both are stubbed so the store
// seed drives the render.
vi.mock('@/lib/api/broadcast', () => ({
  broadcastCustomJson: vi.fn(),
}));
vi.mock('@/lib/api/steem', () => ({
  fetchUnreadNotificationsCount: vi.fn(),
}));
vi.mock('@/lib/cache/client-fetch', () => ({
  cachedFetch: vi.fn(),
}));

const broadcastMock = broadcastCustomJson as unknown as Mock;
const fetchMock = fetchUnreadNotificationsCount as unknown as Mock;
const cachedFetchMock = cachedFetch as unknown as Mock;

// Marker/seed pair returned identically by the poll so the store cannot
// drift between seed and assertion regardless of when the suite runs.
const SEED = { lastread: '2026-09-26 09:00:00', unread: 5 };

function makeStore() {
  return configureStore({ reducer: { global: globalReducer } });
}

function renderList(store: ReturnType<typeof makeStore>) {
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <NotificationsList username="alice" />
      </IntlWrapper>
    </Provider>
  );
}

describe('NotificationsList markAsRead', () => {
  beforeEach(() => {
    broadcastMock.mockReset();
    fetchMock.mockReset();
    cachedFetchMock.mockReset();
    fetchMock.mockResolvedValue({
      account: 'alice',
      unread_count: SEED.unread,
      lastread: SEED.lastread,
    });
    cachedFetchMock.mockResolvedValue({ data: [] });
  });

  it('broadcasts setLastRead, applies the local marker and zeroes the badge', async () => {
    broadcastMock.mockResolvedValue({ success: true });
    const store = makeStore();
    store.dispatch(
      receiveUnreadNotifications({ name: 'alice', unreadNotifications: { ...SEED } })
    );

    renderList(store);
    const button = await screen.findByRole('button', { name: 'Mark all as read' });
    expect(button).toBeEnabled();

    // The marker is broadcast-truncated to whole seconds; floor t0 the same
    // way so the comparison cannot race within the current second.
    const t0 = Math.floor(Date.now() / 1000) * 1000;
    fireEvent.click(button);

    // The local read marker lands immediately (no legacy 6s hivemind wait).
    await waitFor(() => {
      const entry = store.getState().global.notifications.alice.unreadNotifications;
      expect(entry?.unread).toBe(0);
      expect(lastreadTimeMs(entry?.lastread)).toBeGreaterThanOrEqual(t0);
    });

    expect(broadcastMock).toHaveBeenCalledTimes(1);
    expect(broadcastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requiredAuths: [],
        requiredPostingAuths: ['alice'],
        id: 'notify',
      })
    );
    const [, payload] = JSON.parse(broadcastMock.mock.calls[0][0].json as string);
    expect(payload).toEqual({ date: expect.any(String) });
    expect(broadcastMock.mock.calls[0][0].json).toContain('setLastRead');

    // Badge (and the mark-all block) disappear once the count hits zero.
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Mark all as read' })).toBeNull()
    );
  });

  it('shows the error and keeps local state when the broadcast fails', async () => {
    broadcastMock.mockRejectedValue(new Error('boom'));
    const store = makeStore();
    store.dispatch(
      receiveUnreadNotifications({ name: 'alice', unreadNotifications: { ...SEED } })
    );

    renderList(store);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Mark all as read' })
    );

    expect(
      await screen.findByText('Failed to mark notifications as read. Please try again.')
    ).toBeInTheDocument();

    // No local marker was applied — the stored pair is untouched.
    expect(store.getState().global.notifications.alice.unreadNotifications).toEqual(SEED);
    expect(broadcastMock).toHaveBeenCalledTimes(1);
  });
});
