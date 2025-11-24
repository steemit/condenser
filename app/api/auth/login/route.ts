/**
 * Auth API Route: Login
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, signatures } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual server-side session management
    // For now, just return success
    // In a real implementation, this would:
    // 1. Verify signatures
    // 2. Create server-side session
    // 3. Set session cookie
    // 4. Return session token

    return NextResponse.json({ status: 'ok', username });
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

