import { describe, expect, it } from 'vitest';

import { hasNsfwTag, normalizeNsfwPref } from '@/lib/nsfw';

describe('hasNsfwTag (legacy StateFunctions parity)', () => {
  it('detects the nsfw tag in json_metadata', () => {
    expect(
      hasNsfwTag({ json_metadata: { tags: ['steem', 'nsfw'] }, category: 'steem' })
    ).toBe(true);
  });

  it('matches case-insensitively but exactly (legacy /^nsfw$/i)', () => {
    expect(
      hasNsfwTag({ json_metadata: { tags: ['NSFW'] }, category: 'photography' })
    ).toBe(true);
    // near-misses do not count
    expect(
      hasNsfwTag({ json_metadata: { tags: ['nsfw-art'] }, category: 'art' })
    ).toBe(false);
    expect(
      hasNsfwTag({ json_metadata: { tags: ['nsfw!'] }, category: 'art' })
    ).toBe(false);
  });

  it('detects nsfw as the post category (legacy normalizeTags unshifts it)', () => {
    expect(hasNsfwTag({ json_metadata: { tags: ['photo'] }, category: 'nsfw' })).toBe(
      true
    );
  });

  it('handles missing/odd metadata without throwing', () => {
    expect(hasNsfwTag({ json_metadata: undefined, category: 'steem' })).toBe(false);
    expect(hasNsfwTag({ json_metadata: null, category: null })).toBe(false);
    expect(hasNsfwTag({ json_metadata: { tags: 'nsfw' }, category: 'x' })).toBe(
      false
    );
    expect(
      hasNsfwTag({ json_metadata: { tags: [1, null, 'nsfw'] }, category: 'x' })
    ).toBe(true);
  });

  it('does not mutate the post tags array', () => {
    const post = { json_metadata: { tags: ['a'] }, category: 'b' };
    hasNsfwTag(post);
    expect(post.json_metadata?.tags).toEqual(['a']);
  });
});

describe('normalizeNsfwPref', () => {
  it('passes the three legacy values through', () => {
    expect(normalizeNsfwPref('hide')).toBe('hide');
    expect(normalizeNsfwPref('warn')).toBe('warn');
    expect(normalizeNsfwPref('show')).toBe('show');
  });

  it('defaults anything else to warn (legacy || "warn")', () => {
    expect(normalizeNsfwPref(undefined)).toBe('warn');
    expect(normalizeNsfwPref('')).toBe('warn');
    expect(normalizeNsfwPref('Hide')).toBe('warn');
  });
});
