import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import NotificationBadge from '@/components/elements/NotificationBadge';
import { receiveUnreadNotifications } from '@/store/slices/globalSlice';
import globalReducer from '@/store/slices/globalSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';
import { fetchUnreadNotificationsCount } from '@/lib/api/steem';

// The badge owns no fetch of its own — the shared hook polls through this
// client. Mock it so the store drives the render.
vi.mock('@/lib/api/steem', () => ({
  fetchUnreadNotificationsCount: vi.fn(),
}));

const fetchMock = fetchUnreadNotificationsCount as unknown as Mock;

function makeStore() {
  return configureStore({ reducer: { global: globalReducer } });
}

function renderBadge(store: ReturnType<typeof makeStore>, props: { showZero?: boolean } = {}) {
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <NotificationBadge username="alice" {...props} />
      </IntlWrapper>
    </Provider>
  );
}

describe('NotificationBadge (Redux single source of truth, T16)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('renders the unread count stored in Redux', () => {
    const store = makeStore();
    store.dispatch(
      receiveUnreadNotifications({
        name: 'alice',
        unreadNotifications: { lastread: '2026-09-26 09:00:00', unread: 5 },
      })
    );

    renderBadge(store);

    expect(screen.getByTitle('5 unread notifications').textContent).toBe('5');
  });

  it('renders nothing while the count is zero', () => {
    const store = makeStore();

    const { container } = renderBadge(store);

    expect(container.querySelector('span')).toBeNull();
  });

  it('renders the count with showZero when there is nothing unread', () => {
    const store = makeStore();

    renderBadge(store, { showZero: true });

    expect(screen.getByTitle('0 unread notifications').textContent).toBe('0');
  });

  it('caps the visible count at 99+', () => {
    const store = makeStore();
    store.dispatch(
      receiveUnreadNotifications({
        name: 'alice',
        unreadNotifications: { lastread: '2026-09-26 09:00:00', unread: 250 },
      })
    );

    renderBadge(store);

    expect(screen.getByTitle('250 unread notifications').textContent).toBe('99+');
  });

  it('updates when the store changes (mark-read zeroes it)', () => {
    const store = makeStore();
    store.dispatch(
      receiveUnreadNotifications({
        name: 'alice',
        unreadNotifications: { lastread: '2026-09-26 09:00:00', unread: 4 },
      })
    );

    const { container } = renderBadge(store);
    expect(container.querySelector('span')).not.toBeNull();

    act(() => {
      store.dispatch(
        receiveUnreadNotifications({
          name: 'alice',
          unreadNotifications: { lastread: '2026-09-26T10:00:00', unread: 0 },
        })
      );
    });

    expect(container.querySelector('span')).toBeNull();
  });
});
