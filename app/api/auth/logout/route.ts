/**
 * Authentication API Route: Logout
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  clearSessionCookie,
  COOKIE_NAME,
  getSession,
  logoutUser,
  revokeSession,
  setSessionCookie,
} from '@/lib/auth/session';
import { enforceBodyLimit } from '@/lib/api/body-limit';

export async function POST(request: NextRequest) {
  try {
    // The logout body is ignored, but still enforce the size cap so the
    // endpoint cannot be used as an unbounded-buffer sink (audit N-08).
    const limited = await enforceBodyLimit(request);
    if (!limited.ok) {
      return limited.response;
    }

    const currentSession = await getSession(request);

    if (!currentSession) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Revoke the old server-side session (Redis mode) so the pre-logout
    // token cannot be replayed after the cookie is replaced (audit N-05).
    // Best-effort no-op for stateless JWT tokens.
    await revokeSession(request.cookies.get(COOKIE_NAME)?.value);

    if (currentSession.username) {
      // User was logged in, create session without username
      const sessionToken = await logoutUser(currentSession);
      setSessionCookie(response, sessionToken);
    } else {
      // No user was logged in, just clear the session
      clearSessionCookie(response);
    }

    return response;
  } catch (error: unknown) {
    console.error('Logout error:', error);
    // Raw error only in server logs (above); clients get a generic message
    // (audit N-20: unexpected internals must not reach the response).
    return NextResponse.json(
      { error: 'Logout failed. Please try again.' },
      { status: 500 }
    );
  }
}
