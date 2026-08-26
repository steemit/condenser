/**
 * Client-side cryptographic utilities
 * Handles private key validation and signing operations
 * Only supports posting key authentication for security
 */

// Import steem object directly as a named export
import { steem } from '@steemit/steem-js';

// Import types directly from dist (these are TypeScript definition files)
// @ts-expect-error - TypeScript can't resolve these paths, but they exist at runtime
import type { PrivateKey } from '@steemit/steem-js/dist/auth/ecc/src/key_private';
// @ts-expect-error - TypeScript can't resolve these paths, but they exist at runtime
import type { PublicKey } from '@steemit/steem-js/dist/auth/ecc/src/key_public';
// @ts-expect-error - TypeScript can't resolve these paths, but they exist at runtime
import type { Signature } from '@steemit/steem-js/dist/auth/ecc/src/signature';

// Get classes from steem object at runtime
// Use type aliases for cleaner code
const PrivateKey = steem.auth.PrivateKey;
const PublicKey = steem.auth.PublicKey;
const Signature = steem.auth.Signature;

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
    // Parse the private key
    const privateKey = PrivateKey.fromWif(privateKeyWif);
    
    // Generate public key from private key
    const publicKey = privateKey.toPublicKey();
    const publicKeyString = publicKey.toString();
    
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
    const privateKey = PrivateKey.fromWif(privateKeyWif);
    const publicKey = privateKey.toPublicKey().toString();
    
    // Create authentication data that includes username
    const authData = {
      username,
      challenge,
      timestamp,
      action: 'login',
    };
    
    const dataString = JSON.stringify(authData);
    
    // Sign the data. steem-js 1.x removed PrivateKey.sign(); signing is a
    // static Signature.sign(string, key) which SHA-256 hashes the utf-8
    // string internally (server verifies with verifyBuffer over the same
    // bytes).
    const signature = Signature.sign(dataString, privateKey);
    
    return {
      signature: signature.toHex(),
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
    const privateKey = PrivateKey.fromSeed(username + 'posting' + password);
    return privateKey.toString();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to derive posting key: ${errorMessage}`);
  }
}

/**
 * Check if a string looks like a WIF private key
 */
export function isWifFormat(key: string): boolean {
  try {
    PrivateKey.fromWif(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string looks like a public key
 */
export function isPublicKeyFormat(key: string): boolean {
  try {
    // steem-js 1.x returns null instead of throwing for non-public-key
    // input (e.g. a WIF), so a bare try/catch misclassifies every key.
    return PublicKey.fromString(key) != null;
  } catch {
    return false;
  }
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
    const sig = Signature.fromHex(signature);
    const pubKey = PublicKey.fromString(publicKey);
    if (!pubKey) {
      // steem-js 1.x returns null for invalid public key strings
      return false;
    }

    // verifyHash requires a 32-byte digest; verifyBuffer hashes the raw
    // data with SHA-256 first, matching Signature.sign() on the signer side.
    return sig.verifyBuffer(Buffer.from(data, 'utf8'), pubKey);
  } catch {
    return false;
  }
}
