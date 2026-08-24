import { describe, expect, it } from 'vitest';
import gdprUserList, { isGdprUser } from '@/lib/gdpr-user-list';

describe('gdpr-user-list', () => {
  it('contains the 25 accounts ported from legacy GDPRUserList.js', () => {
    expect(gdprUserList).toHaveLength(25);
    expect(gdprUserList).toContain('thedarkoverlord');
    expect(gdprUserList).toContain('mateja.klaric');
    expect(gdprUserList).toContain('nikapelex');
  });

  it('matches listed usernames', () => {
    expect(isGdprUser('thedarkoverlord')).toBe(true);
    expect(isGdprUser('mateja.klaric')).toBe(true);
    expect(isGdprUser('m4r1a')).toBe(true);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(isGdprUser('TheDarkOverlord')).toBe(true);
    expect(isGdprUser('  nikapelex  ')).toBe(true);
  });

  it('rejects non-listed usernames', () => {
    expect(isGdprUser('alice')).toBe(false);
    expect(isGdprUser('steemit')).toBe(false);
    expect(isGdprUser('')).toBe(false);
  });

  it('does not do substring matching', () => {
    expect(isGdprUser('thedarkoverlord2')).toBe(false);
    expect(isGdprUser('m4r1')).toBe(false);
  });
});
