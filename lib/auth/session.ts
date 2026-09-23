/**
 * Server-side session management utilities
 * Supports both Redis and JWT-based sessions for distributed deployments
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import * as RedisSession from './redis-session';

const FALLBACK_JWT_SECRET = 'your-secret-key-change-in-production';

const MIN_JWT_SECRET_BYTES = 32;

/**
 * Fail closed when JWT_SECRET is missing, still the shipped placeholder, or
 * shorter than 32 bytes — in ANY environment, not just production (audit
 * N-04). A deployment without a strong secret lets anyone mint session
 * cookies, including a forged loginChallenge that defeats the login
 * challenge check. Redis-backed deployments are not exempt: verifySession
 * falls through to JWT verification, so a JWT forged with a known secret is
 * accepted even when Redis sessions are in use.
 *
 * Called by session creation/verification, not at module load, so static
 * prerendering at build time (where env is absent) never trips it.
 */
function assertJwtSecretConfigured(): void {
  const raw = process.env.JWT_SECRET;
  if (!raw) {
    throw new Error(
      'JWT_SECRET is not configured. Generate a strong random secret (openssl rand -hex 32) and set it as JWT_SECRET; session endpoints fail closed without it.'
    );
  }
  if (raw === FALLBACK_JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is set to the insecure placeholder value. Generate a strong random secret (openssl rand -hex 32) and set it as JWT_SECRET.'
    );
  }
  const byteLength = new TextEncoder().encode(raw).byteLength;
  if (byteLength < MIN_JWT_SECRET_BYTES) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_BYTES} bytes (got ${byteLength}). Generate a strong random secret (openssl rand -hex 32) and set it as JWT_SECRET.`
    );
  }
}

/**
 * Resolve the JWT signing secret at call time (env may be absent at module
 * load, e.g. during static prerender). Asserts the configuration first so an
 * unusable secret can never sign or verify a token.
 */
function getJwtSecret(): Uint8Array {
  assertJwtSecretConfigured();
  return new TextEncoder().encode(process.env.JWT_SECRET as string);
}

/**
 * Whether a session token is a Redis session id (short lowercase hex)
 * rather than a signed JWT. Mirrors the dispatch in verifySession.
 */
function isRedisSessionId(token: string): boolean {
  return token.length <= 32 && /^[a-f0-9]+$/.test(token);
}

export const COOKIE_NAME = 'steem-session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

/**
 * Session TTL class (audit N-08).
 *
 * 'challenge' sessions are anonymous (no username, at most a loginChallenge
 * awaiting a signature). The challenge is only valid for ~5 minutes, yet
 * cookie-less hits on /api/auth/challenge and /api/auth/session used to mint
 * 30-day Redis sessions that anyone could pile up linearly. They now expire
 * after 10 minutes (login window x2 headroom), so an unauthenticated visitor
 * can hold at most a sliding 10-minute session instead of a 30-day one.
 *
 * 'persistent' sessions (any logged-in session) keep the 30-day TTL.
 *
 * DESIGN: the class is an explicit field stored in the session data, but it
 * is always DERIVED (username present => 'persistent', otherwise
 * 'challenge' — see resolveTtlClass). Deriving on every write is what keeps
 * rewrites honest: RedisSession.storeSession/updateSession both default to
 * the 30-day TTL, so updateSession passes the resolved class's TTL
 * explicitly instead of letting the default reset a challenge session's
 * clock. Trade-off worth noting: the anonymous-visit counters
 * (lastVisit/newVisit) only track within that 10-minute window; nothing else
 * consumes anonymous sessions.
 *
 * The cookie maxAge stays 30 days for both classes — a stale cookie pointing
 * at an expired challenge session simply triggers a fresh anonymous session.
 */
export type SessionTtlClass = 'challenge' | 'persistent';

/** TTL for challenge-only (anonymous) sessions: 10 minutes. */
export const CHALLENGE_SESSION_TTL_SEC = 600;
/** TTL for logged-in sessions: 30 days (matches redis-session default). */
export const PERSISTENT_SESSION_TTL_SEC = 2592000;

function ttlSecondsForClass(ttlClass: SessionTtlClass): number {
  return ttlClass === 'challenge'
    ? CHALLENGE_SESSION_TTL_SEC
    : PERSISTENT_SESSION_TTL_SEC;
}

/**
 * Resolve a session's TTL class from its data. Username presence is the
 * single, total discriminator: a logged-in session is persistent, everything
 * else (challenge holders, anonymous visitor sessions, post-logout sessions)
 * is challenge-class. The stored ttlClass marker is therefore informational
 * (observability + carried through rewrites) — nothing can promote an
 * anonymous session to persistent, which in particular keeps a logged-in
 * session's marker from leaking past logoutUser.
 */
function resolveTtlClass(data: Partial<SessionData>): SessionTtlClass {
  return data.username ? 'persistent' : 'challenge';
}

export interface SessionData {
  username?: string;
  uid: string;
  loginChallenge?: string;
  /** Internal TTL class marker (audit N-08); see SessionTtlClass. */
  ttlClass?: SessionTtlClass;
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
  assertJwtSecretConfigured();
  const now = Math.floor(Date.now() / 1000);
  const ttlClass = resolveTtlClass(data);

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
    // Authoritative and placed after the spread: the derived class always
    // wins, and an explicit `ttlClass: undefined` input cannot unset it.
    ttlClass,
  };

  // Try Redis first. Challenge-only sessions get the short TTL so anonymous
  // hits cannot pile up 30-day keys (audit N-08).
  if (RedisSession.isRedisAvailable()) {
    const sessionId = generateUID();
    const stored = await RedisSession.storeSession(
      sessionId,
      sessionData,
      ttlSecondsForClass(ttlClass)
    );
    if (stored) {
      return sessionId; // Return session ID for Redis-based sessions
    }
  }

  // Fallback to JWT. The per-class expiration keeps the same property for
  // stateless tokens: an unauthenticated visitor's token is worthless after
  // 10 minutes, while login sessions still last 30 days.
  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSecondsForClass(ttlClass)}s`)
    .sign(getJwtSecret());

  return token;
}

