// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisMocks = vi.hoisted(() => ({
  // Fake ioredis client covering the subset rate-limit uses (eval).
  eval: vi.fn(),
}));

vi.mock('@/lib/cache/redis', () => ({
  getRedis: vi.fn(),
  redisKey: (key: string) => `condenser:${key}`,
}));

import { getRedis } from '@/lib/cache/redis';
import {
  RATE_LIMITS,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';

const getRedisMock = vi.mocked(getRedis);

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request('http://localhost/api/x', { headers });
}

describe('lib/cache/rate-limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Fake ioredis client with just the eval command rate-limit uses.
    getRedisMock.mockReturnValue({ eval: redisMocks.eval } as never);
  });

  describe('checkRateLimit', () => {
    it('fails open (allows) when Redis is not configured', async () => {
      getRedisMock.mockReturnValue(null);

      const result = await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:challenge',
        limit: 30,
        windowSeconds: 60,
      });
      expect(result).toEqual({ allowed: true });
      expect(redisMocks.eval).not.toHaveBeenCalled();
    });

    it('fails open when Redis errors mid-call', async () => {
      redisMocks.eval.mockRejectedValue(new Error('connection lost'));

      const result = await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:challenge',
        limit: 30,
        windowSeconds: 60,
      });
      expect(result).toEqual({ allowed: true });
    });

    it('allows while the counter is within the limit and reports remaining', async () => {
      redisMocks.eval.mockResolvedValue([5, 42]);

      const result = await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:challenge',
        limit: 30,
        windowSeconds: 60,
      });
      expect(result).toEqual({ allowed: true, remaining: 25 });
    });

    it('blocks once the counter exceeds the limit and reports the window TTL', async () => {
      redisMocks.eval.mockResolvedValue([31, 37]);

      const result = await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:challenge',
        limit: 30,
        windowSeconds: 60,
      });
      expect(result).toEqual({ allowed: false, retryAfterSeconds: 37 });
    });

    it('clamps a non-positive TTL (expiry race) to a 1s retry hint', async () => {
      redisMocks.eval.mockResolvedValue([31, -2]);

      const result = await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:challenge',
        limit: 30,
        windowSeconds: 60,
      });
      expect(result).toEqual({ allowed: false, retryAfterSeconds: 1 });
    });

    it('buckets per endpoint key + client IP under the condenser: namespace', async () => {
      redisMocks.eval.mockResolvedValue([1, 60]);

      await checkRateLimit(
        requestWithHeaders({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }),
        { key: 'auth:login:ip', limit: 10, windowSeconds: 60 }
      );

      expect(redisMocks.eval).toHaveBeenCalledWith(
        expect.any(String), // the Lua script
        1, // number of keys
        'condenser:ratelimit:auth:login:ip:203.0.113.9',
        '60'
      );
    });

    it('buckets on the explicit identifier when provided (login account dimension)', async () => {
      redisMocks.eval.mockResolvedValue([1, 60]);

      await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:login:acct',
        limit: 10,
        windowSeconds: 60,
        identifier: 'Alice',
      });

      expect(redisMocks.eval).toHaveBeenCalledWith(
        expect.any(String),
        1,
        'condenser:ratelimit:auth:login:acct:alice', // sanitized to lowercase
        '60'
      );
    });
  });

  describe('getClientIp', () => {
    it('takes the first x-forwarded-for entry of a multi-hop chain', () => {
      const ip = getClientIp(
        requestWithHeaders({ 'x-forwarded-for': '198.51.100.7, 10.0.0.1, 10.0.0.2' })
      );
      expect(ip).toBe('198.51.100.7');
    });

    it('trims whitespace around XFF entries', () => {
      const ip = getClientIp(requestWithHeaders({ 'x-forwarded-for': ' 198.51.100.7 , 10.0.0.1' }));
      expect(ip).toBe('198.51.100.7');
    });

    it('keeps IPv6 addresses intact', () => {
      const ip = getClientIp(
        requestWithHeaders({ 'x-forwarded-for': '2001:db8::1, 10.0.0.1' })
      );
      expect(ip).toBe('2001:db8::1');
    });

    it('collapses a forged non-IP XFF value to the safe charset (key shaping blocked)', () => {
      // Everything outside [a-z0-9.:] is stripped before the value can shape
      // the Redis key; separators/punctuation cannot smuggle structure in.
      // (Raw CR/LF never even reach this code — the Headers API rejects them.)
      const ip = getClientIp(requestWithHeaders({ 'x-forwarded-for': 'a*b c?d=e&f' }));
      expect(ip).toBe('abcdef');
      expect(ip).toMatch(/^[a-z0-9.:]+$/);
    });

    it('falls back to x-real-ip when x-forwarded-for is absent', () => {
      const ip = getClientIp(requestWithHeaders({ 'x-real-ip': '198.51.100.99' }));
      expect(ip).toBe('198.51.100.99');
    });

    it('prefers x-forwarded-for over x-real-ip', () => {
      const ip = getClientIp(
        requestWithHeaders({
          'x-forwarded-for': '198.51.100.1',
          'x-real-ip': '198.51.100.2',
        })
      );
      expect(ip).toBe('198.51.100.1');
    });

    it('returns the unknown bucket when both headers are missing', () => {
      expect(getClientIp(requestWithHeaders({}))).toBe('unknown');
    });

    it('returns the unknown bucket for an empty XFF value', () => {
      expect(getClientIp(requestWithHeaders({ 'x-forwarded-for': ' , ' }))).toBe('unknown');
    });
  });

  describe('rateLimitResponse', () => {
    it('returns a 429 JSON error with a Retry-After header', async () => {
      const res = rateLimitResponse(37);
      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBe('37');
      expect(await res.json()).toEqual({
        error: 'Too many requests. Please try again later.',
      });
    });

    it('omits Retry-After when no retry hint is available', () => {
      const res = rateLimitResponse(undefined);
      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeNull();
    });

    it('omits Retry-After for non-positive hints and ceiling-fractions up', () => {
      expect(rateLimitResponse(0).headers.get('Retry-After')).toBeNull();
      expect(rateLimitResponse(1.4).headers.get('Retry-After')).toBe('2');
    });
  });

  describe('RATE_LIMITS registry', () => {
    it('covers the audited endpoints with the agreed thresholds', () => {
      expect(RATE_LIMITS.authChallenge).toEqual({ key: 'auth:challenge', limit: 30, windowSeconds: 60 });
      expect(RATE_LIMITS.authLoginIp).toEqual({ key: 'auth:login:ip', limit: 10, windowSeconds: 60 });
      expect(RATE_LIMITS.authLoginAccount).toEqual({ key: 'auth:login:acct', limit: 10, windowSeconds: 60 });
      expect(RATE_LIMITS.steemBroadcast).toEqual({ key: 'steem:broadcast', limit: 30, windowSeconds: 60 });
      expect(RATE_LIMITS.search).toEqual({ key: 'search', limit: 30, windowSeconds: 60 });
      expect(RATE_LIMITS.steemOverseer).toEqual({ key: 'steem:overseer', limit: 60, windowSeconds: 60 });
    });
  });
});
