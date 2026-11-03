// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const redisMocks = vi.hoisted(() => ({
  // Fake ioredis client covering the subset rate-limit uses (eval), plus the
  // getRedis handle. Hoisted (not created inside the factory) so the SAME
  // mock instances are served to every fresh module copy: the trust mode is
  // captured from TRUSTED_CLIENT_IP_HEADER at module load (audit CD-05), so
  // mode-dependent tests re-import the module via vi.resetModules().
  getRedis: vi.fn(),
  eval: vi.fn(),
}));

vi.mock('@/lib/cache/redis', () => ({
  getRedis: redisMocks.getRedis,
  redisKey: (key: string) => `condenser:${key}`,
}));

// Mode-independent exports come from the static import; the mode-dependent
// handles (checkRateLimit / getClientIp close over the module-level
// TRUST_MODE) are re-assigned per trust mode by loadRateLimit().
import {
  RATE_LIMITS,
  aggregateIpIdentity,
  rateLimitResponse,
  type RateLimitOptions,
} from '@/lib/cache/rate-limit';

type RateLimitModule = typeof import('@/lib/cache/rate-limit');
let checkRateLimit: RateLimitModule['checkRateLimit'];
let getClientIp: RateLimitModule['getClientIp'];

/**
 * (Re)import the rate-limit module under a given TRUSTED_CLIENT_IP_HEADER
 * mode (undefined = unset). The module validates and captures the mode at
 * load, so switching modes requires a fresh module instance; an INVALID
 * value makes the dynamic import reject (the startup-fail-fast contract).
 */
async function loadRateLimit(mode?: string): Promise<void> {
  if (mode === undefined) delete process.env.TRUSTED_CLIENT_IP_HEADER;
  else process.env.TRUSTED_CLIENT_IP_HEADER = mode;
  vi.resetModules();
  const mod = await import('@/lib/cache/rate-limit');
  checkRateLimit = mod.checkRateLimit;
  getClientIp = mod.getClientIp;
}

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request('http://localhost/api/x', { headers });
}

