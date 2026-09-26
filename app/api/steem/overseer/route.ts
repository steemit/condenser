/**
 * Steem API Route: overseer relay
 * POST /api/steem/overseer
 *
 * Legacy condenser called `overseer.collect` directly from the browser via
 * steem-js. Since steem-js is server-only in the rewrite, the client-side
 * analytics helpers (lib/analytics/overseer.ts) POST the collect payload
 * here and this route forwards it to the node. Analytics is best-effort:
 * relay failures are logged and always answered 204 so the client UI is
 * never affected.
 *
 * Payload shape validation (audit N-25): the relay used to forward ANY
 * parseable JSON to the node. Only the exact shapes the client helpers
 * emit are accepted now — everything else is a 400 (see
 * lib/analytics/overseer.ts for the producer side):
 *   ['custom', { measurement, tags?: {…primitives}, fields?: {…primitives} }]
 *   ['ad',     { trackingId, adTag, version }]
 */

import { NextRequest, NextResponse } from 'next/server';
import { callSteemApi } from '@/lib/steem/client';
import { enforceBodyLimit } from '@/lib/api/body-limit';
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';

const MEASUREMENT_RE = /^[a-z_]{1,64}$/;
const TRACKING_ID_RE = /^[a-zA-Z0-9-]{1,64}$/;
const AD_TAG_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const VERSION_RE = /^[a-z0-9.]{1,16}$/;
const FIELD_KEY_RE = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
const MAX_KEYS_PER_MAP = 32;
// recordActivityTracker sends document.referrer / navigator.userAgent in
// fields — real-world values reach well past 512 chars, so cap at 2KB.
const MAX_STRING_VALUE = 2048;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value)
  );
}

/** Primitive map as sent in custom tags/fields: bounded keys + values. */
function isBoundedPrimitiveMap(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  if (keys.length > MAX_KEYS_PER_MAP) return false;
  return keys.every((key) => {
    if (!FIELD_KEY_RE.test(key)) return false;
    const v = value[key];
    if (v === undefined || v === null) return true;
    if (typeof v === 'number') return Number.isFinite(v);
    if (typeof v === 'boolean') return true;
    return typeof v === 'string' && v.length <= MAX_STRING_VALUE;
  });
}

/**
 * Validate a collect payload against the shapes the client emits
 * (lib/analytics/overseer.ts collect() calls).
 */
function isValidCollectPayload(payload: unknown): boolean {
  if (!Array.isArray(payload) || payload.length !== 2) return false;
  const [kind, data] = payload;
  if (kind !== 'custom' && kind !== 'ad') return false;
  if (!isPlainObject(data)) return false;

  if (kind === 'custom') {
    // recordRouteTag / userActionRecord / recordActivityTracker shape.
    const keys = Object.keys(data);
    if (
      keys.some((k) => k !== 'measurement' && k !== 'tags' && k !== 'fields')
    ) {
      return false;
    }
    if (
      typeof data.measurement !== 'string' ||
      !MEASUREMENT_RE.test(data.measurement)
    ) {
      return false;
    }
    if (data.tags !== undefined && !isBoundedPrimitiveMap(data.tags)) {
      return false;
    }
    if (data.fields !== undefined && !isBoundedPrimitiveMap(data.fields)) {
      return false;
    }
    return true;
  }

  // recordAdsView shape.
  const keys = Object.keys(data);
  if (keys.some((k) => !['trackingId', 'adTag', 'version'].includes(k))) {
    return false;
  }
  return (
    typeof data.trackingId === 'string' &&
    TRACKING_ID_RE.test(data.trackingId) &&
    typeof data.adTag === 'string' &&
    AD_TAG_RE.test(data.adTag) &&
    typeof data.version === 'string' &&
    VERSION_RE.test(data.version)
  );
}

export async function POST(request: NextRequest) {
  // Abuse wrappers (audit N-08): rate limit before reading the body, then
  // the body size cap. Higher ceiling than other endpoints (analytics fire
  // on every navigation) but still bounded.
  const rateLimit = await checkRateLimit(request, RATE_LIMITS.steemOverseer);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  // Read with the size cap, then parse in-route (not readJsonWithLimit):
  // that helper answers 400 'invalid JSON' — the right contract for the
  // auth/search/broadcast routes — while analytics deliberately keeps a 204
  // for unparseable bodies (best-effort; the client never reads the error).
  const limited = await enforceBodyLimit(request);
  if (!limited.ok) {
    return limited.response;
  }

  let parseFailed = false;
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(limited.bytes));
  } catch {
    parseFailed = true;
  }

  // Shape gate (audit N-25): a parseable but malformed payload is a 400,
  // not a silent relay — arbitrary JSON must not reach the node through
  // the analytics relay. An UNPARSEABLE body is still dropped with 204
  // (analytics is best-effort; the client never reads the error).
  if (!parseFailed && !isValidCollectPayload(payload)) {
    return NextResponse.json(
      { error: 'Malformed analytics payload' },
      { status: 400 }
    );
  }

  try {
    // Relay failures stay best-effort: logged, always answered 204.
    if (!parseFailed) {
      await callSteemApi('overseer.collect', payload);
    }
  } catch (error) {
    console.warn('overseer relay error:', error);
  }
  return new NextResponse(null, { status: 204 });
}
