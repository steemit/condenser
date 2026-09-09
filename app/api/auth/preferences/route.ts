/**
 * Auth API Route: Save User Preferences
 * POST /api/auth/preferences
 *
 * Legacy /api/v1/setUserPreferences: requires a logged-in session, payload
 * capped at 1024 chars (JSON), merged into the session's userPreferences.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  getSession,
  setSessionCookie,
  updateSession,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.username) {
      return NextResponse.json(
        { error: 'missing logged in account' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const payload = body?.payload;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return NextResponse.json(
        { error: 'payload must be a plain object' },
        { status: 400 }
      );
    }
    // Legacy cap: the serialized payload must stay small. Validate the
    // *merged* result too — legacy replaced the stored prefs each save, so
    // the cap bounded the stored state; with a merge, repeated sub-cap
    // payloads would otherwise grow the session unbounded (and past the
    // ~4KB cookie cap on the JWT fallback, silently dropping the session).
    const merged = { ...session.userPreferences, ...payload };
    if (JSON.stringify(merged).length > 1024) {
      return NextResponse.json(
        { error: 'the data is too long' },
        { status: 400 }
      );
    }

    const updatedToken = await updateSession(
      session,
      { userPreferences: merged },
      request.cookies.get(COOKIE_NAME)?.value
    );

    const response = NextResponse.json({ status: 'ok' });
    setSessionCookie(response, updatedToken);
    return response;
  } catch (error: unknown) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
