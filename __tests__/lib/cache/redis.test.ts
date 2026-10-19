// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Generation-counter (audit CD-03) and singleton wire contracts. ioredis is
 * mocked wholesale — these tests pin how the scope is namespaced and turned
 * into the counter key, and how INCR/EXPIRE are issued, not Redis itself.
 * Each test imports a fresh module (vi.resetModules) so the module-level
 * client singleton never leaks between cases.
 */

/** ioredis MULTI chain double for bumpCacheGeneration. */
function makeChain() {
  const chain = {
    incr: vi.fn(() => chain),
    expire: vi.fn(() => chain),
    exec: vi.fn(async () => []),
  };
  return chain;
}

function makeRedisClient(get: ReturnType<typeof vi.fn> = vi.fn(async () => null)) {
  const chain = makeChain();
  // getRedis registers error/close listeners before returning the client.
  const client = { get, multi: vi.fn(() => chain), on: vi.fn() };
  return { client, chain };
}

/** Freshly import lib/cache/redis with ioredis mocked to `client`. */
async function loadRedisModule(client: unknown) {
  vi.doMock('ioredis', () => ({
    default: vi.fn(function MockRedis() {
      return client;
    }),
  }));
  vi.stubEnv('REDIS_URL', 'redis://localhost:6379');
  vi.stubEnv('REDIS_KEY_PREFIX', '');
  return await import('@/lib/cache/redis');
}

/** ioredis client double with emit-driven event handlers. */
function makeEmitterClient() {
  const handlers: Record<string, (...args: unknown[]) => void> = {};
  return {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = handler;
    }),
    emit(event: string, ...args: unknown[]) {
      handlers[event]?.(...args);
    },
  };
}

describe('lib/cache/redis KEY_PREFIX precedence (S8 split)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock('ioredis');
    vi.unstubAllEnvs();
  });

  async function incrKeyFor(
    client: unknown,
    env: Record<string, string> = {}
  ): Promise<string> {
    vi.doMock('ioredis', () => ({
      default: vi.fn(function MockRedis() {
        return client;
      }),
    }));
    vi.stubEnv('REDIS_URL', 'redis://localhost:6379');
    // Deterministic baseline: both prefix vars unset unless a test sets them.
    vi.stubEnv('REDIS_CACHE_KEY_PREFIX', '');
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    const { bumpCacheGeneration } = await import('@/lib/cache/redis');
    await bumpCacheGeneration('k');
    const { multi } = client as { multi: ReturnType<typeof vi.fn> };
    const chain = multi.mock.results[0].value as { incr: ReturnType<typeof vi.fn> };
    return (chain.incr.mock.calls[0] as unknown[])[0] as string;
  }

  it('defaults to the condenser namespace', async () => {
    const { client } = makeRedisClient();
    expect(await incrKeyFor(client)).toBe('condenser:steem:cachever:k');
  });

  it('still honors the deprecated REDIS_KEY_PREFIX alone', async () => {
    const { client } = makeRedisClient();
    expect(
      await incrKeyFor(client, { REDIS_KEY_PREFIX: 'legacy' })
    ).toBe('legacy:steem:cachever:k');
  });

  it('REDIS_CACHE_KEY_PREFIX wins over the deprecated REDIS_KEY_PREFIX', async () => {
    const { client } = makeRedisClient();
    expect(
      await incrKeyFor(client, {
        REDIS_KEY_PREFIX: 'legacy',
        REDIS_CACHE_KEY_PREFIX: 'cache',
      })
    ).toBe('cache:steem:cachever:k');
  });
});

