/**
 * Browser-side LRU cache with stale-while-revalidate support.
 *
 * Module-level singleton shared across all imports within a single browser tab.
 * This is the L1 layer of the three-tier cache (Browser L1 → Redis L2 → RPC).
 *
 * Each entry carries two timestamps:
 *   - staleAt   : until this time data is "fresh"; after it, data is returned
 *                 immediately but a background refresh is triggered.
 *   - expiresAt : after this time data is discarded and a fresh fetch blocks.
 */

const MAX_ENTRIES = 50;

interface CacheEntry<T> {
  data: T;
  staleAt: number;
  expiresAt: number;
}

export interface CacheRead<T> {
  data: T;
  /** True when past staleAt but before expiresAt. */
  stale: boolean;
}

class ClientCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private insertionOrder: string[] = [];

  get<T>(key: string): CacheRead<T> | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.store.delete(key);
      this.removeFromOrder(key);
      return null;
    }

    return { data: entry.data as T, stale: now > entry.staleAt };
  }

  set<T>(key: string, data: T, staleMs: number, maxAgeMs: number): void {
    const existed = this.store.has(key);

    // Evict the oldest entry once at capacity (LRU by insertion order). Only
    // evict when inserting a brand-new key — refreshing an existing one must
    // not evict anything.
    if (!existed && this.store.size >= MAX_ENTRIES) {
      const oldest = this.insertionOrder.shift();
      if (oldest) this.store.delete(oldest);
    }

    const now = Date.now();
    this.store.set(key, {
      data,
      staleAt: now + staleMs,
      expiresAt: now + maxAgeMs,
    });

    // True LRU: a refresh (existing key) moves it to the back of the queue as
    // most-recently-used, so hot keys are never evicted in favour of cold ones.
    if (existed) {
      this.removeFromOrder(key);
    }
    this.insertionOrder.push(key);
  }

  /**
   * Drop all entries whose key contains `prefix`.
   * Driven by the `X-Cache-Invalidate` response header set on writes.
   *
   * Collects matching keys first, then deletes: deleting during Map iteration
   * can skip not-yet-visited keys (per ES spec), which would leave stale write
   * victims behind.
   */
  invalidate(prefix: string): void {
    const toDelete: string[] = [];
    for (const key of this.store.keys()) {
      if (key.includes(prefix)) toDelete.push(key);
    }
    for (const key of toDelete) {
      this.store.delete(key);
      this.removeFromOrder(key);
    }
  }

  clear(): void {
    this.store.clear();
    this.insertionOrder = [];
  }

  private removeFromOrder(key: string): void {
    const idx = this.insertionOrder.indexOf(key);
    if (idx !== -1) this.insertionOrder.splice(idx, 1);
  }
}

export const clientCache = new ClientCache();
