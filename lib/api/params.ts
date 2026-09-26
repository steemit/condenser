/**
 * Shared query/body param parsing helpers for API routes.
 *
 * clampIntParam previously existed as four identical inline copies across
 * the communities / followers / following / search routes (#4040's pattern);
 * they now import it from here so new routes (posts) share one definition.
 *
 * Semantics: non-numeric values fall back to the default rather than being
 * rejected — these clamps exist to keep cache keys and RPC payloads bounded
 * (audit N-21: unbounded params spray one Redis key per variant), not to
 * police clients. Value whitelists (sorts, types) stay per-route and 400.
 */

/** Parse and clamp an integer query param; non-numeric values fall back. */
export function clampIntParam(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Clamp an integer field that arrives as a JSON body value (already typed).
 * Non-finite/non-number values fall back, like clampIntParam.
 */
export function clampNumberParam(
  raw: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = typeof raw === 'number' && Number.isFinite(raw) ? raw : NaN;
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
}