describe('lib/cache/redis generation counters (CD-03)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock('ioredis');
    vi.unstubAllEnvs();
  });

  it('bumpCacheGeneration: one MULTI of INCR + EXPIRE(24h) on the namespaced scope key', async () => {
    const { client, chain } = makeRedisClient();
    const { bumpCacheGeneration } = await loadRedisModule(client);

    await bumpCacheGeneration('following-page:alice');

    expect(client.multi).toHaveBeenCalledTimes(1);
    // Contract: INCR and EXPIRE share one transaction so a crash between
    // them can never leave a TTL-less counter behind.
    expect(chain.incr).toHaveBeenCalledTimes(1);
    expect(chain.incr).toHaveBeenCalledWith('condenser:steem:cachever:following-page:alice');
    expect(chain.expire).toHaveBeenCalledTimes(1);
    expect(chain.expire).toHaveBeenCalledWith(
      'condenser:steem:cachever:following-page:alice',
      24 * 60 * 60
    );
    expect(chain.exec).toHaveBeenCalledTimes(1);
  });

  it('bumpCacheGeneration is a no-op (never constructs ioredis) when REDIS_URL is unset', async () => {
    const ctor = vi.fn();
    vi.doMock('ioredis', () => ({ default: ctor }));
    vi.stubEnv('REDIS_URL', '');
    const { bumpCacheGeneration } = await import('@/lib/cache/redis');

    await bumpCacheGeneration('communities');

    expect(ctor).not.toHaveBeenCalled();
  });

  it('getCacheGeneration returns the counter value', async () => {
    const { client } = makeRedisClient(vi.fn(async () => '41'));
    const { getCacheGeneration } = await loadRedisModule(client);

    await expect(getCacheGeneration('communities')).resolves.toBe(41);
    expect(client.get).toHaveBeenCalledWith('condenser:steem:cachever:communities');
  });

  it('getCacheGeneration: missing counter means generation 0', async () => {
    const { client } = makeRedisClient(vi.fn(async () => null));
    const { getCacheGeneration } = await loadRedisModule(client);

    await expect(getCacheGeneration('following:alice')).resolves.toBe(0);
  });

  it('getCacheGeneration fails open on a non-numeric or corrupt counter', async () => {
    const { client } = makeRedisClient(vi.fn(async () => 'not-a-number'));
    const { getCacheGeneration } = await loadRedisModule(client);

    await expect(getCacheGeneration('communities')).resolves.toBe(0);
  });

  it('getCacheGeneration fails open on a Redis read error', async () => {
    const { client } = makeRedisClient(
      vi.fn(async () => {
        throw new Error('READONLY');
      })
    );
    const { getCacheGeneration } = await loadRedisModule(client);

    await expect(getCacheGeneration('communities')).resolves.toBe(0);
  });

  it('bumpCacheGeneration swallows Redis errors (invalidation is non-critical)', async () => {
    const { client, chain } = makeRedisClient();
    chain.exec.mockRejectedValue(new Error('OOM'));
    const { bumpCacheGeneration } = await loadRedisModule(client);

    await expect(bumpCacheGeneration('communities')).resolves.toBeUndefined();
  });
});

describe('lib/cache/redis close-handler singleton lifecycle (S9 guard)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock('ioredis');
    vi.unstubAllEnvs();
  });

  async function loadWithClients(a: unknown, b: unknown) {
    let n = 0;
    const ctor = vi.fn(function MockRedis() {
      return n++ === 0 ? a : b;
    });
    vi.doMock('ioredis', () => ({ default: ctor }));
    vi.stubEnv('REDIS_URL', 'redis://localhost:6379');
    vi.stubEnv('REDIS_KEY_PREFIX', '');
    const mod = await import('@/lib/cache/redis');
    return { ctor, mod };
  }

  it('close on the current client vacates the slot so a fresh client is minted', async () => {
    const a = makeEmitterClient();
    const b = makeEmitterClient();
    const { ctor, mod } = await loadWithClients(a, b);

    expect(mod.getRedis()).toBe(a);
    a.emit('close');
    // Slot vacated: the next call constructs the replacement.
    expect(mod.getRedis()).toBe(b);
    expect(ctor).toHaveBeenCalledTimes(2);
  });

  it("a stale client's late close does not evict the newer singleton", async () => {
    // Regression (retrospective review): client A closes, the next getRedis()
    // mints B, and THEN A emits another close. The handler must not clear
    // B's slot — otherwise the following getRedis() mints C and B leaks
    // (mirrors the S9 stale-client test in redis-session.test.ts).
    const a = makeEmitterClient();
    const b = makeEmitterClient();
    const { ctor, mod } = await loadWithClients(a, b);

    expect(mod.getRedis()).toBe(a);
    a.emit('close'); // A vacates the slot; next call mints B
    expect(mod.getRedis()).toBe(b);

    a.emit('close'); // late close from the already-replaced client

    expect(mod.getRedis()).toBe(b); // B is still the singleton
    expect(ctor).toHaveBeenCalledTimes(2); // no third client was minted
  });
});
