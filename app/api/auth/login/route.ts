/**
 * Authentication API Route: Login
 * POST /api/auth/login
 * 
 * Supports signature-based authentication with posting keys only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccount } from '@/lib/steem/client';
import { getSession, loginUser, setSessionCookie, verifySession } from '@/lib/auth/session';
import { Signature, PublicKey } from '@steemit/steem-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, signature, publicKey, data, challenge } = body;

    // Validate required fields
    if (!username || !signature || !publicKey || !data || !challenge) {
      return NextResponse.json(
        { error: 'Missing required fields: username, signature, publicKey, data, challenge' },
        { status: 400 }
      );
    }

    // Step 1: Get account information
    const account = await getAccount(username);
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Step 2: Verify the public key belongs to the account's posting authority
    if (!account.posting || !account.posting.key_auths || account.posting.key_auths.length === 0) {
      return NextResponse.json(
        { error: 'Account has no posting authority' },
        { status: 400 }
      );
    }

    const accountPostingKeys = account.posting.key_auths.map((auth: any) => auth[0]);
    if (!accountPostingKeys.includes(publicKey)) {
      return NextResponse.json(
        { error: 'Public key is not authorized for posting on this account' },
        { status: 401 }
      );
    }

    // Step 3: Verify the challenge matches what we issued
    // For now, we'll skip session-based challenge verification and just verify the signature
    // In production, you'd want to verify the challenge came from our server
    
    // Step 4: Parse and verify the signed data
    let authData;
    try {
      authData = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Verify the data contains required fields
    if (authData.username !== username || authData.challenge !== challenge || authData.action !== 'login') {
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 400 }
      );
    }

    // Step 5: Verify the signature
    try {
      const sig = Signature.fromHex(signature);
      const pubKey = PublicKey.fromString(publicKey);
      const isValidSignature = sig.verifyHash(Buffer.from(data, 'utf8'), pubKey);
      
      if (!isValidSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } catch (error: any) {
      console.error('Signature verification error:', error);
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    // Step 6: Authentication successful, create session
    const currentSession = await getSession(request);
    const sessionToken = await loginUser(currentSession, username);
    
    const response = NextResponse.json({
      success: true,
      status: 'ok',
      user: {
        username,
        posting_authority: true,
        public_key: publicKey,
      },
    });

    // Set session cookie
    setSessionCookie(response, sessionToken);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}