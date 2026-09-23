/**
 * CSRF double-submit token helpers (audit N-22).
 *
 * Session-writing routes (login / logout / preferences) require a token that
 * is stored server-side in the session AND mirrored in a non-HttpOnly cookie
 * (`steem-csrf`): the client echoes it back via the `X-CSRF-Token` header
 * and the route requires header === session value. A cross-site attacker
 * can make the browser send cookies but cannot read the cookie value (or
 * set arbitrary same-origin headers), so forged state-changing requests
 * fail with 403.
 *
 * The broadcast relay is intentionally NOT covered: it carries no session
 * (authenticity comes from the client-side signature the chain verifies).
 *
 * This module is deliberately dependency-free (no Redis / jose imports) so
 * route tests exercise the real verification logic.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SessionData } from '@/lib/auth/session';

/** Non-HttpOnly mirror of SessionData.csrfToken (double-submit cookie). */
export const CSRF_COOKIE_NAME = 'steem-csrf';
/** Header the client must echo the token back with. */
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

/** Generate a 256-bit random token, hex-encoded. */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Cookie options: readable by same-origin JS, scoped like the session. */
const CSRF_COOKIE_OPTIONS = {
  httpOnly: false, // double-submit: client JS must be able to read it
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  // No maxAge: it is a session cookie, re-issued with every session write.
};

/** Mirror the session's token into the non-HttpOnly cookie. */
export function setCsrfCookie(
  response: NextResponse,
  session: SessionData | null
): void {
  if (session?.csrfToken) {
    response.cookies.set(CSRF_COOKIE_NAME, session.csrfToken, CSRF_COOKIE_OPTIONS);
  }
}

/** Constant-time string equality (both inputs are hex tokens). */
function tokensMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Enforce the double-submit contract on a session-writing request:
 *  - the X-CSRF-Token header must match the session's csrfToken;
 *  - Content-Type must be application/json (all these routes parse JSON).
 *
 * Returns the rejection response (403 / 415) or null when the request may
 * proceed. A session minted before this rollout has no csrfToken and fails
 * closed — the client helper refreshes via GET /api/auth/session and
 * retries once (lib/api/csrf.ts).
 */
export function enforceCsrf(
  request: NextRequest,
  session: SessionData | null
): NextResponse | null {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const sessionToken = session?.csrfToken;
  if (
    !headerToken ||
    !sessionToken ||
    !tokensMatch(headerToken, sessionToken)
  ) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }
  const contentType = (request.headers.get('content-type') || '')
    .toLowerCase()
    .split(';')[0]
    .trim();
  if (contentType !== 'application/json') {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    );
  }
  return null;
}
