import { describe, expect, it } from 'vitest';

import {
  INTERNAL_AT_EXEMPT_RE,
  INTERNAL_ROUTE_PREFIXES,
  INTERNAL_TARGET_RE,
  isPostPathname,
  PROFILE_SECTIONS,
  SORT_TYPES,
} from '@/lib/routes';

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

  it('keeps INTERNAL_ROUTE_PREFIXES members regex-safe (word chars and hyphens only)', () => {
    // These members are interpolated into regex alternations via join('|')
    // (proxy.ts internal-target guard) — same constraint as SORT_TYPES.
    for (const prefix of INTERNAL_ROUTE_PREFIXES) {
      expect(prefix).toMatch(/^[\w-]+$/);
    }
  });

  it('keeps the proxy internal-target guard regexes segment-bounded (real objects)', () => {
    // INTERNAL_TARGET_RE / INTERNAL_AT_EXEMPT_RE are the exact objects
    // proxy.ts's guard uses — assert against them directly so a derivation
    // change here cannot diverge from the tested behavior.
    for (const prefix of INTERNAL_ROUTE_PREFIXES) {
      expect(INTERNAL_TARGET_RE.test(`/${prefix}`)).toBe(true);
      expect(INTERNAL_TARGET_RE.test(`/${prefix}/a/b`)).toBe(true);
    }
    // Segment-bounded alternation: /poster/x must never match as /post/er/x.
    expect(INTERNAL_TARGET_RE.test('/poster/a')).toBe(false);
    expect(INTERNAL_TARGET_RE.test('/post-x/a')).toBe(false);
    expect(INTERNAL_TARGET_RE.test('/users/alice')).toBe(false);

    // The @-exemption: exactly three segments (optional trailing slash),
    // second one @-prefixed — the trailing-slash Post re-entry form only.
    for (const prefix of INTERNAL_ROUTE_PREFIXES) {
      expect(INTERNAL_AT_EXEMPT_RE.test(`/${prefix}/@a/p`)).toBe(true);
      expect(INTERNAL_AT_EXEMPT_RE.test(`/${prefix}/@a/p/`)).toBe(true);
    }
    expect(INTERNAL_AT_EXEMPT_RE.test('/post/a/@b/c')).toBe(false); // four segments
    expect(INTERNAL_AT_EXEMPT_RE.test('/user/@alice')).toBe(false); // two segments
    expect(INTERNAL_AT_EXEMPT_RE.test('/user/@alice/blog/extra')).toBe(false);
  });
});
