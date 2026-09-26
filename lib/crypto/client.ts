/**
 * Client-side cryptographic utilities
 * Handles private key validation and signing operations
 * Only supports posting key authentication for security
 *
 * All operations go through the steem-js SDK high-level auth helpers
 * (steem.auth.*). Do not drop down to the ecc classes (PrivateKey /
 * PublicKey / Signature) — their API changed in steem-js 1.x and
 * hand-rolled usage has broken login twice already.
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
 * weight_threshold falls back to 1 when absent or 0, matching the deleted
 * check-authority route (`weight >= (authority.weight_threshold || 1)`) and
 * the threshold-1 authorities every standard wallet/signup produces. A
 * threshold of 0 is treated as 1 (fail closed) rather than vacuously
 * satisfiable.
 */
export function eligiblePostingPublicKeys(
  posting: PostingAuthority | null | undefined
): string[] {
  const rawThreshold = Number(posting?.weight_threshold);
  const threshold =
    Number.isFinite(rawThreshold) && rawThreshold > 0 ? rawThreshold : 1;
  const keyAuths = posting?.key_auths;
  if (!Array.isArray(keyAuths)) return [];
  return keyAuths
    .filter((auth) => Number(auth?.[1]) >= threshold)
    .map((auth) => String(auth[0]));
}

/**
 * Validate if a private key is valid and matches the expected posting public key
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
        error: 'Private key does not match the posting public key for this account',
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
