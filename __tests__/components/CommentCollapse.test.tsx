import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import userReducer from '@/store/slices/userSlice';
import globalReducer from '@/store/slices/globalSlice';
import { IntlWrapper } from '@/__tests__/helpers/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/trending',
}));

import Comment from '@/components/cards/Comment';

const baseComment = {
  author: 'alice',
  permlink: 'parent-comment',
  body: 'parent body',
  created: '2026-08-01T00:00:00Z',
  category: 'steem',
  children: 1,
  author_reputation: '1000000',
  active_votes: [],
};

const replyComment = {
  author: 'bob',
  permlink: 'child-comment',
  body: 'child body',
  created: '2026-08-02T00:00:00Z',
  category: 'steem',
  children: 0,
  author_reputation: '1000000',
  active_votes: [],
  parent_author: 'alice',
  parent_permlink: 'parent-comment',
};

function renderComment() {
  const store = configureStore({ reducer: { user: userReducer, global: globalReducer } });
  return render(
    <Provider store={store}>
      <IntlWrapper>
        <Comment
          comment={baseComment as never}
          replies={[replyComment as never]}
        />
      </IntlWrapper>
    </Provider>
  );
}

describe('Comment collapse', () => {
  it('hides nested replies when collapsed (legacy behavior)', () => {
    renderComment();
    // Expanded by default: the reply is visible.
    expect(screen.getByText('child body')).toBeTruthy();

    fireEvent.click(screen.getAllByTitle('Collapse')[0]);

    // Collapsed: header shows the reply count, reply subtree is gone.
    expect(screen.queryByText('child body')).toBeNull();
    expect(screen.getByText(/1\s+reply/)).toBeTruthy();

    // Expand again restores the reply.
    fireEvent.click(screen.getByTitle('Expand'));
    expect(screen.getByText('child body')).toBeTruthy();
  });
});
