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
 * Validate if a private key is valid and matches the expected posting public key
 */
export function validatePostingKey(
  privateKeyWif: string,
  expectedPostingPublicKey: string
): KeyValidationResult {
  try {
    if (!steem.auth.isWif(privateKeyWif)) {
      return {
        isValid: false,
        error: 'Invalid private key format',
      };
    }

    const publicKeyString = steem.auth.wifToPublic(privateKeyWif);

    // Check if it matches the expected posting public key
    if (publicKeyString !== expectedPostingPublicKey) {
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
