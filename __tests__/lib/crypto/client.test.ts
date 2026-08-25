// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { steem } from '@steemit/steem-js';
import {
  isWifFormat,
  isPublicKeyFormat,
  verifySignature,
} from '@/lib/crypto/client';

// Deterministic key pair generated from a seed (never used on-chain)
const key = steem.auth.PrivateKey.fromSeed('condenser-crypto-client-test');
const WIF = key.toWif();
const PUB = key.toPublicKey().toString();

describe('isWifFormat', () => {
  it('accepts a valid WIF private key', () => {
    expect(isWifFormat(WIF)).toBe(true);
  });

  it('rejects a public key', () => {
    expect(isWifFormat(PUB)).toBe(false);
  });

  it('rejects garbage', () => {
    expect(isWifFormat('not-a-key')).toBe(false);
  });
});

describe('isPublicKeyFormat', () => {
  // Regression: steem-js 1.x PublicKey.fromString returns null instead of
  // throwing for non-public-key input, so a bare try/catch misclassified
  // every valid WIF as a public key and blocked all logins.
  it('rejects a valid WIF private key (must not be seen as public key)', () => {
    expect(isPublicKeyFormat(WIF)).toBe(false);
  });

  it('accepts a valid STM public key', () => {
    expect(isPublicKeyFormat(PUB)).toBe(true);
  });

  it('rejects garbage', () => {
    expect(isPublicKeyFormat('not-a-key')).toBe(false);
  });
});

describe('verifySignature', () => {
  it('returns false for a null-yielding (invalid) public key string', () => {
    expect(verifySignature('00'.repeat(33), 'data', 'not-a-key')).toBe(false);
  });
});
