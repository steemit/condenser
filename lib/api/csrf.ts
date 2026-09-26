/**
 * Client-side CSRF double-submit helpers (audit N-22).
 *
 * The server stores a per-session token in SessionData.csrfToken and mirrors
 * it into the non-HttpOnly `steem-csrf` cookie (set by /api/auth/challenge,
 * /api/auth/session and every session-writing route). Session-writing POSTs
 * (login / logout / preferences) must echo it back via the X-CSRF-Token
 * header — use postJsonWithCsrf for those calls.
 */

/**
 * Single definition of the double-submit cookie name (#4044 leftover: this
 * was declared both here and in lib/auth/csrf.ts). Declared in this
 * dependency-free client module so the server-side lib/auth/csrf.ts can
 * import it without pulling next/server into the client bundle.
 */
export const CSRF_COOKIE_NAME = 'steem-csrf';

/** Read the double-submit token from the cookie jar (null when absent). */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * POST JSON with the CSRF header.
 *
 * Retries once after refreshing the session when the server answers 403: a
 * session minted before the CSRF rollout (no token stored) or a stale
 * cookie is fixed by GET /api/auth/session, which re-issues both cookies.
 */
export async function postJsonWithCsrf(
  url: string,
  body?: unknown
): Promise<Response> {
  const attempt = (): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = getCsrfToken();
    if (token) headers['X-CSRF-Token'] = token;
    return fetch(url, {
      method: 'POST',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let response = await attempt();
  if (response.status === 403) {
    // Best-effort refresh; the retry fails again if it did not help.
    await fetch('/api/auth/session').catch(() => null);
    response = await attempt();
  }
  return response;
}
