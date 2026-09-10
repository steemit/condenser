/**
 * Client-side image upload to the Steemit image hoster.
 * Mirrors legacy UserSaga.js uploadImage: the client signs
 * sha256('ImageSigningChallenge' || file bytes) with the posting key and
 * POSTs multipart form-data to {uploadUrl}/{username}/{signature}.
 * The returned URL is served by the first-party image hoster, which is what
 * the official site can display (third-party image hosts are not proxied).
 */

import { steem } from '@steemit/steem-js';
import { getCachedKey, decryptAndRetrieveKey } from '@/lib/crypto/key-storage';

const DEFAULT_UPLOAD_URL = 'https://steemitimages.com';

// Runtime config, inlined into the SSR HTML by the root layout from
// SDC_UPLOAD_IMAGE_URL (legacy $STM_Config.upload_image parity). Read at
// call time, never baked into the bundle — published images stay
// environment-agnostic (same rationale as the GA id injection).
function uploadBaseUrl(): string {
  const url =
    (globalThis as { __SDC_UPLOAD_IMAGE_URL__?: string })
      .__SDC_UPLOAD_IMAGE_URL__ || DEFAULT_UPLOAD_URL;
  return url.replace(/\/+$/, '');
}

/**
 * Upload an image file for `username`. Returns the hosted image URL.
 * Requires the posting key in client key storage (logged-in session).
 */
export async function uploadImage(file: File, username: string): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please insert only image files.');
  }
  const key = getCachedKey() ?? (await decryptAndRetrieveKey())?.privateKey;
  if (!key) {
    throw new Error('Private key not available. Please login again.');
  }

  const data = Buffer.from(await file.arrayBuffer());
  // The constant prefix proves the client intended an image-hosting upload,
  // so the server cannot trick it into signing something else (legacy parity).
  const challenge = Buffer.concat([Buffer.from('ImageSigningChallenge'), data]);
  // The challenge is binary, so the string-based steem.auth.sign() helper does
  // not apply; use the Signature class the SDK exposes through steem.auth.
  // signBuffer() sha256-hashes internally, identical to legacy's
  // signBufferSha256(sha256(challenge)).
  const signature = steem.auth.Signature.signBuffer(challenge, key).toHex();

  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${uploadBaseUrl()}/${username}/${signature}`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error || `Upload failed (${res.status})`);
  }
  return json.url as string;
}
