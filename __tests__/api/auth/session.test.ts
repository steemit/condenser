import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { makeGetRequest } from '@/__tests__/helpers/request';

vi.mock('@/lib/auth/session', () => ({
  withSession: vi.fn(),
}));

import { GET } from '@/app/api/auth/session/route';
import { withSession } from '@/lib/auth/session';

const withSessionMock = withSession as unknown as Mock;

/** Drive the mocked withSession so it invokes the handler with a fixed session. */
function givenSession(session: unknown) {
  withSessionMock.mockImplementation((_req: unknown, handler: (s: unknown) => unknown) =>
    handler(session)
  );
}

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports unauthenticated when there is no session', async () => {
    givenSession(null);

    const res = await GET(makeGetRequest('/api/auth/session'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ authenticated: false, session: null });
  });

  it('returns the user for a logged-in session', async () => {
    givenSession({
      username: 'alice',
      uid: 'uid-1',
      lastVisit: 1700000000,
      newVisit: false,
      userPreferences: { locale: 'en' },
    });

    const res = await GET(makeGetRequest('/api/auth/session'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      authenticated: true,
      session: {
        username: 'alice',
        uid: 'uid-1',
        lastVisit: 1700000000,
        newVisit: false,
        userPreferences: { locale: 'en' },
      },
    });
  });

  it('returns an anonymous session shape when no user is logged in', async () => {
    givenSession({ uid: 'uid-2', lastVisit: 1700000000, newVisit: true });

    const res = await GET(makeGetRequest('/api/auth/session'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
    expect(body.session).toEqual({
      username: null,
      uid: 'uid-2',
      lastVisit: 1700000000,
      newVisit: true,
      userPreferences: {},
    });
  });
});
