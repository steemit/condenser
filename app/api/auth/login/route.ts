/**
 * Authentication API Route: Login
 * POST /api/auth/login
 * 
 * Supports signature-based authentication with posting keys only
 */

import { NextRequest, NextResponse } from 'next/server';
import { callSteemApi, getAccount } from '@/lib/steem/client';
import { getSession, loginUser, setSessionCookie } from '@/lib/auth/session';
// steem.auth.verifySignature() parses the public key and hex signature,
// then runs verifyBuffer (SHA-256 of the raw message) — matching
// steem.auth.sign() on the client. It returns false for malformed input
// instead of throwing.
import { steem } from '@steemit/steem-js';

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

    type AccountPostingAuthority = {
      key_auths?: Array<[string, number]>;
    };
    type AccountWithPosting = {
      posting?: AccountPostingAuthority;
    };
    const accountData = account as AccountWithPosting;

    // Step 2: Verify the public key belongs to the account's posting authority
    if (!accountData.posting || !accountData.posting.key_auths || accountData.posting.key_auths.length === 0) {
      return NextResponse.json(
        { error: 'Account has no posting authority' },
        { status: 400 }
      );
    }

    const accountPostingKeys = accountData.posting.key_auths.map((auth) => auth[0]);
    if (!accountPostingKeys.includes(publicKey)) {
      return NextResponse.json(
        { error: 'Public key is not authorized for posting on this account' },
        { status: 401 }
      );
    }

    // Step 3: Verify the challenge matches the one issued to this session
    // (legacy general.js login_account verifies the signed challenge against
    // session login_challenge — self-minted challenges are rejected).
    const currentSession = await getSession(request);
    if (
      !currentSession?.loginChallenge ||
      currentSession.loginChallenge !== challenge
    ) {
      return NextResponse.json(
        { error: 'Invalid or expired login challenge' },
        { status: 400 }
      );
    }

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

    // Reject stale signatures: the client signs a millisecond timestamp
    // (signAuthData) — accept a 5-minute window plus clock skew.
    const signedAt = Number(authData.timestamp);
    if (
      !Number.isFinite(signedAt) ||
      Math.abs(Date.now() - signedAt) > 5 * 60 * 1000
    ) {
      return NextResponse.json(
        { error: 'Invalid or expired login challenge' },
        { status: 400 }
      );
    }

    // Step 5: Verify the signature
    if (!steem.auth.verifySignature(data, signature, publicKey)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Step 6: Authentication successful, create session
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

    // Login checkpoint (legacy src/server/api/general.js login_account):
    // report the sign-in to overseer. Best-effort — never blocks login.
    callSteemApi('overseer.collect', [
      'custom',
      {
        measurement: 'user_login',
        tags: { entry: 'condenser', version: 'next' },
        fields: { username },
      },
    ]).catch((err) => console.warn('overseer user_login error:', err));

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}