import { URL } from 'url';

// Fixed parse base: any same-origin target must resolve to this origin.
const BASE = 'https://steemit.com';

/**
 * Validate redirect targets produced from user-controlled urls.
 *
 * The ch=/cn=/r= middleware in server.js strips session params and
 * redirects to the remaining path. A stripped url like `//evil.com`
 * is protocol-relative and would send the user to an external host
 * (open redirect), so only same-origin relative paths may pass.
 *
 * Validation uses the WHATWG URL parser — the same algorithm
 * browsers use to resolve the Location header — instead of literal
 * string checks. Regexes on the raw token miss forms the browser
 * still treats as an authority switch, e.g. `/\evil.com` or
 * `//evil.com` with tab/newline sprinkled in: backslashes and
 * control chars are normalized before parsing, so a raw `\` acts
 * exactly like a second `/`. Parsing against a fixed base and
 * comparing origins rejects every authority-override form while
 * accepting any rooted same-origin path (encoded characters such
 * as `/%2F%2Fevil.com` stay plain path content on this host).
 */
export default function isSafeRedirectTarget(raw) {
    if (!raw || typeof raw !== 'string') return false;
    // Must be a rooted relative path — rejects absolute urls and
    // bare schemes (`http:...`, `javascript:...`, `%2F%2F...`).
    if (raw[0] !== '/') return false;
    let url;
    try {
        url = new URL(raw, BASE);
    } catch (e) {
        return false;
    }
    return url.origin === BASE;
}
