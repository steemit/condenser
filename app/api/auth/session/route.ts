/**
 * Authentication API Route: Session
 * GET /api/auth/session - Get current session info
 */

import { NextRequest, NextResponse } from 'next/server';
import { withSession } from '@/lib/auth/session';
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limit first (audit N-08 follow-up): a cookie-less hit mints a
  // session inside withSession, exactly like auth/challenge — creation was
  // otherwise unbounded. 120/min/IP is far above the once-per-page-load
  // pattern of real clients.
  const rateLimit = await checkRateLimit(request, RATE_LIMITS.authSession);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

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
