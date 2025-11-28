/**
 * Auth API Route: Get Login Challenge
 * GET /api/auth/challenge
 * 
 * Returns a random challenge string for signature-based authentication
 */

import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';

/**
 * Generate a secure random challenge
 */
function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function GET() {
  try {
    const challenge = generateChallenge();
    
    // Create a temporary session with the challenge
    // This will be used to verify the signature later
    const sessionToken = await createSession({
      loginChallenge: challenge,
    });

    return NextResponse.json({ 
      challenge,
      sessionToken, // Client needs this to maintain challenge context
    });
  } catch (error: any) {
    console.error('Error generating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}
