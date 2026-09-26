// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { steem } from '@steemit/steem-js';
import {
  isWifFormat,
  isPublicKeyFormat,
  signAuthData,
  verifySignature,
  eligiblePostingPublicKeys,
  validatePostingKey,
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

describe('eligiblePostingPublicKeys', () => {
  // Legacy parity (audit S4): AuthSaga pubkeyThreshold matched the login
  // WIF against every key_auths entry (never only [0]) and required the
  // matching key's weight to reach weight_threshold.
  it('returns every listed key when all weights meet the threshold', () => {
    expect(
      eligiblePostingPublicKeys({
        weight_threshold: 1,
        key_auths: [
          ['STMkey1', 1],
          ['STMkey2', 1],
        ],
      })
    ).toEqual(['STMkey1', 'STMkey2']);
  });

  it('keeps a high-weight key among several posting keys', () => {
    expect(
      eligiblePostingPublicKeys({
        weight_threshold: 2,
        key_auths: [
          ['STMkey1', 2],
          ['STMkey2', 1],
        ],
      })
    ).toEqual(['STMkey1']);
  });

  it('drops weight=0 entries (chain does not forbid them, legacy rejects them)', () => {
    expect(
      eligiblePostingPublicKeys({
        weight_threshold: 1,
        key_auths: [
          ['STMkey1', 1],
          ['STMkey2', 0],
        ],
      })
    ).toEqual(['STMkey1']);
  });

  it('drops multi-sig keys that cannot reach the threshold alone', () => {
    // threshold=2, two weight-1 keys: one key alone is only 'partial' in
    // legacy authStr semantics, so neither is login-eligible.
    expect(
      eligiblePostingPublicKeys({
        weight_threshold: 2,
        key_auths: [
          ['STMkey1', 1],
          ['STMkey2', 1],
        ],
      })
    ).toEqual([]);
  });

  it('falls back to threshold 1 when weight_threshold is missing or 0', () => {
    // check-authority route parity: `weight >= (authority.weight_threshold || 1)`.
    expect(eligiblePostingPublicKeys({ key_auths: [['STMkey1', 1]] })).toEqual(['STMkey1']);
    expect(
      eligiblePostingPublicKeys({
        weight_threshold: 0,
        key_auths: [['STMkey1', 1]],
      })
    ).toEqual(['STMkey1']);
  });

  it('returns [] for missing/empty key_auths and non-finite weights', () => {
    expect(eligiblePostingPublicKeys(undefined)).toEqual([]);
    expect(eligiblePostingPublicKeys({})).toEqual([]);
    expect(eligiblePostingPublicKeys({ weight_threshold: 1, key_auths: [] })).toEqual([]);
    expect(
      eligiblePostingPublicKeys({
        weight_threshold: 1,
        key_auths: [['STMkey1', Number.NaN]],
      })
    ).toEqual([]);
  });
});

describe('validatePostingKey with multiple expected keys', () => {
  const other = steem.auth.PrivateKey.fromSeed('condenser-crypto-multi-other');
  const OTHER_PUB = other.toPublicKey().toString();

  it('accepts a WIF matching the second key of a multi-key account', () => {
    expect(validatePostingKey(WIF, [OTHER_PUB, PUB]).isValid).toBe(true);
  });

  it('accepts a WIF matching the first key (string overload unchanged)', () => {
    expect(validatePostingKey(WIF, PUB).isValid).toBe(true);
  });

  it('rejects a WIF matching none of the expected keys', () => {
    const result = validatePostingKey(WIF, [OTHER_PUB, 'STMthird key']);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('does not match');
  });
});
