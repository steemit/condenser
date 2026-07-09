/**
 * Browser-side stale-while-revalidate fetch wrapper (L1 cache).
 *
 * - Fresh cache   → return immediately, no network.
 * - Stale cache   → return immediately + fire-and-forget background refresh.
 * - No cache      → fetch (blocking), cache, return.
 *
 * Error handling: a non-OK response ALWAYS throws HttpError — error bodies are
 * never cached and never returned as if they were data. Callers catch the
 * error and apply their own fallback (e.g. return []).
 *
 * The `X-Cache-Invalidate` response header (set by the broadcast route after a
 * write) lets a successful write evict related entries from L1 immediately.
 *
 * Note: degradation-state from the wallet project is intentionally NOT ported
 * — it was dead code (written, never read). PR3's use-service-health hook
 * owns the degraded-UI signal via /api/health polling.
 */

import { clientCache } from './client-cache';

export interface CachedFetchOptions {
  /** Milliseconds until data becomes stale (eligible for background refresh). */
  staleMs: number;
  /** Milliseconds until data must be discarded entirely. */
  maxAgeMs: number;
  /** Skip cache and always fetch fresh. */
  noStore?: boolean;
}

export interface CachedFetchResult<T> {
  data: T;
  /** True if data was served from cache past its stale time. */
  stale: boolean;
}

/**
 * Fetch `url` with browser-side stale-while-revalidate caching.
 * Returns `{ data, stale }`; callers decide how to surface staleness.
 *
 * Throws HttpError on any non-OK HTTP response — the caller is expected to
 * catch and fall back (e.g. return an empty list). Error bodies are never
 * cached, so a transient 5xx never poisons the cache for maxAgeMs.
 */
export async function cachedFetch<T>(
  url: string,
  opts: CachedFetchOptions
): Promise<CachedFetchResult<T>> {
  if (opts.noStore) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new HttpError(res.status, res.statusText);
    return { data: (await res.json()) as T, stale: false };
  }

  const cached = clientCache.get<T>(url);
  if (cached && !cached.stale) {
    return { data: cached.data, stale: false };
  }

  // Stale but usable → return old data + refresh in the background.
  if (cached) {
    backgroundRefresh(url, opts);
    return { data: cached.data, stale: true };
  }

  // No cache at all → must wait for fetch.
  const res = await fetch(url);
  if (!res.ok) throw new HttpError(res.status, res.statusText);
  const data = (await res.json()) as T;
  handleCacheInvalidation(res);
  clientCache.set(url, data, opts.staleMs, opts.maxAgeMs);
  return { data, stale: false };
}

/**
 * Error carrying the HTTP status, so callers can branch on 404 vs 5xx.
 * Thrown on any non-OK response (never caches the error body).
 */
export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  constructor(status: number, statusText: string) {
    super(`Request failed: ${status} ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
  }
}

function backgroundRefresh(url: string, opts: CachedFetchOptions): void {
  fetch(url)
    .then(async (res) => {
      // A background refresh hitting an error must NOT overwrite the cached
      // entry with an error body — leave the stale (but valid) data in place.
      if (!res.ok) return;
      const data = await res.json();
      handleCacheInvalidation(res);
      clientCache.set(url, data, opts.staleMs, opts.maxAgeMs);
    })
    .catch(() => {
      // Background refresh failure is non-critical; stale data stays.
    });
}

/** Honour the server's per-write invalidation directive (X-Cache-Invalidate). */
function handleCacheInvalidation(res: Response): void {
  const prefix = res.headers.get('X-Cache-Invalidate');
  if (prefix) clientCache.invalidate(prefix);
}
