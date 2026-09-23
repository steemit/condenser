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

export async function POST(request: NextRequest) {
  try {
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
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
