/**
 * Cryptographic utilities for posting-key-only authentication.
 *
 * Isomorphic module with two kinds of exports:
 * - Crypto operations (WIF validation, signing, key derivation) run in the
 *   browser login flow and go through the steem-js SDK high-level auth
 *   helpers (steem.auth.*). Do not drop down to the ecc classes (PrivateKey /
 *   PublicKey / Signature) — their API changed in steem-js 1.x and
 *   hand-rolled usage has broken login twice already.
 * - Pure predicates over posting-authority data (eligiblePostingPublicKeys)
 *   touch no crypto and no steem-js, and are shared by the LoginForm client
 *   check and the /api/auth/login route so the two sides cannot drift.
 */

import { steem } from '@steemit/steem-js';

export interface KeyValidationResult {
  isValid: boolean;
  publicKey?: string;
  error?: string;
}

export interface SignatureResult {
  signature: string;
  publicKey: string;
  data: string;
}

/**
 * Posting authority shape as returned by condenser_api.get_accounts.
 */
export interface PostingAuthority {
  weight_threshold?: number;
  key_auths?: Array<[string, number]>;
}

/**
 * Extract the posting public keys that, on their own, satisfy the
 * authority's weight threshold.
 *
 * Shared by the LoginForm client check and the /api/auth/login route so the
 * two sides cannot drift apart (audit S4).
 *
 * Legacy parity (condenser-legacy src/app/redux/AuthSaga.js pubkeyThreshold
 * + authStr): login with a single WIF grants "full" posting authority iff
 * the summed weights of the matching key_auths entries reach
 * weight_threshold. Since login always presents exactly one WIF, that sum
 * reduces to the weight of the one matched entry — so "listed AND weight >=
 * threshold" is the exact legacy semantics for this codepath. A listed key
 * with a weight below the threshold (e.g. a weight=0 entry, which the chain
 * does not forbid) must be rejected: legacy would classify it as
 * 'partial'/'none' and refuse the login.
 *
 * Known divergences from legacy (deliberate, documented for future work):
 *
 * - account_auths is not considered. Legacy threshold() recursed into
 *   account_auths, so a login key could reach 'full' by combining its own
 *   weight with weights reachable through sub-account authorities. This
 *   predicate ignores account_auths entirely, so the rare authority whose
 *   threshold is only reachable via key_auths + account_auths combined is
 *   rejected here — a fail-closed divergence from legacy 'full'. Full
 *   alignment would require recursive account resolution on the login-route
 *   side (deferred).
 *
 * - The sum-to-single-entry equivalence above assumes the same pubkey never
 *   appears in key_auths more than once. On-chain authority storage dedupes
 *   key_auths entries, so duplicate entries are practically unreachable;
 *   if one ever did appear, this predicate would evaluate each entry's own
 *   weight (effectively max per pubkey) rather than the legacy sum across
 *   duplicates.
 *
 * weight_threshold falls back to 1 when absent, 0, or any non-safe-integer
 * (NaN / Infinity / fractional / beyond 2^53 — unreachable from the chain's
 * uint32), matching the deleted check-authority route
 * (`weight >= (authority.weight_threshold || 1)`) and the threshold-1
 * authorities every standard wallet/signup produces. A threshold of 0 is
 * treated as 1 (fail closed) rather than vacuously satisfiable.
 */
export function eligiblePostingPublicKeys(
  posting: PostingAuthority | null | undefined
): string[] {
  // Only a positive safe integer is honored as the threshold; every other
  // shape (absent, 0, NaN, Infinity, fractional, beyond 2^53 — unreachable
  // from the chain's uint32) snaps to the fail-closed default of 1 instead
  // of feeding a malformed bound into the weight comparison
  // (defense in depth).
  const rawThreshold = Number(posting?.weight_threshold);
  const threshold =
    Number.isSafeInteger(rawThreshold) && rawThreshold > 0 ? rawThreshold : 1;
  const keyAuths = posting?.key_auths;
  if (!Array.isArray(keyAuths)) return [];
  return keyAuths
    .filter((auth) => Number(auth?.[1]) >= threshold)
    .map((auth) => String(auth[0]));
}

/**
 * Validate if a private key is valid and matches any of the expected
 * posting public keys
 */
export function validatePostingKey(
  privateKeyWif: string,
  expectedPostingPublicKey: string | string[]
): KeyValidationResult {
  try {
    if (!steem.auth.isWif(privateKeyWif)) {
      return {
        isValid: false,
        error: 'Invalid private key format',
      };
    }

    const publicKeyString = steem.auth.wifToPublic(privateKeyWif);

    // Check if it matches any expected posting public key (accounts may
    // carry several posting keys — see eligiblePostingPublicKeys)
    const expectedKeys = Array.isArray(expectedPostingPublicKey)
      ? expectedPostingPublicKey
      : [expectedPostingPublicKey];
    if (!expectedKeys.includes(publicKeyString)) {
      return {
        isValid: false,
        error: 'Private key does not match any eligible posting public key for this account',
      };
    }

    return {
      isValid: true,
      publicKey: publicKeyString,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid private key format';
    return {
      isValid: false,
      error: errorMessage,
    };
  }
}

/**
 * Sign authentication data with private key
 * Data must include username for security
 */
export function signAuthData(
  privateKeyWif: string,
  username: string,
  challenge: string,
  timestamp: number = Date.now()
): SignatureResult {
  try {
    const publicKey = steem.auth.wifToPublic(privateKeyWif);

    // Create authentication data that includes username
    const authData = {
      username,
      challenge,
      timestamp,
      action: 'login',
    };

    const dataString = JSON.stringify(authData);

    // steem.auth.sign() SHA-256 hashes the utf-8 message and returns the
    // hex signature; the server verifies with verifySignature() over the
    // same string (both are steem.auth helpers, so the hashing convention
    // cannot drift apart).
    const signature = steem.auth.sign(dataString, privateKeyWif);

    return {
      signature,
      publicKey,
      data: dataString,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to sign auth data: ${errorMessage}`);
  }
}

/**
 * Derive private key from password (for master password login)
 * Only supports posting key derivation for security
 */
export function derivePostingKey(username: string, password: string): string {
  try {
    return steem.auth.toWif(username, password, 'posting');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to derive posting key: ${errorMessage}`);
  }
}

/**
 * Check if a string looks like a WIF private key
 */
export function isWifFormat(key: string): boolean {
  return steem.auth.isWif(key);
}

/**
 * Check if a string looks like a public key
 */
export function isPublicKeyFormat(key: string): boolean {
  // steem.auth.isPubkey validates the STM-prefixed public key format and
  // returns false (never throws) for WIFs and garbage input.
  return steem.auth.isPubkey(key);
}

/**
 * Verify signature (client-side verification for testing)
 */
export function verifySignature(
  signature: string,
  data: string,
  publicKey: string
): boolean {
  try {
    return steem.auth.verifySignature(data, signature, publicKey);
  } catch {
    return false;
  }
}
