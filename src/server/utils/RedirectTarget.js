/**
 * Validate redirect targets produced from user-controlled urls.
 *
 * The ch=/cn=/r= middleware in server.js strips session params and
 * redirects to the remaining path. A stripped url like `//evil.com`
 * is protocol-relative and would send the user to an external host
 * (open redirect), so only same-origin relative paths may pass.
 *
 * The target is decoded once before testing to also reject encoded
 * bypasses such as `%2F%2Fevil.com` or `/%2F%2Fevil.com`, and any
 * scheme-prefixed form (`http:`, `javascript:`, ...) is rejected.
 * Kept dependency-free on purpose: unit tests import this module
 * directly without booting the whole server (config/steem-js chain).
 */
export default function isSafeRedirectTarget(raw) {
    if (!raw || typeof raw !== 'string') return false;
    const token = raw;
    let decoded = token;
    try {
        // decodeURIComponent throws on malformed sequences
        decoded = decodeURIComponent(token);
    } catch (e) {
        decoded = token;
    }
    // Disallow absolute/scheme-prefixed targets like 'http:' or 'https:'
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) return false;
    // Disallow protocol-relative '//' (decoded or raw)
    if (/^\/\//.test(decoded) || /^\/\//.test(token)) return false;
    // Only allow same-origin relative paths starting with a single '/'
    return /^\/(?!\/)/.test(decoded);
}
