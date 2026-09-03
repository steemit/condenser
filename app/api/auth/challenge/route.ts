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
} from '@/lib/auth/session';

/**
 * Generate a secure random challenge
 */
function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function GET(request: NextRequest) {
  try {
    const challenge = generateChallenge();

    const existing = await getSession(request);
    const sessionToken = existing
      ? await updateSession(
          existing,
          { loginChallenge: challenge },
          request.cookies.get(COOKIE_NAME)?.value
        )
      : await createSession({ loginChallenge: challenge });

    const response = NextResponse.json({ challenge });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: unknown) {
    console.error('Error generating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}
