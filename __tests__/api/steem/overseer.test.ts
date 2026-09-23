import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { makePostRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/steem/client', () => ({
  callSteemApi: vi.fn(),
}));

// Partial mock: keep the real RATE_LIMITS / rateLimitResponse, stub only the
// Redis-backed check (audit N-08).
vi.mock('@/lib/cache/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cache/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: vi.fn(async () => ({ allowed: true })),
  };
});

import { POST } from '@/app/api/steem/overseer/route';
import { callSteemApi } from '@/lib/steem/client';
import { checkRateLimit } from '@/lib/cache/rate-limit';

const callSteemApiMock = vi.mocked(callSteemApi);
const checkRateLimitMock = vi.mocked(checkRateLimit);

const PAYLOAD = ['custom', { measurement: 'page_view', tags: {}, fields: {} }];

describe('POST /api/steem/overseer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    callSteemApiMock.mockResolvedValue({});
    checkRateLimitMock.mockResolvedValue({ allowed: true });
  });

  it('relays the parsed payload and answers 204 (best-effort analytics)', async () => {
    const res = await POST(makePostRequest('/api/steem/overseer', PAYLOAD));
    expect(res.status).toBe(204);
    expect(callSteemApiMock).toHaveBeenCalledWith('overseer.collect', PAYLOAD);
  });

  it('still answers 204 when the relay fails', async () => {
    callSteemApiMock.mockRejectedValue(new Error('rpc down'));

    const res = await POST(makePostRequest('/api/steem/overseer', PAYLOAD));
    expect(res.status).toBe(204);
  });

  it('drops malformed JSON payloads with a 204 (never surfaces analytics errors)', async () => {
    const res = await POST(makeRawRequest('not-json'));
    expect(res.status).toBe(204);
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('checks the steem:overseer limit (60/min/IP) before reading the body', async () => {
    await POST(makePostRequest('/api/steem/overseer', PAYLOAD));
    expect(checkRateLimitMock).toHaveBeenCalledWith(expect.anything(), {
      key: 'steem:overseer',
      limit: 60,
      windowSeconds: 60,
    });
  });

  it('returns 429 with Retry-After when limited', async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfterSeconds: 9 });

    const res = await POST(makePostRequest('/api/steem/overseer', PAYLOAD));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('9');
    expect(await res.json()).toEqual({
      error: 'Too many requests. Please try again later.',
    });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('returns 413 when the body exceeds the 64KB cap', async () => {
    const res = await POST(
      makePostRequest('/api/steem/overseer', { blob: 'x'.repeat(70 * 1024) })
    );
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large' });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });
});

/** POST request with a raw (non-JSON) string body. */
function makeRawRequest(body: string) {
  return new NextRequest('http://localhost/api/steem/overseer', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
}
