/**
 * Default image-upload endpoint (legacy $STM_Config.upload_image fallback).
 *
 * Shared leaf constant so the two consumers cannot drift apart:
 *  - lib/media/upload-image.ts falls back to it client-side when
 *    SDC_UPLOAD_IMAGE_URL is unset (legacy UserSaga.js uploadImage parity);
 *  - lib/csp.ts derives the connect-src entry for the upload endpoint from
 *    it under the same condition — otherwise the fallback upload would be
 *    blocked by the CSP that is supposed to allow it.
 *
 * Lives in its own dependency-free module because the CSP builder runs on
 * the server (proxy.ts) while the upload helper is a client module pulling
 * in key storage and steem-js — importing one from the other would drag
 * client code into the proxy bundle.
 */
export const DEFAULT_UPLOAD_URL = 'https://steemitimages.com';
