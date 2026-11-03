import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IntlWrapper } from '@/__tests__/helpers/i18n';

const pushMock = vi.fn();
const replaceMock = vi.fn();
// notFound() must throw a recognizable error so the page test can assert
// the missing-post path without a real Next.js runtime.
const NOT_FOUND_ERROR = Symbol('NEXT_NOT_FOUND');
const notFoundMock = vi.fn(() => {
  throw NOT_FOUND_ERROR;
});
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => '/steem/@alice/my-post',
  notFound: () => notFoundMock(),
}));

const getDiscussionMock = vi.fn();
vi.mock('@/lib/steem/client', () => ({
  getDiscussion: (...args: unknown[]) => getDiscussionMock(...args),
}));

// The client shell is exercised by its own fetch behaviour elsewhere; here
// only "did the server render it" matters, so stub it.
vi.mock(
  '@/app/(main)/post/[category]/[username]/[permlink]/PostPageClient',
  () => ({
    default: () => <div data-testid="post-page-client" />,
  })
);

import PostPage, {
  generateMetadata,
} from '@/app/(main)/post/[category]/[username]/[permlink]/page';

function pageParams(category: string, username: string, permlink: string) {
  return Promise.resolve({ category, username, permlink });
}

describe('PostPage (server shell decides 404 vs client fetch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it('renders the client shell when the discussion contains the post', async () => {
    getDiscussionMock.mockResolvedValue({
      'alice/my-post': { author: 'alice', category: 'steem' },
    });
    const element = await PostPage({
      params: pageParams('steem', '@alice', 'my-post'),
    });
    render(<IntlWrapper>{element}</IntlWrapper>);
    expect(notFoundMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('post-page-client')).toBeTruthy();
  });

  it('looks the discussion up under the normalized username', async () => {
    getDiscussionMock.mockResolvedValue({
      'alice/my-post': { author: 'alice' },
    });
    await PostPage({ params: pageParams('steem', '@alice', 'my-post') });
    expect(getDiscussionMock).toHaveBeenCalledWith({
      author: 'alice',
      permlink: 'my-post',
    });
  });

  it('throws notFound() when the discussion has no such post', async () => {
    getDiscussionMock.mockResolvedValue({});
    await expect(
      PostPage({ params: pageParams('steem', 'alice', 'missing-post') })
    ).rejects.toBe(NOT_FOUND_ERROR);
  });

  it('throws notFound() when the discussion is null', async () => {
    getDiscussionMock.mockResolvedValue(null);
    await expect(
      PostPage({ params: pageParams('steem', 'alice', 'missing-post') })
    ).rejects.toBe(NOT_FOUND_ERROR);
  });

  it('throws notFound() when the post entry carries no author', async () => {
    // generateMetadata treats an author-less entry as a missing post; the
    // existence check must not be looser than that.
    getDiscussionMock.mockResolvedValue({ 'alice/my-post': {} });
    await expect(
      PostPage({ params: pageParams('steem', 'alice', 'my-post') })
    ).rejects.toBe(NOT_FOUND_ERROR);
  });

  it('falls back to the client shell when the RPC throws', async () => {
    getDiscussionMock.mockRejectedValue(new Error('rpc down'));
    const element = await PostPage({
      params: pageParams('steem', 'alice', 'my-post'),
    });
    expect(notFoundMock).not.toHaveBeenCalled();
    render(<IntlWrapper>{element}</IntlWrapper>);
    expect(screen.getByTestId('post-page-client')).toBeTruthy();
  });
});

describe('PostPage generateMetadata (degrades, never 500s)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the bare title when the post is missing', async () => {
    getDiscussionMock.mockResolvedValue({});
    const metadata = await generateMetadata({
      params: pageParams('steem', 'alice', 'missing-post'),
    });
    expect(metadata).toEqual({ title: 'Steemit' });
  });

  it('returns the bare title when the RPC throws', async () => {
    getDiscussionMock.mockRejectedValue(new Error('rpc down'));
    const metadata = await generateMetadata({
      params: pageParams('steem', 'alice', 'my-post'),
    });
    expect(metadata).toEqual({ title: 'Steemit' });
  });
});
