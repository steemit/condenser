// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { steem } from '@steemit/steem-js';
import {
  isWifFormat,
  isPublicKeyFormat,
  signAuthData,
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

describe('signAuthData / verifySignature roundtrip', () => {
  // Regression: steem-js 1.x removed PrivateKey.sign() (signing is now the
  // static Signature.sign(string, key)) and verifyHash() requires a 32-byte
  // digest (raw data must go through verifyBuffer). The old calls made every
  // login fail with "s.sign is not a function" / a verifyHash length throw.
  it('signs auth data and verifies it against the derived public key', () => {
    const result = signAuthData(WIF, 'testuser', 'challenge-123', 1700000000000);

    expect(result.publicKey).toBe(PUB);
    const authData = JSON.parse(result.data);
    expect(authData).toEqual({
      username: 'testuser',
      challenge: 'challenge-123',
      timestamp: 1700000000000,
      action: 'login',
    });
    expect(verifySignature(result.signature, result.data, result.publicKey)).toBe(true);
  });

  it('rejects a signature over tampered data', () => {
    const result = signAuthData(WIF, 'testuser', 'challenge-123', 1700000000000);
    const tampered = result.data.replace('challenge-123', 'challenge-456');
    expect(verifySignature(result.signature, tampered, result.publicKey)).toBe(false);
  });

  it('rejects verification against a different public key', () => {
    const other = steem.auth.PrivateKey.fromSeed('condenser-crypto-client-other');
    const result = signAuthData(WIF, 'testuser', 'challenge-123', 1700000000000);
    expect(verifySignature(result.signature, result.data, other.toPublicKey().toString())).toBe(false);
  });
});
