/**
 * Server-side session management utilities
 * Supports both Redis and JWT-based sessions for distributed deployments
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import * as RedisSession from './redis-session';
import { denylistKeyFor, isJwtRevoked, revokeJwt } from './jwt-denylist';
import { generateCsrfToken, setCsrfCookie } from './csrf';

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
/**
 * TTL for logged-in sessions issued as stateless fallback JWTs: 12 hours
 * (audit CS-01). Redis is down when these are minted, so the revocation
 * denylist can only be honored per-instance — the shorter TTL bounds a
 * leaked fallback token's exposure to half a day even when revocation
 * cannot propagate. The trade-off: a Redis outage longer than 12h logs
 * fallback users out once, which is acceptable next to an unrevokable 30-day
 * credential. Active users are not disturbed: every session-touching request
 * re-signs the fallback JWT (updateSession -> createSession), so the window
 * slides while the token is in use.
 */
export const FALLBACK_PERSISTENT_JWT_TTL_SEC = 43200;

function ttlSecondsForClass(ttlClass: SessionTtlClass): number {
  return ttlClass === 'challenge'
    ? CHALLENGE_SESSION_TTL_SEC
    : PERSISTENT_SESSION_TTL_SEC;
}

/**
 * TTL applied to the JWT fallback token itself. Challenge-class tokens keep
 * the 600s class TTL; persistent-class tokens get the reduced CS-01 TTL
 * above (Redis-backed sessions keep the full 30 days).
 */
function fallbackJwtTtlSecondsForClass(ttlClass: SessionTtlClass): number {
  return ttlClass === 'challenge'
    ? CHALLENGE_SESSION_TTL_SEC
    : FALLBACK_PERSISTENT_JWT_TTL_SEC;
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
  /**
   * CSRF double-submit token (audit N-22): mirrored into the non-HttpOnly
   * `steem-csrf` cookie and required (via the X-CSRF-Token header) by the
   * session-writing routes. Generated at session creation and preserved
   * across rotations; see lib/auth/csrf.ts.
   */
  csrfToken?: string;
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
 * Generate the per-token `jti` for fallback JWTs (audit CS-01). Distinct from
 * the session `uid`, which is deliberately preserved across login/logout
 * rotations — the jti MUST be fresh on every signing so revoking a
 * superseded token never rejects its replacement.
 */
function generateJti(): string {
  const array = new Uint8Array(16);
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
    // Same for the CSRF token: an explicit `csrfToken: undefined` (e.g.
    // spreading a pre-rollout session through loginUser) must re-generate
    // one rather than ship a token-less session (audit N-22).
    csrfToken: (data.csrfToken as string | undefined) || generateCsrfToken(),
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
  // 10 minutes, and logged-in fallback tokens are bounded to the reduced
  // CS-01 TTL (12h, sliding via re-signing) instead of 30 days. The fresh
  // per-token `jti` is what makes these tokens revocable (see revokeSession).
  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setJti(generateJti())
    .setExpirationTime(`${fallbackJwtTtlSecondsForClass(ttlClass)}s`)
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
    // Audit CS-01: a fallback JWT whose revocation key (jti, or the token
    // digest for pre-jti tokens) is denylisted has been logged out
    // server-side — treat it exactly like an expired signature.
    const jti = typeof payload.jti === 'string' ? payload.jti : undefined;
    if (await isJwtRevoked(denylistKeyFor(jti, token))) {
      return null;
    }
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
 *
 * ID invariant (audit CD-02): pass the caller's current token so an existing
 * Redis session is rewritten in place under the SAME id. Only when no usable
 * id is supplied (or the in-place rewrite failed) does this mint a
 * replacement — and that path revokes the superseded Redis id, so a session
 * lineage never leaves more than one live id behind. Rotation with revocation
 * is reserved for login/logout, which both call revokeSession on the
 * superseded token.
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
    // Backfill for sessions minted before the CSRF rollout: every rewrite
    // of the session carries a token (audit N-22).
    csrfToken: currentSession.csrfToken || updates.csrfToken || generateCsrfToken(),
    lastVisit: now,
    newVisit: now - lastVisit > 1800, // 30 minutes
  };

  // Rewrite the existing Redis session in place when we hold its id — the
  // session KEEPS the same id, so at most one live id exists per lineage
  // (audit CD-02). The TTL is passed explicitly — RedisSession.updateSession
  // would otherwise rewrite the key with the 30-day default.
  if (currentToken && RedisSession.isRedisAvailable() && isRedisSessionId(currentToken)) {
    const updated = await RedisSession.updateSession(
      currentToken,
      updatedSession,
      ttlSecondsForClass(ttlClass)
    );
    if (updated) {
      return currentToken; // Keep the same session ID
    }
    // In-place rewrite failed (e.g. the key expired since the read, or Redis
    // hiccuped). The replacement minted below supersedes the old id, so
    // revoke it — otherwise it would linger as a second live credential for
    // its full TTL while logout only revokes the newest cookie (CD-02).
    // Best-effort, like every revocation.
    await revokeSession(currentToken);
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
      // Mirror the CSRF token so the client can echo it on session writes
      // (audit N-22).
      setCsrfCookie(response, session);
    }
    return response;
  }

  // Update existing session. The current cookie token is handed over so the
  // Redis branch rewrites the SAME session id in place (audit CD-02): without
  // it updateSession minted a fresh id on every read while the old key kept
  // living for its full TTL — a leaked older id then survived logout, which
  // only revokes the id in the current cookie.
  const currentToken = request.cookies.get(COOKIE_NAME)?.value;
  const updatedToken = await updateSession(session, {}, currentToken);
  const updatedSession = await verifySession(updatedToken);

  const response = await handler(updatedSession);
  setSessionCookie(response, updatedToken);
  setCsrfCookie(response, updatedSession);

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
 * Best-effort server-side revocation of a session token (audit N-05/N-12,
 * CS-01).
 *
 * Callers hand over the superseded token when a session is rotated or
 * destroyed — on logout and on successful login — so the old token cannot
 * be replayed after the cookie has been replaced.
 *
 * Redis session ids are revoked by deleting the backing key (immediate,
 * cluster-wide). Stateless fallback JWTs are revoked through the jti
 * denylist (lib/auth/jwt-denylist.ts): the entry lives until the token's
 * own `exp`, always in-process and mirrored to Redis when reachable so
 * other instances honor it. Residual: during a full Redis outage in a
 * multi-instance deployment only the instance that served the logout
 * rejects the token — see the denylist module docs.
 *
 * Never throws: revocation must not break the logout/login flow when Redis
 * is unconfigured or temporarily failing.
 */
export async function revokeSession(token: string | null | undefined): Promise<void> {
  if (!token) {
    return;
  }
  if (isRedisSessionId(token)) {
    try {
      await RedisSession.deleteSession(token);
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
    return;
  }
  // Stateless fallback JWT: denylist its revocation key until its exp. The
  // signature is verified first so forged tokens cannot stuff the denylist
  // with attacker-chosen jti values; an unverifiable token cannot pass
  // verifySession either, so there is nothing to revoke.
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const jti = typeof payload.jti === 'string' ? payload.jti : undefined;
    const exp = typeof payload.exp === 'number' ? payload.exp : 0;
    await revokeJwt(denylistKeyFor(jti, token), exp);
  } catch (error) {
    console.error('Failed to revoke fallback JWT session:', error);
  }
}
