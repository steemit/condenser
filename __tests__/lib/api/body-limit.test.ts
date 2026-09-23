// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  MAX_BODY_BYTES,
  enforceBodyLimit,
  readJsonWithLimit,
} from '@/lib/api/body-limit';

/** POST request whose body is a stream — no Content-Length is derived. */
function chunkedRequest(chunks: string[], headers: Record<string, string> = {}) {
  const encoder = new TextEncoder();
  let i = 0;
  return new Request(
    'http://localhost/api/x',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: new ReadableStream<Uint8Array>({
        pull(controller) {
          if (i < chunks.length) {
            controller.enqueue(encoder.encode(chunks[i++]));
          } else {
            controller.close();
          }
        },
      }),
      // Required by undici when the body is a stream.
      duplex: 'half',
    } as RequestInit
  );
}

describe('lib/api/body-limit', () => {
  describe('enforceBodyLimit (Content-Length fast path)', () => {
    it('rejects a declared length over the cap with 413 without reading the stream', async () => {
      // The stream throws if read — proving the fast path never touches it.
      const request = new Request('http://localhost/api/x', {
        method: 'POST',
        headers: { 'content-length': String(MAX_BODY_BYTES + 1) },
        body: new ReadableStream<Uint8Array>({
          pull() {
            throw new Error('stream must not be read');
          },
        }),
        // Required by undici when the body is a stream.
        duplex: 'half',
      } as RequestInit);

      const result = await enforceBodyLimit(request);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(413);
        expect(await result.response.json()).toEqual({
          error: 'Request body too large',
        });
      }
    });

    it('accepts a body exactly at the cap (boundary)', async () => {
      const request = chunkedRequest(['a'.repeat(MAX_BODY_BYTES)]);
      const result = await enforceBodyLimit(request);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.bytes.length).toBe(MAX_BODY_BYTES);
    });
  });

  describe('enforceBodyLimit (chunked / stream authority)', () => {
    it('rejects a chunked body that exceeds the cap even without Content-Length', async () => {
      const request = chunkedRequest([
        'a'.repeat(MAX_BODY_BYTES),
        'b', // the +1 byte that trips the cap
      ]);
      const result = await enforceBodyLimit(request);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(413);
    });

    it('rejects when a lying Content-Length understates the actual stream size', async () => {
      // Content-Length under the cap, actual bytes over it — the stream-level
      // cap stays authoritative.
      const request = chunkedRequest(['x'.repeat(MAX_BODY_BYTES + 10)], {
        'content-length': '100',
      });
      const result = await enforceBodyLimit(request);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(413);
    });

    it('buffers a within-cap chunked body and preserves byte order', async () => {
      const request = chunkedRequest(['{"a":', '1}']);
      const result = await enforceBodyLimit(request);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(new TextDecoder().decode(result.bytes)).toBe('{"a":1}');
      }
    });

    it('treats a missing body as an empty ok result', async () => {
      const request = new Request('http://localhost/api/x', { method: 'POST' });
      const result = await enforceBodyLimit(request);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.bytes.length).toBe(0);
    });

    it('honors a custom maxBytes', async () => {
      const request = chunkedRequest(['x'.repeat(11)]);
      const result = await enforceBodyLimit(request, 10);
      expect(result.ok).toBe(false);
    });
  });

  describe('readJsonWithLimit', () => {
    it('parses a within-cap JSON body', async () => {
      const request = chunkedRequest(['{"q":"steem"}']);
      const result = await readJsonWithLimit(request);
      expect(result).toEqual({ ok: true, data: { q: 'steem' } });
    });

    it('returns the 413 response for an over-cap body without parsing', async () => {
      const big = { blob: 'x'.repeat(MAX_BODY_BYTES) };
      const request = new Request('http://localhost/api/x', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(big),
      });
      const result = await readJsonWithLimit(request);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(413);
    });

    it('rethrows malformed JSON so the route catch keeps its error shape', async () => {
      const request = chunkedRequest(['not-json']);
      await expect(readJsonWithLimit(request)).rejects.toThrow(SyntaxError);
    });
  });
});
