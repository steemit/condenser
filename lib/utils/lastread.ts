/**
 * Parse a last-read marker (or notification date) as UTC milliseconds.
 *
 * Hivemind's bridge.unread_notifications and account_notifications return
 * 'YYYY-MM-DD HH:MM:SS' while the setLastRead broadcast sends
 * 'YYYY-MM-DDTHH:MM:SS' — both naive UTC. Date.parse would read a
 * designator-less timestamp as local time (and strict engines like Safari
 * reject the space-separated form outright, yielding NaN), so normalize
 * before parsing. Anything unparseable (non-string, empty, garbage) maps to
 * 0 so callers can treat it as "no marker".
 */

// Only a TRAILING designator counts: an unanchored [zZ] would also match a
// 'z' in the middle of the string, flipping it into the
// already-offset-carrying branch where lenient engines parse it as local
// time. Same anchoring as TimeAgo's date handling.
const HAS_OFFSET_RE = /[zZ]$|[+-]\d{2}:?\d{2}$/;

export function lastreadTimeMs(value: unknown): number {
  if (typeof value !== 'string' || value === '') return 0;
  const normalized = HAS_OFFSET_RE.test(value)
    ? value.replace(' ', 'T')
    : `${value.replace(' ', 'T')}Z`;
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? 0 : ms;
}
