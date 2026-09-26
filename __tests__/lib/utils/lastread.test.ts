import { describe, expect, it } from 'vitest';

import { lastreadTimeMs } from '@/lib/utils/lastread';

describe('lastreadTimeMs', () => {
  describe('hivemind / client formats', () => {
    it('parses the space-separated hivemind form as UTC', () => {
      expect(lastreadTimeMs('2026-09-26 10:00:00')).toBe(
        Date.UTC(2026, 8, 26, 10, 0, 0)
      );
    });

    it('parses the naive-T client form (setLastRead broadcast) as UTC', () => {
      expect(lastreadTimeMs('2026-09-26T10:00:00')).toBe(
        lastreadTimeMs('2026-09-26 10:00:00')
      );
    });

    it('passes a trailing Z/z designator through without appending another', () => {
      expect(lastreadTimeMs('2026-09-26T10:00:00Z')).toBe(
        Date.UTC(2026, 8, 26, 10, 0, 0)
      );
      expect(lastreadTimeMs('2026-09-26T10:00:00.123z')).toBe(
        Date.UTC(2026, 8, 26, 10, 0, 0) + 123
      );
    });

    it('honors numeric UTC offsets', () => {
      expect(lastreadTimeMs('2026-09-26T10:00:00+05:30')).toBe(
        Date.UTC(2026, 8, 26, 4, 30, 0)
      );
      expect(lastreadTimeMs('2026-09-26 10:00:00-05:00')).toBe(
        Date.UTC(2026, 8, 26, 15, 0, 0)
      );
    });
  });

  describe('malformed input', () => {
    it('maps non-strings and the empty string to 0', () => {
      expect(lastreadTimeMs('')).toBe(0);
      expect(lastreadTimeMs(null)).toBe(0);
      expect(lastreadTimeMs(undefined)).toBe(0);
      expect(lastreadTimeMs(1790416800000)).toBe(0);
    });

    it('maps garbage to 0', () => {
      expect(lastreadTimeMs('garbage')).toBe(0);
    });

    it('parses a half date as UTC midnight of that day', () => {
      // 'YYYY-MM-DD' is the shortest form engines agree to read as UTC; the
      // helper keeps that convention by appending the designator.
      expect(lastreadTimeMs('2026-09-26')).toBe(Date.UTC(2026, 8, 26));
    });

    it('treats a mid-string z as NOT an offset designator (anchored regex)', () => {
      // Corrected semantics: only a trailing z/Z (or numeric offset) marks
      // the value as offset-carrying. A z in the middle leaves the value on
      // the naive-UTC branch, so the appended designator makes these
      // strings unparseable — they safely map to 0 instead of being read as
      // local time by a lenient engine.
      expect(lastreadTimeMs('2026-09-26T10:00:00zjunk')).toBe(0);
      expect(lastreadTimeMs('zebra 2026-09-26T10:00:00')).toBe(0);
    });
  });
});
