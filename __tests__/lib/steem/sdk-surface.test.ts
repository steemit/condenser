import { describe, expect, it } from 'vitest';

import { steem } from '@steemit/steem-js';

/**
 * Pins the runtime SDK surface the narrowed Api view in
 * lib/steem/client.ts relies on.
 *
 * steem-js generates part of steem.api at import time from the RPC methods
 * registry (follow_api.get_following, ...), and those members are invisible
 * to TypeScript (they only exist through the Api index signature). If an
 * SDK upgrade drops a registry entry the view still types, the break would
 * otherwise surface only as a runtime "is not a function" in server paths.
 * The class-declared members are pinned too, so a rename on the SDK side
 * fails here instead of at the next deploy.
 */
describe('steem-js Api surface (lib/steem/client.ts view)', () => {
  it('exposes the registry-generated members the view types itself', () => {
    expect(typeof steem.api.getFollowingAsync).toBe('function');
    expect(typeof steem.api.getDynamicGlobalPropertiesAsync).toBe('function');
  });

  it('exposes the class-declared members the view borrows via Pick', () => {
    expect(typeof steem.api.setOptions).toBe('function');
    expect(typeof steem.api.getAccountsAsync).toBe('function');
    expect(typeof steem.api.call).toBe('function');
  });
});
