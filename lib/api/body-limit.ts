/**
 * POST body size cap (audit N-08).
 *
 * Next.js Route Handlers have NO built-in request-body size limit — an
 * unbounded `request.json()` buffers whatever the client sends into memory.
 * Every POST route therefore funnels its body through this module:
 *
 * - `Content-Length` above the cap is rejected immediately (413) without
 *   reading a byte.
 * - Requests without Content-Length (chunked transfer encoding — the header
 *   is optional and client-controlled, so it can lie or be absent) are
 *   enforced by actually reading the stream and stopping after cap+1 bytes.
 *   The stream-level cap is authoritative: even a lying Content-Length under
 *   the cap cannot smuggle a larger body past it.
 *
 * Bodies within the cap are returned buffered, so routes parse the buffer
 * instead of calling request.json() again (the stream can only be read once).
 * 64KB is far above every legitimate payload these routes accept (login
 * signatures, signed transactions, search queries, small preference blobs)
 * and far below anything that could pressure memory.
 */

import { NextResponse } from 'next/server';

/** Maximum accepted POST body size (64KB). */
export const MAX_BODY_BYTES = 64 * 1024;

const BODY_TOO_LARGE_ERROR = 'Request body too large';

export type BodyLimitResult =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; response: NextResponse };

function tooLarge(): BodyLimitResult {
  return {
    ok: false,
    response: NextResponse.json(
      { error: BODY_TOO_LARGE_ERROR },
      { status: 413 }
    ),
  };
}

/**
 * Read the request body enforcing MAX_BODY_BYTES.
 *
 * Returns the buffered bytes on success, or a ready-to-return 413 response.
 * Never throws for size violations; JSON parsing is NOT done here.
 */
export async function enforceBodyLimit(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES
): Promise<BodyLimitResult> {
  // Fast path: trust-but-verify. An over-limit declared length is rejected
  // without touching the stream.
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return tooLarge();
  }

  // Slow path: read the actual bytes, stopping as soon as the cap is exceeded
  // (one extra byte is read to detect "strictly greater" without ambiguity).
  const reader = request.body?.getReader();
  if (!reader) {
    return { ok: true, bytes: new Uint8Array(0) };
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.length === 0) continue;
      total += value.length;
      if (total > maxBytes) {
        // Stop consuming — the request is rejected, drain the rest is pointless.
        await reader.cancel().catch(() => {});
        return tooLarge();
      }
      chunks.push(value);
    }
  } catch {
    // Stream read failure (client abort / decode error): surface as a 400
    // rather than letting it fall through to the route's generic 500.
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Failed to read request body' },
        { status: 400 }
      ),
    };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return { ok: true, bytes };
}

export type LimitedJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; response: NextResponse };

/**
 * enforceBodyLimit + JSON.parse for routes whose handler expects a JSON
 * document. Malformed JSON rethrows the SyntaxError so the route's existing
 * catch block keeps its current error handling/shape.
 */
export async function readJsonWithLimit(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES
): Promise<LimitedJsonResult> {
  const limited = await enforceBodyLimit(request, maxBytes);
  if (!limited.ok) {
    return limited;
  }
  // request.json() decodes UTF-8 and parses; mirror that on the buffer.
  const text = new TextDecoder().decode(limited.bytes);
  const data: unknown = JSON.parse(text); // throws SyntaxError on bad JSON
  return { ok: true, data };
}
