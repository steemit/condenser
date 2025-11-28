/**
 * Server-side session management utilities
 * Supports both Redis and JWT-based sessions for distributed deployments
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import * as RedisSession from './redis-session';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const COOKIE_NAME = 'steem-session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

export interface SessionData {
  username?: string;
  uid: string;
  loginChallenge?: string;
  lastVisit: number;
  newVisit: boolean;
  userPreferences?: {
    locale?: string;
    nsfwPref?: string;
    [key: string]: string | number | boolean | undefined;
  };
  // JWT standard claims
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Generate a secure random UID
 */
function generateUID(): string {
  const array = new Uint8Array(13);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a login challenge
 */
function generateLoginChallenge(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a new session
 * Uses Redis if available, otherwise falls back to JWT
 */
export async function createSession(data: Partial<SessionData> = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const sessionData: SessionData = {
    uid: generateUID(),
    loginChallenge: generateLoginChallenge(),
    lastVisit: now,
    newVisit: true,
    userPreferences: {
      locale: 'en',
      nsfwPref: 'warn',
    },
    ...data,
  };

  // Try Redis first
  if (RedisSession.isRedisAvailable()) {
    const sessionId = generateUID();
    const stored = await RedisSession.storeSession(sessionId, sessionData);
    if (stored) {
      return sessionId; // Return session ID for Redis-based sessions
    }
  }

  // Fallback to JWT
  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode session token
 * Handles both Redis session IDs and JWT tokens
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  // Try Redis first (session IDs are typically shorter and hex-only)
  if (RedisSession.isRedisAvailable() && token.length <= 32 && /^[a-f0-9]+$/.test(token)) {
    const sessionData = await RedisSession.getSession(token);
    if (sessionData) {
      return sessionData;
    }
  }

  // Fallback to JWT verification
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

/**
 * Get session from request
 */
export async function getSession(request: NextRequest): Promise<SessionData | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Get session from cookies (for server components)
 */
export async function getServerSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Update session data
 * Handles both Redis and JWT sessions
 */
export async function updateSession(
  currentSession: SessionData,
  updates: Partial<SessionData>,
  currentToken?: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const lastVisit = currentSession.lastVisit;
  
  const updatedSession: SessionData = {
    ...currentSession,
    ...updates,
    lastVisit: now,
    newVisit: now - lastVisit > 1800, // 30 minutes
  };

  // Try to update existing Redis session if we have a session ID
  if (currentToken && RedisSession.isRedisAvailable() && currentToken.length <= 32 && /^[a-f0-9]+$/.test(currentToken)) {
    const updated = await RedisSession.updateSession(currentToken, updatedSession);
    if (updated) {
      return currentToken; // Keep the same session ID
    }
  }

  // Create new session (Redis or JWT)
  return createSession(updatedSession);
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}

/**
 * Middleware helper to handle session
 */
export async function withSession(
  request: NextRequest,
  handler: (session: SessionData | null) => Promise<NextResponse>
): Promise<NextResponse> {
  let session = await getSession(request);
  
  // Create new session if none exists
  if (!session) {
    const token = await createSession();
    session = await verifySession(token);
    
    const response = await handler(session);
    if (session) {
      setSessionCookie(response, token);
    }
    return response;
  }

  // Update existing session
  const updatedToken = await updateSession(session, {});
  const updatedSession = await verifySession(updatedToken);
  
  const response = await handler(updatedSession);
  setSessionCookie(response, updatedToken);
  
  return response;
}

/**
 * Login user (set username in session)
 */
export async function loginUser(
  currentSession: SessionData | null,
  username: string
): Promise<string> {
  const sessionData = currentSession || {
    uid: generateUID(),
    loginChallenge: generateLoginChallenge(),
    lastVisit: Math.floor(Date.now() / 1000),
    newVisit: true,
    userPreferences: {
      locale: 'en',
      nsfwPref: 'warn',
    },
  };

  return createSession({
    ...sessionData,
    username,
  });
}

/**
 * Logout user (remove username from session)
 */
export async function logoutUser(currentSession: SessionData): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username, ...sessionWithoutUser } = currentSession;
  return createSession({
    ...sessionWithoutUser,
    loginChallenge: generateLoginChallenge(), // Generate new challenge
  });
}
