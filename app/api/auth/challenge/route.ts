/**
 * Auth API Route: Get Login Challenge
 * GET /api/auth/challenge
 *
 * Issues a random challenge for signature-based authentication and persists
 * it in the session cookie so /api/auth/login can verify the signed
 * challenge against it (legacy stores login_challenge in the koa session).
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  createSession,
  getSession,
  setSessionCookie,
  updateSession,
  verifySession,
} from '@/lib/auth/session';
import { setCsrfCookie } from '@/lib/auth/csrf';
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';

/**
 * Generate a secure random challenge
 */
function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function GET(request: NextRequest) {
  try {
    // Rate limit first (audit N-08): every cookie-less hit mints a Redis
    // session, so an unbounded flood would write sessions linearly.
    const rateLimit = await checkRateLimit(request, RATE_LIMITS.authChallenge);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const challenge = generateChallenge();

    const existing = await getSession(request);
    const sessionToken = existing
      ? await updateSession(
          existing,
          { loginChallenge: challenge },
          request.cookies.get(COOKIE_NAME)?.value
        )
      : await createSession({ loginChallenge: challenge });
    // For the mint path, decode the fresh session so its CSRF token can be
    // mirrored into the cookie (audit N-22).
    const session = existing ?? (await verifySession(sessionToken));

    const response = NextResponse.json({ challenge });
    setSessionCookie(response, sessionToken);
    // Mirror the CSRF token alongside the challenge session so the login
    // POST can echo it (audit N-22). updateSession preserves the token for
    // existing sessions and backfills pre-rollout ones.
    setCsrfCookie(response, session);
    return response;
  } catch (error: unknown) {
    console.error('Error generating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}
