import { NextRequest } from 'next/server';

const BASE = 'http://localhost';

/** Build a NextRequest for a GET handler with optional query params. */
export function makeGetRequest(
  path: string,
  query: Record<string, string> = {}
): NextRequest {
  const url = new URL(path, BASE);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

/** Build a NextRequest for a POST handler with a JSON body. */
export function makePostRequest(
  path: string,
  body?: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(new URL(path, BASE), {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Cookie header carrying a session token (see makePostRequest). */
export function sessionCookieHeader(
  token: string,
  name = 'steem-session'
): Record<string, string> {
  return { cookie: `${name}=${token}` };
}

/** Standard CSRF token used in route tests (mirrors the session value). */
export const TEST_CSRF_TOKEN =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

/** X-CSRF-Token header carrying the double-submit token (audit N-22). */
export function csrfHeader(token: string = TEST_CSRF_TOKEN): Record<string, string> {
  return { 'x-csrf-token': token };
}
