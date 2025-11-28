/**
 * Authentication API Route: Logout
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, logoutUser, setSessionCookie, clearSessionCookie } from '@/lib/auth/session';

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

    if (currentSession.username) {
      // User was logged in, create session without username
      const sessionToken = await logoutUser(currentSession);
      setSessionCookie(response, sessionToken);
    } else {
      // No user was logged in, just clear the session
      clearSessionCookie(response);
    }

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
