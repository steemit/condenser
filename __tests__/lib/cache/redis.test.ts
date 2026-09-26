// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * cacheDeleteByPrefix SCAN/DEL wire contract. ioredis is mocked wholesale —
 * these tests pin how the prefix is namespaced and turned into a MATCH
 * pattern, how cursors are followed and how deletes are batched, not Redis
 * itself. Each test imports a fresh module (vi.resetModules) so the
 * module-level client singleton never leaks between cases.
 */

/** One SCAN page: [nextCursor, matchedKeys]. */
type ScanPage = [cursor: string, keys: string[]];

function makeRedisClient(pages: ScanPage[]) {
  const remaining = [...pages];
  const scan = vi.fn(async () => remaining.shift() ?? ['0', []]);
  const del = vi.fn(async () => 0);
  // getRedis registers error/close listeners before returning the client.
  const client = { scan, del, on: vi.fn() };
  return { client, scan, del };
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

describe('lib/cache/redis cacheDeleteByPrefix', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock('ioredis');
    vi.unstubAllEnvs();
  });

  it('scans under the condenser: namespace, batches DEL per page, follows the cursor', async () => {
    const { client, scan, del } = makeRedisClient([
      [
        '17',
        [
          'condenser:steem:communities:trending::20',
          'condenser:steem:communities:ranked::20',
        ],
      ],
      ['0', ['condenser:steem:communities:created::50']],
    ]);
    const { cacheDeleteByPrefix } = await loadRedisModule(client);

    await cacheDeleteByPrefix('steem:communities:');

    // Contract: MATCH pattern = namespaced prefix + '*', COUNT 100 per
    // iteration, next iteration starts from the returned cursor.
    expect(scan).toHaveBeenNthCalledWith(
      1,
      '0',
      'MATCH',
      'condenser:steem:communities:*',
      'COUNT',
      100
    );
    expect(scan).toHaveBeenNthCalledWith(
      2,
      '17',
      'MATCH',
      'condenser:steem:communities:*',
      'COUNT',
      100
    );
    // DEL is batched per page (spread args) over the already-namespaced
    // keys SCAN returned — no empty DEL when a page matches nothing.
    expect(del).toHaveBeenNthCalledWith(
      1,
      'condenser:steem:communities:trending::20',
      'condenser:steem:communities:ranked::20'
    );
    expect(del).toHaveBeenNthCalledWith(
      2,
      'condenser:steem:communities:created::50'
    );
    expect(del).toHaveBeenCalledTimes(2);
  });

  it('passes the prefix into the MATCH pattern verbatim — glob sanitization is the CALLER\'s job', async () => {
    // redis.ts has NO metacharacter defense: the pattern is
    // `${redisKey(prefix)}*` as-is, so an unsanitized prefix (here 'evil*')
    // widens the sweep. The broadcast route's ACCOUNT_KEY_RE gate exists
    // precisely because of this pass-through contract.
    const { client, scan, del } = makeRedisClient([['0', []]]);
    const { cacheDeleteByPrefix } = await loadRedisModule(client);

    await cacheDeleteByPrefix('evil*');

    expect(scan).toHaveBeenCalledWith(
      '0',
      'MATCH',
      'condenser:evil**',
      'COUNT',
      100
    );
    expect(del).not.toHaveBeenCalled();
  });

  it('is a no-op (never constructs ioredis) when REDIS_URL is unset', async () => {
    const ctor = vi.fn();
    vi.doMock('ioredis', () => ({ default: ctor }));
    vi.stubEnv('REDIS_URL', '');
    const { cacheDeleteByPrefix } = await import('@/lib/cache/redis');

    await cacheDeleteByPrefix('steem:communities:');

    expect(ctor).not.toHaveBeenCalled();
  });
});
