import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePostRequest, makeRawPostRequest } from '@/__tests__/helpers/request';

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
const AD_PAYLOAD = ['ad', { trackingId: 'x-123456', adTag: 'tron_ad_pc', version: 'next' }];
const ROUTE_PAYLOAD = [
  'custom',
  {
    measurement: 'route',
    tags: { app: 'condenser', version: 'next', tag: 'post' },
    fields: { trackingId: 'x-123', permlink: 'hello-world' },
  },
];

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

  it('relays the ad-view payload shape (recordAdsView)', async () => {
    const res = await POST(makePostRequest('/api/steem/overseer', AD_PAYLOAD));
    expect(res.status).toBe(204);
    expect(callSteemApiMock).toHaveBeenCalledWith('overseer.collect', AD_PAYLOAD);
  });

  it('relays the route-tag payload shape with populated maps', async () => {
    const res = await POST(makePostRequest('/api/steem/overseer', ROUTE_PAYLOAD));
    expect(res.status).toBe(204);
    expect(callSteemApiMock).toHaveBeenCalledWith('overseer.collect', ROUTE_PAYLOAD);
  });

  it.each([
    'not an array',
    ['custom'],
    ['custom', { measurement: 'route' }, 'extra'],
    ['unknown-kind', { measurement: 'route' }],
    ['custom', 'not-an-object'],
    // wrong field shapes
    ['custom', {}],
    ['custom', { measurement: 'Route Tags!' }],
    ['custom', { measurement: 'route', tags: 'nope' }],
    ['custom', { measurement: 'route', fields: { nested: { deep: true } } }],
    ['custom', { measurement: 'route', surprise: 1 }],
    ['custom', { measurement: 'route', fields: { bad$key: 1 } }],
    ['ad', { trackingId: 'x-1', adTag: 'ok', version: 'next', extra: 1 }],
    ['ad', { trackingId: 'x 1', adTag: 'ok', version: 'next' }],
    ['ad', { trackingId: 'x-1', adTag: 'has space', version: 'next' }],
    ['ad', { trackingId: 'x-1', adTag: 'ok' }],
  ])('rejects malformed payload %j with 400 (audit N-25)', async (payload) => {
    const res = await POST(makePostRequest('/api/steem/overseer', payload));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Malformed analytics payload' });
    expect(callSteemApiMock).not.toHaveBeenCalled();
  });

  it('still answers 204 when the relay fails', async () => {
    callSteemApiMock.mockRejectedValue(new Error('rpc down'));

    const res = await POST(makePostRequest('/api/steem/overseer', PAYLOAD));
    expect(res.status).toBe(204);
  });

  it('drops malformed JSON payloads with a 204 (never surfaces analytics errors)', async () => {
    const res = await POST(makeRawPostRequest('/api/steem/overseer', 'not-json'));
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
