import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { ReactNode } from 'react';

import PostEditor, { PostEditorResult } from '@/components/elements/PostEditor';
import { broadcastComment } from '@/lib/api/broadcast';
import userReducer, { setUser } from '@/store/slices/userSlice';

vi.mock('@/lib/api/broadcast', () => ({
  broadcastComment: vi.fn(),
}));

const broadcastCommentMock = broadcastComment as Mock;

function makeStore() {
  return configureStore({ reducer: { user: userReducer } });
}

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('PostEditor', () => {
  // vitest.config.ts does not enable globals, so RTL auto-cleanup never runs.
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Story permlinks are checked against the chain; default to "not taken".
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );
  });

  it('prompts login and does not broadcast when logged out', async () => {
    const store = makeStore();
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <PostEditor
        type="submit_comment"
        parentAuthor="bob"
        parentPermlink="bob-post"
        onSuccess={onSuccess}
      />,
      { wrapper: wrapper(store) }
    );

    await user.type(screen.getByPlaceholderText('Write your story...'), 'hi');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Please log in to post.')).toBeInTheDocument();
    expect(store.getState().user.show_login_modal).toBe(true);
    expect(broadcastCommentMock).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('broadcasts a story client-side and reports the result', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    broadcastCommentMock.mockResolvedValue({
      success: true,
      result: {},
      transactionId: 'tx123',
      permlink: 'my-test-post',
    });

    render(<PostEditor type="submit_story" onSuccess={onSuccess} />, {
      wrapper: wrapper(store),
    });

    await user.type(screen.getByPlaceholderText('Title'), 'My Test Post');
    await user.type(
      screen.getByPlaceholderText('Write your story...'),
      'Hello #steem world'
    );
    await user.type(
      screen.getByPlaceholderText(/Add up to 8 tags/),
      'test{Enter}'
    );
    await user.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(broadcastCommentMock).toHaveBeenCalledTimes(1);
    const args = broadcastCommentMock.mock.calls[0][0];
    expect(args).toMatchObject({
      parentAuthor: '',
      parentPermlink: 'test', // first tag is the category
      author: 'alice',
      permlink: 'my-test-post', // slugified title
      title: 'My Test Post',
      body: 'Hello #steem world',
    });
    const meta = JSON.parse(args.jsonMetadata);
    expect(meta.tags).toContain('test');
    expect(meta.tags).toContain('steem'); // hashtag extracted from the body
    expect(meta.app).toBe('condenser/0.1');
    expect(meta.format).toBe('markdown');

    const result: PostEditorResult = onSuccess.mock.calls[0][0];
    expect(result).toMatchObject({
      category: 'test',
      author: 'alice',
      permlink: 'my-test-post',
      parentAuthor: '',
      parentPermlink: 'test',
      transactionId: 'tx123',
    });

    // Draft cleared after success.
    expect(localStorage.getItem('replyEditorData-submit')).toBeNull();
  });

  it('broadcasts a comment with the parent wired through and a base36 permlink', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    broadcastCommentMock.mockResolvedValue({ success: true, result: {} });

    render(
      <PostEditor
        type="submit_comment"
        parentAuthor="bob"
        parentPermlink="bob-post"
        onSuccess={onSuccess}
      />,
      { wrapper: wrapper(store) }
    );

    await user.type(
      screen.getByPlaceholderText('Write your story...'),
      'nice post @bob'
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    const args = broadcastCommentMock.mock.calls[0][0];
    expect(args.parentAuthor).toBe('bob');
    expect(args.parentPermlink).toBe('bob-post');
    expect(args.author).toBe('alice');
    expect(args.title).toBe('');
    expect(args.permlink).toMatch(/^[a-z0-9]+$/);
    const meta = JSON.parse(args.jsonMetadata);
    expect(meta.users).toContain('bob'); // mention extracted from the body
    expect(meta.app).toBe('condenser/0.1');
    expect(meta.format).toBeUndefined(); // format is story-only (legacy)

    const result: PostEditorResult = onSuccess.mock.calls[0][0];
    expect(result.category).toBeUndefined();
    expect(result.parentAuthor).toBe('bob');
    expect(result.parentPermlink).toBe('bob-post');
  });

  it('surfaces an expired signing key and re-prompts login', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    broadcastCommentMock.mockRejectedValue(
      new Error('Private key not available. Please login again.')
    );

    render(
      <PostEditor
        type="submit_comment"
        parentAuthor="bob"
        parentPermlink="bob-post"
        onSuccess={onSuccess}
      />,
      { wrapper: wrapper(store) }
    );

    await user.type(screen.getByPlaceholderText('Write your story...'), 'hi');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText(
        'Your signing key has expired. Please log in again to post.'
      )
    ).toBeInTheDocument();
    expect(store.getState().user.show_login_modal).toBe(true);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('rejects comment bodies over the 16KB legacy limit', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();
    broadcastCommentMock.mockResolvedValue({ success: true, result: {} });

    render(
      <PostEditor
        type="submit_comment"
        parentAuthor="bob"
        parentPermlink="bob-post"
        body={'x'.repeat(16 * 1024)}
      />,
      { wrapper: wrapper(store) }
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText(`Post body exceeds ${16 * 1024 - 256} bytes.`)
    ).toBeInTheDocument();
    expect(broadcastCommentMock).not.toHaveBeenCalled();
  });

  it('shows the payout selector and beneficiaries editor only for stories', () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));

    const { unmount } = render(
      <PostEditor
        type="submit_comment"
        parentAuthor="bob"
        parentPermlink="bob-post"
      />,
      { wrapper: wrapper(store) }
    );
    expect(screen.queryByLabelText('Author rewards')).toBeNull();
    expect(screen.queryByText('Add account')).toBeNull();
    unmount();

    render(<PostEditor type="submit_story" />, { wrapper: wrapper(store) });
    expect(screen.getByLabelText('Author rewards')).toHaveValue('50%');
    expect(screen.getByText('Add account')).toBeInTheDocument();
  });

  it('rejects an invalid beneficiary account and does not broadcast', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();

    render(<PostEditor type="submit_story" />, { wrapper: wrapper(store) });

    await user.type(screen.getByPlaceholderText('Title'), 'My Post');
    await user.type(screen.getByPlaceholderText('Write your story...'), 'body');
    await user.type(screen.getByPlaceholderText(/Add up to 8 tags/), 'test{Enter}');
    await user.click(screen.getByText('Add account'));
    await user.type(screen.getByLabelText('Beneficiary account 1'), '1bad');
    await user.type(screen.getByLabelText('Beneficiary percent 1'), '10');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(
      await screen.findByText('Each account segment should start with a letter.')
    ).toBeInTheDocument();
    expect(broadcastCommentMock).not.toHaveBeenCalled();
  });

  it('rejects beneficiary totals over 100 percent', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();

    render(<PostEditor type="submit_story" />, { wrapper: wrapper(store) });

    await user.type(screen.getByPlaceholderText('Title'), 'My Post');
    await user.type(screen.getByPlaceholderText('Write your story...'), 'body');
    await user.type(screen.getByPlaceholderText(/Add up to 8 tags/), 'test{Enter}');
    await user.click(screen.getByText('Add account'));
    await user.click(screen.getByText('Add account'));
    await user.type(screen.getByLabelText('Beneficiary account 1'), 'bob');
    await user.type(screen.getByLabelText('Beneficiary percent 1'), '60');
    await user.type(screen.getByLabelText('Beneficiary account 2'), 'carol');
    await user.type(screen.getByLabelText('Beneficiary percent 2'), '50');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(
      await screen.findByText('Beneficiary total percentage must be less than 100')
    ).toBeInTheDocument();
    expect(broadcastCommentMock).not.toHaveBeenCalled();
  });

  it('passes sorted beneficiaries and the payout override to broadcastComment', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    broadcastCommentMock.mockResolvedValue({ success: true, result: {} });

    render(<PostEditor type="submit_story" onSuccess={onSuccess} />, {
      wrapper: wrapper(store),
    });

    await user.type(screen.getByPlaceholderText('Title'), 'My Post');
    await user.type(screen.getByPlaceholderText('Write your story...'), 'body');
    await user.type(screen.getByPlaceholderText(/Add up to 8 tags/), 'test{Enter}');
    await user.selectOptions(screen.getByLabelText('Author rewards'), '100%');
    await user.click(screen.getByText('Add account'));
    await user.click(screen.getByText('Add account'));
    await user.type(screen.getByLabelText('Beneficiary account 1'), 'charlie');
    await user.type(screen.getByLabelText('Beneficiary percent 1'), '10');
    await user.type(screen.getByLabelText('Beneficiary account 2'), 'bob');
    await user.type(screen.getByLabelText('Beneficiary percent 2'), '5');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    const args = broadcastCommentMock.mock.calls[0][0];
    expect(args.commentOptions).toEqual({
      percentSteemDollars: 0,
      extensions: [
        [
          0,
          {
            beneficiaries: [
              { account: 'bob', weight: 500 },
              { account: 'charlie', weight: 1000 },
            ],
          },
        ],
      ],
    });
  });

  it('omits commentOptions for the default payout without beneficiaries', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    broadcastCommentMock.mockResolvedValue({ success: true, result: {} });

    render(<PostEditor type="submit_story" onSuccess={onSuccess} />, {
      wrapper: wrapper(store),
    });

    await user.type(screen.getByPlaceholderText('Title'), 'My Post');
    await user.type(screen.getByPlaceholderText('Write your story...'), 'body');
    await user.type(screen.getByPlaceholderText(/Add up to 8 tags/), 'test{Enter}');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(broadcastCommentMock.mock.calls[0][0].commentOptions).toBeUndefined();
  });

  it('persists payoutType and beneficiaries in the localStorage draft', async () => {
    const store = makeStore();
    store.dispatch(setUser({ username: 'alice' }));
    const user = userEvent.setup();

    render(<PostEditor type="submit_story" />, { wrapper: wrapper(store) });

    await user.type(screen.getByPlaceholderText('Title'), 'Draft Post');
    await user.selectOptions(screen.getByLabelText('Author rewards'), '0%');
    await user.click(screen.getByText('Add account'));
    await user.type(screen.getByLabelText('Beneficiary account 1'), 'bob');
    await user.type(screen.getByLabelText('Beneficiary percent 1'), '10');

    await waitFor(() => {
      const raw = localStorage.getItem('replyEditorData-submit');
      expect(raw).toBeTruthy();
      const draft = JSON.parse(raw as string);
      expect(draft.payoutType).toBe('0%');
      expect(draft.beneficiaries).toEqual([{ username: 'bob', percent: '10' }]);
    });
  });
});