/**
 * Verify and decode session token
 * Handles both Redis session IDs and JWT tokens
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  assertJwtSecretConfigured();
  // Try Redis first (session IDs are typically shorter and hex-only)
  if (RedisSession.isRedisAvailable() && isRedisSessionId(token)) {
    const sessionData = await RedisSession.getSession(token);
    if (sessionData) {
      return sessionData;
    }
  }

  // Fallback to JWT verification
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
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

  // Preserve the session's TTL class across rewrites (audit N-08): a
  // challenge-only session must not have its TTL reset to the 30-day default
  // on every touch, and a logged-in session must not be shortened. Resolving
  // from the merged data keeps username presence authoritative.
  const ttlClass: SessionTtlClass = resolveTtlClass({
    ...currentSession,
    ...updates,
  });

  const updatedSession: SessionData = {
    ...currentSession,
    ...updates,
    ttlClass,
    lastVisit: now,
    newVisit: now - lastVisit > 1800, // 30 minutes
  };

  // Try to update existing Redis session if we have a session ID. The TTL is
  // passed explicitly — RedisSession.updateSession would otherwise rewrite
  // the key with the 30-day default.
  if (currentToken && RedisSession.isRedisAvailable() && isRedisSessionId(currentToken)) {
    const updated = await RedisSession.updateSession(
      currentToken,
      updatedSession,
      ttlSecondsForClass(ttlClass)
    );
    if (updated) {
      return currentToken; // Keep the same session ID
    }
  }

  // Create new session (Redis or JWT) — updatedSession carries ttlClass, so
  // createSession re-derives the same class and TTL.
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

  // The login challenge is single-use: never carry it into the session
  // produced by a successful login (replay resistance). The new session's
  // TTL class is re-derived as 'persistent' from the now-present username.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { loginChallenge, ...sessionWithoutChallenge } = sessionData;

  return createSession({
    ...sessionWithoutChallenge,
    username,
  });
}

/**
 * Logout user (remove username from session)
 */
export async function logoutUser(currentSession: SessionData): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username, ...sessionWithoutUser } = currentSession;
  // The post-logout session is anonymous, so resolveTtlClass lands it back in
  // the short 'challenge' class (audit N-08) — the logged-in session's
  // 'persistent' marker does not survive the username removal.
  return createSession({
    ...sessionWithoutUser,
    loginChallenge: generateLoginChallenge(), // Generate new challenge
  });
}

/**
 * Best-effort server-side revocation of a session token (audit N-05/N-12).
 *
 * Callers hand over the superseded token when a session is rotated or
 * destroyed — on logout and on successful login — so the old token cannot
 * be replayed after the cookie has been replaced.
 *
 * Only Redis session ids can be revoked: `RedisSession.deleteSession`
 * removes the backing key, so the token becomes useless immediately (and
 * does not linger for its 30-day TTL). Stateless JWT fallback tokens cannot
 * be revoked — they remain valid until their `exp` — which is the documented
 * limitation of the JWT-only mode; production deployments should configure
 * Redis (`REDIS_URL`) to get real revocation.
 *
 * Never throws: revocation must not break the logout/login flow when Redis
 * is unconfigured (deleteSession is a safe no-op) or temporarily failing.
 */
export async function revokeSession(token: string | null | undefined): Promise<void> {
  if (!token || !isRedisSessionId(token)) {
    // Absent, or a stateless JWT token: nothing to delete server-side.
    return;
  }
  try {
    await RedisSession.deleteSession(token);
  } catch (error) {
    console.error('Failed to revoke session:', error);
  }
}
