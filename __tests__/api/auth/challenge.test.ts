import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  createSession: vi.fn(),
}));

import { GET } from '@/app/api/auth/challenge/route';
import { createSession } from '@/lib/auth/session';

const createSessionMock = vi.mocked(createSession);

describe('GET /api/auth/challenge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns a 64-hex challenge and a session token', async () => {
    createSessionMock.mockResolvedValue('session-token');

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.challenge).toMatch(/^[0-9a-f]{64}$/);
    expect(body.sessionToken).toBe('session-token');
    expect(createSessionMock).toHaveBeenCalledWith({
      loginChallenge: body.challenge,
    });
  });

  it('returns 500 when session creation fails', async () => {
    createSessionMock.mockRejectedValue(new Error('redis down'));

    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to generate challenge' });
  });
});