describe('lib/cache/rate-limit', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Fake ioredis client with just the eval command rate-limit uses.
    redisMocks.getRedis.mockReturnValue({ eval: redisMocks.eval } as never);
    // Default trust mode for the mode-agnostic tests: the Steemit chain's
    // recommended x-real-ip contract.
    await loadRateLimit('x-real-ip');
  });

  afterAll(() => {
    // Never leak the trust mode into other test files sharing this worker.
    delete process.env.TRUSTED_CLIENT_IP_HEADER;
  });

  describe('checkRateLimit', () => {
    it('fails open (allows) when Redis is not configured', async () => {
      redisMocks.getRedis.mockReturnValue(null);

      const result = await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:challenge',
        limit: 30,
        windowSeconds: 60,
      });
      expect(result).toEqual({ allowed: true });
      expect(redisMocks.eval).not.toHaveBeenCalled();
    });

    it('fails open when Redis errors mid-call and warns that the limiter is disabled', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      redisMocks.eval.mockRejectedValue(new Error('connection lost'));

      // Trusted header present so the only warning is the fail-open one.
      const result = await checkRateLimit(
        requestWithHeaders({ 'x-real-ip': '198.51.100.7' }),
        {
          key: 'auth:challenge',
          limit: 30,
          windowSeconds: 60,
        }
      );
      expect(result).toEqual({ allowed: true });
      // The silent fail-open is observable: one warning names the mode and
      // the underlying error.
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0].join(' ')).toContain('failing OPEN');
      expect(warn.mock.calls[0].join(' ')).toContain('connection lost');
    });

    it('throttles the fail-open warning so an outage under a flood cannot flood the logs', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // Control the clock the throttle reads; start at the real now so the
      // module's warn-timestamp from prior tests is either fresh (throttled)
      // or stale (warns) — the assertions below hold in both cases.
      let now = Date.now();
      const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => now);
      redisMocks.eval.mockRejectedValue(new Error('connection lost'));
      const rule = { key: 'auth:challenge', limit: 30, windowSeconds: 60 };
      // A trusted header is present so the unattributed-identity warning
      // (its own throttle clock) stays out of this test's counting.
      const req = requestWithHeaders({ 'x-real-ip': '198.51.100.7' });

      // Prime the throttle state (may warn or not depending on prior tests).
      await checkRateLimit(req, rule);
      const baseline = warn.mock.calls.length;

      // A burst of erroring calls within the window: at most the priming
      // warning — never one per request.
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(req, rule);
      }
      expect(warn.mock.calls.length).toBe(baseline);

      // Outside the throttle window exactly one more warning fires.
      now += 61_000;
      await checkRateLimit(req, rule);
      expect(warn.mock.calls.length).toBe(baseline + 1);

      nowSpy.mockRestore();
    });

    it('allows while the counter is within the limit and reports remaining', async () => {
      // Full 3-tuple the Lua script returns: [count, ttl, first_blocked].
      redisMocks.eval.mockResolvedValue([5, 42, 0]);

      const result = await checkRateLimit(
        requestWithHeaders({ 'x-real-ip': '203.0.113.9' }),
        {
          key: 'auth:challenge',
          limit: 30,
          windowSeconds: 60,
        }
      );
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

    it('buckets per endpoint key + trusted-header client IP under the condenser: namespace', async () => {
      redisMocks.eval.mockResolvedValue([1, 60, 0]);

      await checkRateLimit(
        requestWithHeaders({ 'x-real-ip': '203.0.113.9' }),
        { key: 'auth:login:ip', limit: 10, windowSeconds: 60 }
      );

      expect(redisMocks.eval).toHaveBeenCalledWith(
        expect.any(String), // the Lua script
        1, // number of keys
        'condenser:ratelimit:auth:login:ip:203.0.113.9',
        '60',
        '10'
      );
    });

    it('buckets on the explicit identifier when provided (login account dimension)', async () => {
      redisMocks.eval.mockResolvedValue([1, 60, 0]);

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
        '60',
        '10'
      );
    });

    it('keeps hyphens in account identifiers so some-user and someuser do not share a bucket', async () => {
      redisMocks.eval.mockResolvedValue([1, 60, 0]);

      await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:login:acct',
        limit: 10,
        windowSeconds: 60,
        identifier: 'Some-User',
      });
      await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:login:acct',
        limit: 10,
        windowSeconds: 60,
        identifier: 'someuser',
      });

      const identities = redisMocks.eval.mock.calls.map((c) => c[2]);
      // '-' is a legal Steem username character: distinct names must land in
      // distinct buckets (no cross-account lockout / no shared quota).
      expect(identities).toEqual([
        'condenser:ratelimit:auth:login:acct:some-user',
        'condenser:ratelimit:auth:login:acct:someuser',
      ]);
    });

    it('runs the atomic fixed-window Lua script with the EXPIRE-on-first-hit guard intact', async () => {
      redisMocks.eval.mockResolvedValue([1, 60, 0]);

      await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:challenge',
        limit: 30,
        windowSeconds: 60,
      });

      // Assert on the script CONTENT, not just that eval ran: the INCR must
      // be there, and EXPIRE must only fire on the first hit of a window —
      // dropping the `current == 1` guard would re-EXPIRE on every request
      // (window never ends) while all behavioural tests stay green, and
      // losing EXPIRE entirely would leak persistent counter keys. The
      // first-blocked flag must compare against the LIMIT argument so the
      // 429 log fires exactly once per bucket-window.
      const script = redisMocks.eval.mock.calls[0][0] as string;
      expect(script).toContain("redis.call('INCR', KEYS[1])");
      expect(script).toContain('if current == 1 then');
      expect(script).toContain("redis.call('EXPIRE', KEYS[1], ARGV[1])");
      expect(script).toContain("redis.call('TTL', KEYS[1])");
      expect(script).toContain('current == tonumber(ARGV[2]) + 1');
    });

    it('logs exactly the first blocked hit of a bucket-window (IP dimension)', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const rule = { key: 'auth:challenge', limit: 30, windowSeconds: 60 };

      // count 31 == limit + 1 → first blocked hit: one log line naming the
      // bucket and the aggregated IP.
      redisMocks.eval.mockResolvedValue([31, 37, 1]);
      const first = await checkRateLimit(
        requestWithHeaders({ 'x-real-ip': '198.51.100.7' }),
        rule
      );
      expect(first).toEqual({ allowed: false, retryAfterSeconds: 37 });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0].join(' ')).toContain('bucket=auth:challenge');
      expect(warn.mock.calls[0].join(' ')).toContain('ip=198.51.100.7');
      expect(warn.mock.calls[0].join(' ')).toContain('retry_after=37s');

      // Subsequent blocked hits in the same window stay silent.
      redisMocks.eval.mockResolvedValue([32, 36, 0]);
      await checkRateLimit(
        requestWithHeaders({ 'x-real-ip': '198.51.100.7' }),
        rule
      );
      expect(warn).toHaveBeenCalledTimes(1);

      warn.mockRestore();
    });

    it('redacts the identity in the 429 log for account-dimension buckets (N-20 discipline)', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      redisMocks.eval.mockResolvedValue([11, 42, 1]);

      await checkRateLimit(requestWithHeaders({}), {
        key: 'auth:login:acct',
        limit: 10,
        windowSeconds: 60,
        identifier: 'some-victim',
      });

      const line = warn.mock.calls[0].join(' ');
      expect(line).toContain('identity=<redacted>');
      expect(line).not.toContain('some-victim');
      warn.mockRestore();
    });
  });

  describe('checkRateLimit unattributable identities (audit CD-05)', () => {
    const rule: RateLimitOptions = {
      key: 'auth:challenge',
      limit: 30,
      windowSeconds: 60,
    };

    describe('trusted header configured but missing/invalid on the request', () => {
      // Outer beforeEach loads x-real-ip with a live Redis fake.

      it('still rate-limits: one shared unattributed bucket at the normal limit (never exempt)', async () => {
        // A configured proxy ALWAYS sets the trusted header, so a request
        // without one is direct-to-app access; letting it through unbucketed
        // would make "drop the header" the rate-limit bypass.
        redisMocks.eval.mockResolvedValue([1, 60, 0]);
        await checkRateLimit(requestWithHeaders({}), rule);
        // Same request with only a forged XFF present — equally anomalous,
        // and the forged header must not rescue the identity either.
        await checkRateLimit(
          requestWithHeaders({ 'x-forwarded-for': '203.0.113.77, 10.0.0.1' }),
          rule
        );

        expect(redisMocks.eval).toHaveBeenCalledTimes(2);
        for (const call of redisMocks.eval.mock.calls) {
          expect(call[2]).toBe('condenser:ratelimit:auth:challenge:unattributed');
        }
      });

      it('warns (throttled to one per minute) that the trusted header was missing', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        redisMocks.eval.mockResolvedValue([1, 60, 0]);

        await checkRateLimit(requestWithHeaders({}), rule);
        await checkRateLimit(requestWithHeaders({}), rule);

        expect(warn).toHaveBeenCalledTimes(1);
        const line = warn.mock.calls[0].join(' ');
        expect(line).toContain('TRUSTED_CLIENT_IP_HEADER=x-real-ip');
        expect(line).toContain('unattributed');
        warn.mockRestore();
      });
    });

    describe('no trusted header configured (direct exposure)', () => {
      beforeEach(async () => {
        await loadRateLimit(undefined);
      });

      it('exempts IP-dimension rules entirely — no shared site-wide bucket, no Redis call', async () => {
        // The pre-CD-05 fallback ('unknown') collapsed ALL visitors into one
        // 30/min bucket and they 429'd each other. With no trusted header
        // there is no sound identity, so the honest behavior is exempt.
        redisMocks.eval.mockResolvedValue([1, 60, 0]);

        const result = await checkRateLimit(
          requestWithHeaders({ 'x-forwarded-for': '203.0.113.1' }),
          rule
        );

        expect(result).toEqual({ allowed: true });
        expect(redisMocks.eval).not.toHaveBeenCalled();
      });

      it('still enforces identifier-dimension rules (per-account CD-04 buckets survive)', async () => {
        redisMocks.eval.mockResolvedValue([11, 42, 1]);

        const result = await checkRateLimit(requestWithHeaders({}), {
          key: 'auth:login:acct',
          limit: 10,
          windowSeconds: 60,
          identifier: 'alice',
        });

        expect(result).toEqual({ allowed: false, retryAfterSeconds: 42 });
        expect(redisMocks.eval).toHaveBeenCalledWith(
          expect.any(String),
          1,
          'condenser:ratelimit:auth:login:acct:alice',
          '60',
          '10'
        );
      });

      it('warns (throttled) that per-IP limiting is disabled and how to fix it', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        redisMocks.eval.mockResolvedValue([1, 60, 0]);

        await checkRateLimit(requestWithHeaders({}), rule);
        await checkRateLimit(requestWithHeaders({}), rule);

        expect(warn).toHaveBeenCalledTimes(1);
        const line = warn.mock.calls[0].join(' ');
        expect(line).toContain('TRUSTED_CLIENT_IP_HEADER is not set');
        expect(line).toContain('x-real-ip');
        warn.mockRestore();
      });
    });
  });

  describe('getClientIp trust contract (audit CD-05)', () => {
    describe('mode x-real-ip (recommended for the Steemit openresty chain)', () => {
      // Outer beforeEach loads x-real-ip.

      it('resolves the identity from x-real-ip only', () => {
        const ip = getClientIp(requestWithHeaders({ 'x-real-ip': '198.51.100.2' }));
        expect(ip).toBe('198.51.100.2');
      });

      it('ignores a client-forged X-Forwarded-For entirely (the CD-05 spoof)', () => {
        // The exact captured attack shape: every proxy layer merely APPENDS
        // to XFF, so the client-supplied first segment arrives first at the
        // app. Pre-fix this fully controlled the rate-limit identity.
        const ip = getClientIp(
          requestWithHeaders({
            'x-forwarded-for': '203.0.113.77, 198.51.100.2, 10.0.0.4',
            'x-real-ip': '198.51.100.2',
          })
        );
        expect(ip).toBe('198.51.100.2');
      });

      it('never falls back to XFF when the trusted header is missing', () => {
        // No x-real-ip on the request: the XFF present here is client
        // chatter, not a substitute identity source.
        const ip = getClientIp(
          requestWithHeaders({ 'x-forwarded-for': '203.0.113.77, 10.0.0.1' })
        );
        expect(ip).toBe('unattributed');
      });

      it('aggregates a trusted IPv6 address to its /64 prefix', () => {
        const ip = getClientIp(requestWithHeaders({ 'x-real-ip': '2001:db8::1' }));
        expect(ip).toBe('2001:0db8:0000:0000::/64');
      });

      it('rejects non-IP trusted values (ports, lists, junk) as unattributed', () => {
        expect(getClientIp(requestWithHeaders({ 'x-real-ip': '198.51.100.2:8080' }))).toBe(
          'unattributed'
        );
        expect(getClientIp(requestWithHeaders({ 'x-real-ip': '198.51.100.2, 10.0.0.1' }))).toBe(
          'unattributed'
        );
        expect(getClientIp(requestWithHeaders({ 'x-real-ip': 'not-an-ip' }))).toBe(
          'unattributed'
        );
        // Strict dotted-quad: leading zeros are ambiguous, not an IP here.
        expect(getClientIp(requestWithHeaders({ 'x-real-ip': '010.1.1.1' }))).toBe(
          'unattributed'
        );
      });

      it('treats an effectively empty trusted header as missing', () => {
        expect(getClientIp(requestWithHeaders({ 'x-real-ip': '  ' }))).toBe(
          'unattributed'
        );
      });
    });

    describe('mode cf-connecting-ip', () => {
      beforeEach(async () => {
        await loadRateLimit('cf-connecting-ip');
      });

      it('resolves the identity from cf-connecting-ip only (XFF and x-real-ip ignored)', () => {
        const ip = getClientIp(
          requestWithHeaders({
            'cf-connecting-ip': '198.51.100.3',
            'x-forwarded-for': '203.0.113.77, 10.0.0.1',
            'x-real-ip': '203.0.113.99',
          })
        );
        expect(ip).toBe('198.51.100.3');
      });

      it('aggregates a trusted IPv6 address to its /64 prefix', () => {
        const ip = getClientIp(
          requestWithHeaders({ 'cf-connecting-ip': '2001:db8:dead:beef::1' })
        );
        expect(ip).toBe('2001:0db8:dead:beef::/64');
      });

      it('returns unattributed when cf-connecting-ip is missing (no fallback headers)', () => {
        const ip = getClientIp(
          requestWithHeaders({ 'x-real-ip': '203.0.113.99' })
        );
        expect(ip).toBe('unattributed');
      });
    });

    describe('mode xff-tail', () => {
      beforeEach(async () => {
        await loadRateLimit('xff-tail');
      });

      it('takes the LAST XFF entry — the spoofed first segment has no effect', () => {
        const ip = getClientIp(
          requestWithHeaders({
            'x-forwarded-for': '203.0.113.77, 10.0.0.1, 198.51.100.5',
          })
        );
        expect(ip).toBe('198.51.100.5');
      });

      it('resolves a single-entry XFF to that entry', () => {
        expect(getClientIp(requestWithHeaders({ 'x-forwarded-for': '198.51.100.5' }))).toBe(
          '198.51.100.5'
        );
        // Trimming still applies to the tail entry.
        expect(
          getClientIp(requestWithHeaders({ 'x-forwarded-for': '10.0.0.1, 198.51.100.5 , ' }))
        ).toBe('198.51.100.5');
      });

      it('aggregates a trusted IPv6 tail entry to its /64 prefix', () => {
        const ip = getClientIp(
          requestWithHeaders({
            'x-forwarded-for': '203.0.113.77, 2001:db8:85a3::8a2e:370:7334',
          })
        );
        expect(ip).toBe('2001:0db8:85a3:0000::/64');
      });

      it('returns unattributed for an effectively empty XFF', () => {
        expect(getClientIp(requestWithHeaders({ 'x-forwarded-for': ' , ' }))).toBe(
          'unattributed'
        );
      });

      it('returns unattributed when a non-IP value sits in the tail', () => {
        expect(
          getClientIp(requestWithHeaders({ 'x-forwarded-for': '10.0.0.1, junk.example' }))
        ).toBe('unattributed');
      });
    });

    describe('mode none / unset (direct exposure)', () => {
      beforeEach(async () => {
        await loadRateLimit(undefined);
      });

      it('never reads any header — every request is unattributable', () => {
        expect(
          getClientIp(
            requestWithHeaders({
              'x-forwarded-for': '203.0.113.77',
              'x-real-ip': '198.51.100.2',
              'cf-connecting-ip': '198.51.100.3',
            })
          )
        ).toBe('unattributed');
      });

      it('accepts an explicit "none" with the same header-less semantics', async () => {
        await loadRateLimit('none');
        expect(
          getClientIp(requestWithHeaders({ 'x-real-ip': '198.51.100.2' }))
        ).toBe('unattributed');
      });
    });

    describe('startup validation of TRUSTED_CLIENT_IP_HEADER', () => {
      it('fails fast at module load for an unknown value, listing the valid modes', async () => {
        await expect(loadRateLimit('x-forwarded-for')).rejects.toThrow(
          /TRUSTED_CLIENT_IP_HEADER is set to an unknown value "x-forwarded-for".*x-real-ip.*cf-connecting-ip.*xff-tail.*none/
        );
      });

      it('normalizes case and whitespace before matching (header-style casing accepted)', async () => {
        await loadRateLimit('  X-Real-IP ');
        expect(getClientIp(requestWithHeaders({ 'x-real-ip': '198.51.100.2' }))).toBe(
          '198.51.100.2'
        );
      });
    });
  });

  describe('aggregateIpIdentity (IPv6 /64 prefix, audit N-08 follow-up)', () => {
    it('collapses every address of one /64 into a single bucket', () => {
      const prefix = '2001:0db8:1234:5678::/64';
      expect(aggregateIpIdentity('2001:db8:1234:5678::1')).toBe(prefix);
      expect(aggregateIpIdentity('2001:db8:1234:5678::dead:beef')).toBe(prefix);
      expect(
        aggregateIpIdentity('2001:db8:1234:5678:ffff:ffff:ffff:ffff')
      ).toBe(prefix);
      // Full textual form normalizes to the same prefix (uppercase hex too).
      expect(
        aggregateIpIdentity('2001:0DB8:1234:5678:0000:0000:0000:0001')
      ).toBe(prefix);
    });

    it('separates different /64s', () => {
      expect(aggregateIpIdentity('2001:db8:1234:5679::1')).not.toBe(
        aggregateIpIdentity('2001:db8:1234:5678::1')
      );
    });

    it('normalizes IPv4-mapped IPv6 to the plain IPv4 form', () => {
      expect(aggregateIpIdentity('::ffff:192.0.2.128')).toBe('192.0.2.128');
      expect(aggregateIpIdentity('::FFFF:192.0.2.128')).toBe('192.0.2.128');
      // Plain IPv4 passes through: mapped and plain share one bucket.
      expect(aggregateIpIdentity('192.0.2.128')).toBe('192.0.2.128');
    });

    it('handles embedded dotted-quad tails and zone ids', () => {
      // Embedded v4 tail in a global address: still the first-4-hextet /64.
      expect(aggregateIpIdentity('2001:db8::192.0.2.1')).toBe(
        '2001:0db8:0000:0000::/64'
      );
      expect(aggregateIpIdentity('fe80::1%eth0')).toBe(
        'fe80:0000:0000:0000::/64'
      );
      expect(aggregateIpIdentity('[2001:db8::1]')).toBe(
        '2001:0db8:0000:0000::/64'
      );
    });

    it('keeps loopback and all-zero addresses in predictable buckets', () => {
      expect(aggregateIpIdentity('::1')).toBe('0000:0000:0000:0000::/64');
      expect(aggregateIpIdentity('::')).toBe('0000:0000:0000:0000::/64');
    });

    it('falls back to the charset sanitizer for malformed colon junk', () => {
      // Not a valid IPv6 literal: same treatment as before aggregation
      // existed — charset-strip (colons/dots are legal identity characters),
      // unknown when nothing remains.
      expect(aggregateIpIdentity('zz:::nonsense!!')).toBe('zz:::nonsense');
      expect(aggregateIpIdentity('!!@@##')).toBe('unknown');
    });

    it('rejects impossible IPv6 group counts', () => {
      // 9 groups without elision, and an elision that fills nothing: both
      // fail IPv6 parsing and fall back to the charset sanitizer, which
      // keeps these colon-legal strings verbatim (pre-aggregation behavior
      // for hostile XFF values — they cannot shape the Redis key).
      expect(aggregateIpIdentity('1:2:3:4:5:6:7:8:9')).toBe(
        '1:2:3:4:5:6:7:8:9'
      );
      expect(aggregateIpIdentity('1:2:3:4:5:6:7:8::')).toBe('1:2:3:4:5:6:7:8::');
      // Invalid hex group.
      expect(aggregateIpIdentity('2001:xb8::1')).toBe('2001:xb8::1');
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
      expect(RATE_LIMITS.authSession).toEqual({ key: 'auth:session', limit: 120, windowSeconds: 60 });
      expect(RATE_LIMITS.authLoginIp).toEqual({ key: 'auth:login:ip', limit: 10, windowSeconds: 60 });
      expect(RATE_LIMITS.authLoginAccount).toEqual({ key: 'auth:login:acct', limit: 10, windowSeconds: 60 });
      expect(RATE_LIMITS.steemBroadcast).toEqual({ key: 'steem:broadcast', limit: 30, windowSeconds: 60 });
      expect(RATE_LIMITS.search).toEqual({ key: 'search', limit: 30, windowSeconds: 60 });
      expect(RATE_LIMITS.steemOverseer).toEqual({ key: 'steem:overseer', limit: 60, windowSeconds: 60 });
      // Above the 800ms-debounce ceiling (75/min) with headroom for the
      // Settings page's manual saves sharing the same bucket.
      expect(RATE_LIMITS.authPreferences).toEqual({ key: 'auth:preferences', limit: 60, windowSeconds: 60 });
    });
  });
});
