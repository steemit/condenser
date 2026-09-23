import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { getCsrfToken, postJsonWithCsrf } from '@/lib/api/csrf';

describe('lib/api/csrf (audit N-22)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    );
    document.cookie = 'steem-csrf=; Max-Age=0';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie = 'steem-csrf=; Max-Age=0';
  });

  it('reads the double-submit token from the cookie jar', () => {
    document.cookie =
      'steem-csrf=abcdef0123456789; path=/';
    expect(getCsrfToken()).toBe('abcdef0123456789');
  });

  it('returns null when no token cookie exists', () => {
    expect(getCsrfToken()).toBeNull();
  });

  it('sends Content-Type + X-CSRF-Token when a token cookie exists', async () => {
    document.cookie = 'steem-csrf=tok123; path=/';

    await postJsonWithCsrf('/api/auth/logout');

    const fetchMock = fetch as unknown as Mock;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/logout');
    expect(init.method).toBe('POST');
    expect(init.headers['X-CSRF-Token']).toBe('tok123');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBeUndefined();
  });

  it('serializes the JSON body', async () => {
    document.cookie = 'steem-csrf=tok123; path=/';

    await postJsonWithCsrf('/api/auth/preferences', { payload: { a: 1 } });

    const init = (fetch as unknown as Mock).mock.calls[0][1];
    expect(init.body).toBe('{"payload":{"a":1}}');
  });

  it('refreshes the session and retries once on 403', async () => {
    const fetchMock = fetch as unknown as Mock;
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 403 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 })) // GET session
      .mockResolvedValueOnce(new Response(null, { status: 200 })); // retry

    const res = await postJsonWithCsrf('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // Second call is the /api/auth/session refresh.
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/session');
    // Third call is the retried POST.
    expect(fetchMock.mock.calls[2][0]).toBe('/api/auth/logout');
    expect(fetchMock.mock.calls[2][1].method).toBe('POST');
  });

  it('does not retry on other statuses', async () => {
    const fetchMock = fetch as unknown as Mock;
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    const res = await postJsonWithCsrf('/api/auth/logout');

    expect(res.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
