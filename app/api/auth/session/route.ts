/**
 * Authentication API Route: Session
 * GET /api/auth/session - Get current session info
 */

import { NextRequest, NextResponse } from 'next/server';
import { withSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  return withSession(request, async (session) => {
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        session: null,
      });
    }

    return NextResponse.json({
      authenticated: !!session.username,
      session: {
        username: session.username || null,
        uid: session.uid,
        lastVisit: session.lastVisit,
        newVisit: session.newVisit,
        userPreferences: session.userPreferences || {},
      },
    });
  });
}
