import { describe, expect, it } from 'vitest';

import { isPostPathname, PROFILE_SECTIONS, SORT_TYPES } from '@/lib/routes';

describe('isPostPathname (shared post-URL matcher)', () => {
  it('matches post URLs with and without a category segment', () => {
    expect(isPostPathname('/bitcoin/@alice/my-post')).toBe(true);
    expect(isPostPathname('/bitcoin/@alice/my-post/')).toBe(true);
    expect(isPostPathname('/@alice/my-post')).toBe(true);
    expect(isPostPathname('/@alice/post-v1.2')).toBe(true);
  });

  it('does not match profile-section URLs (the sidebar regex regression)', () => {
    // Profile sections are profile pages, not posts — every legacy
    // <account-tab> must be excluded.
    for (const section of PROFILE_SECTIONS) {
      expect(isPostPathname(`/@alice/${section}`)).toBe(false);
    }
    expect(isPostPathname('/@alice/BLOG')).toBe(false);
    expect(isPostPathname('/@alice')).toBe(false);
  });

  it('does not match feed/sort URLs or internal rewrite targets', () => {
    expect(isPostPathname('/trending')).toBe(false);
    expect(isPostPathname('/trending/bitcoin')).toBe(false);
    expect(isPostPathname('/trending/my')).toBe(false);
    // Internal rewrite targets: proxy.ts 404s direct access; a browser
    // URL never contains them.
    expect(isPostPathname('/post/bitcoin/alice/my-post')).toBe(false);
    expect(isPostPathname('/post-no-category/alice/my-post')).toBe(false);
    expect(isPostPathname('/user/alice/blog')).toBe(false);
  });

  it('anchors the category form: trailing extra segments are not posts', () => {
    expect(isPostPathname('/bitcoin/@alice/my-post/extra')).toBe(false);
    expect(isPostPathname('/@alice/my-post/extra')).toBe(false);
  });

  it('keeps SORT_TYPES members regex-safe (no metacharacters)', () => {
    for (const sort of SORT_TYPES) {
      expect(sort).toMatch(/^[\w]+$/);
    }
  });
});
