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
export function makePostRequest(path: string, body?: unknown): NextRequest {
  return new NextRequest(new URL(path, BASE), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
