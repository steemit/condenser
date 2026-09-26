import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/steem/client', () => ({
  callBridge: vi.fn(),
}));

import { GET } from '@/app/api/steem/notices/route';
import { callBridge } from '@/lib/steem/client';

const callBridgeMock = vi.mocked(callBridge);

describe('GET /api/steem/notices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns the notices wrapped as {data}', async () => {
    callBridgeMock.mockResolvedValue([{ status: 1, body: { en: 'hi' } }]);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: [{ status: 1, body: { en: 'hi' } }],
    });
    expect(callBridgeMock).toHaveBeenCalledWith(
      'get_notices',
      { limit: 1 },
      'turtle.'
    );
  });

  it('maps a null RPC result to an empty list', async () => {
    callBridgeMock.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [] });
  });

  it('answers 500 {error} on RPC failure instead of empty data', async () => {
    callBridgeMock.mockRejectedValue(new Error('turtle plugin missing'));

    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch notices' });
  });
});
