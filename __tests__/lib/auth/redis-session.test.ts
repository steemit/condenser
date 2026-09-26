// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * lib/auth/redis-session client lifecycle (S8/S9). ioredis is mocked
 * wholesale: these tests pin which env vars feed the session keyPrefix (S8)
 * and that an error event retires the errored client instead of leaking it —
 * quit() is called on the old instance and the next call constructs a fresh
 * one (S9). Each test imports a fresh module (vi.resetModules) because the
 * client is a module-level singleton.
 */

type Handler = (...args: unknown[]) => void;

function makeClient() {
  const handlers: Record<string, Handler> = {};
  return {
    on: vi.fn((event: string, handler: Handler) => {
      handlers[event] = handler;
    }),
    quit: vi.fn(async () => 'OK'),
    disconnect: vi.fn(),
    emit(event: string, ...args: unknown[]) {
      handlers[event]?.(...args);
    },
  };
}

/** Freshly import redis-session with ioredis mocked; returns the ctor spy. */
async function loadSessionModule(client: unknown) {
  const ctor = vi.fn(function MockRedis() {
    return client;
  });
  vi.doMock('ioredis', () => ({ Redis: ctor }));
  return { ctor, module: await import('@/lib/auth/redis-session') };
}

describe('lib/auth/redis-session keyPrefix (S8 split)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('REDIS_HOST', 'localhost');
  });

  afterEach(() => {
    vi.doUnmock('ioredis');
    vi.unstubAllEnvs();
  });

  it('defaults to steem:session:', async () => {
    const client = makeClient();
    const { ctor, module } = await loadSessionModule(client);
    module.isRedisAvailable();
    expect(ctor).toHaveBeenCalledWith(
      expect.objectContaining({ keyPrefix: 'steem:session:' })
    );
  });

  it('still honors the deprecated REDIS_KEY_PREFIX', async () => {
    vi.stubEnv('REDIS_KEY_PREFIX', 'legacy');
    const client = makeClient();
    const { ctor, module } = await loadSessionModule(client);
    module.isRedisAvailable();
    expect(ctor).toHaveBeenCalledWith(
      expect.objectContaining({ keyPrefix: 'legacy' })
    );
  });

  it('REDIS_SESSION_KEY_PREFIX wins over the deprecated REDIS_KEY_PREFIX', async () => {
    vi.stubEnv('REDIS_KEY_PREFIX', 'legacy');
    vi.stubEnv('REDIS_SESSION_KEY_PREFIX', 'sess');
    const client = makeClient();
    const { ctor, module } = await loadSessionModule(client);
    module.isRedisAvailable();
    expect(ctor).toHaveBeenCalledWith(
      expect.objectContaining({ keyPrefix: 'sess' })
    );
  });
});

describe('lib/auth/redis-session error retirement (S9)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('REDIS_HOST', 'localhost');
  });

  afterEach(() => {
    vi.doUnmock('ioredis');
    vi.unstubAllEnvs();
  });

  it('quits the errored client and constructs a fresh one on the next call', async () => {
    const first = makeClient();
    const second = makeClient();
    let n = 0;
    const ctor = vi.fn(function MockRedis() {
      return n++ === 0 ? first : second;
    });
    vi.doMock('ioredis', () => ({ Redis: ctor }));
    const { isRedisAvailable } = await import('@/lib/auth/redis-session');

    isRedisAvailable(); // constructs `first` and registers its handlers
    expect(ctor).toHaveBeenCalledTimes(1);
    first.emit('error', new Error('connection lost'));
    // The errored instance is retired, not just dropped from the slot.
    expect(first.quit).toHaveBeenCalledTimes(1);
    expect(second.quit).not.toHaveBeenCalled();

    isRedisAvailable();
    expect(ctor).toHaveBeenCalledTimes(2);
  });

  it('falls back to disconnect() when graceful quit() rejects', async () => {
    const first = makeClient();
    first.quit.mockRejectedValueOnce(new Error('quit while offline'));
    // Regular function — the module constructs the client with `new`.
    const ctor = vi.fn(function MockRedis() {
      return first;
    });
    vi.doMock('ioredis', () => ({ Redis: ctor }));
    const { isRedisAvailable } = await import('@/lib/auth/redis-session');

    isRedisAvailable(); // construct + register handlers
    first.emit('error', new Error('connection lost'));
    // Give the rejected quit() promise a tick to reach its catch handler.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(ctor).toHaveBeenCalledTimes(1);
    isRedisAvailable();
    expect(ctor).toHaveBeenCalledTimes(2);
  });

  it("a stale client's error does not retire a newer instance", async () => {
    const first = makeClient();
    const second = makeClient();
    let n = 0;
    const ctor = vi.fn(function MockRedis() {
      return n++ === 0 ? first : second;
    });
    vi.doMock('ioredis', () => ({ Redis: ctor }));
    const { isRedisAvailable } = await import('@/lib/auth/redis-session');

    isRedisAvailable(); // constructs `first`
    first.emit('error', new Error('old client dies'));
    isRedisAvailable(); // constructs `second`, which is now the singleton

    // The retired client surfaces another (late) error: `second` must stay
    // the singleton, so no third construction happens.
    first.emit('error', new Error('late error from retired client'));
    isRedisAvailable();
    expect(ctor).toHaveBeenCalledTimes(2);
    expect(second.quit).not.toHaveBeenCalled();
  });
});
