// `url` core module import for Node 8.x compatibility: the global
// URL binding only exists from Node 10 on, while package.json engines
// declares `node >= 8.7.0`.
import { URL } from 'url';

// Parsing anchor for the same-origin check below. Fixed on purpose,
// never derived from the request:
// - The ch=/cn=/r= middleware only ever redirects to the remainder
//   of the request path after stripping session params — always a
//   rooted relative path. Such paths resolve to whatever base they
//   are parsed against, so this constant never rejects legitimate
//   traffic on staging/local; it is only a parsing anchor used to
//   detect authority overrides (`//`, `/\`, embedded control chars).
// - Deriving it from the request Host header would be wrong: Host is
//   attacker-controllable, and "same-origin" measured against a
//   spoofable value would re-open the bug this module closes.
const BASE = 'https://steemit.com';

// Compare origins, not raw strings: URL.origin is always normalized
// (lowercase scheme/host, default port dropped), so a future BASE
// edit — trailing slash, cased host — cannot silently break the
// comparison.
const BASE_ORIGIN = new URL(BASE).origin;

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
 *
 * Parser contract: Node's WHATWG URL (imported from the `url` core
 * module — global only from Node 10, engines declares >= 8.7.0)
 * implements the same URL Standard browsers apply when resolving
 * the Location header, so "origin === BASE_ORIGIN" here means the
 * browser provably stays on this host. The unit tests pin that
 * equivalence (backslash, encoded, control-char and query/fragment
 * forms) so a future parser divergence or a runtime without a
 * compliant URL fails loudly instead of silently re-opening the
 * redirect.
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
    return url.origin === BASE_ORIGIN;
}
