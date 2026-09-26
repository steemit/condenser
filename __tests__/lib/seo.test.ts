import { describe, expect, it, vi } from 'vitest';
import {
  SITE_ORIGIN,
  buildAccountMetadata,
  buildPostMetadata,
  makeCanonicalLink,
  type SeoPost,
} from '@/lib/seo';

const basePost: SeoPost = {
  author: 'alice',
  permlink: 'hello-world',
  category: 'photography',
  title: 'Hello World',
  body: 'A short post about cameras.',
  created: '2024-01-02T03:04:05',
  depth: 0,
  json_metadata: { tags: ['photography', 'film'] },
};

describe('makeCanonicalLink', () => {
  it('defaults to the steemit scheme', () => {
    expect(makeCanonicalLink(basePost, null)).toBe(
      'https://steemit.com/photography/@alice/hello-world'
    );
  });

  it('accepts a canonical_url on this site (steemit.com / www.steemit.com)', () => {
    expect(
      makeCanonicalLink(basePost, {
        canonical_url: 'https://steemit.com/photography/@alice/hello-world',
      })
    ).toBe('https://steemit.com/photography/@alice/hello-world');
    expect(
      makeCanonicalLink(basePost, {
        canonical_url: 'https://www.steemit.com/photography/@alice/hello-world',
      })
    ).toBe('https://www.steemit.com/photography/@alice/hello-world');
  });

  it.each([
    'javascript:alert(1)',
    'ftp://example.com/post',
    '//example.com/post',
    'example.com/post',
    // Cross-domain canonical_url is no longer honored (audit N-17).
    'https://example.com/my-post',
    'https://evil.example/@alice/hello-world',
    'https://notsteemit.com/',
  ])('rejects canonical_url %j', (url) => {
    expect(makeCanonicalLink(basePost, { canonical_url: url })).toBe(
      'https://steemit.com/photography/@alice/hello-world'
    );
  });

  it('uses the whitelisted app scheme (steempeak)', () => {
    expect(makeCanonicalLink(basePost, { app: 'steempeak/1.0' })).toBe(
      'https://steempeak.com/photography/@alice/hello-world'
    );
  });

  it('uses the whitelisted app scheme (travelfeed, no category slot)', () => {
    expect(makeCanonicalLink(basePost, { app: 'travelfeed/2.0' })).toBe(
      'https://travelfeed.io/@alice/hello-world'
    );
  });

  it('falls back to the steemit scheme for non-whitelisted apps', () => {
    expect(makeCanonicalLink(basePost, { app: 'busy/1.0' })).toBe(
      'https://steemit.com/photography/@alice/hello-world'
    );
  });

  it('ignores malformed app strings (no version part)', () => {
    expect(makeCanonicalLink(basePost, { app: 'steempeak' })).toBe(
      'https://steemit.com/photography/@alice/hello-world'
    );
  });

  it('rewrites hive-* category to the community title slug', () => {
    const post: SeoPost = {
      ...basePost,
      category: 'hive-123456',
      community_title: 'Photo Lovers!',
      json_metadata: { tags: ['hive-123456', 'photography'] },
    };
    expect(makeCanonicalLink(post, null)).toBe(
      'https://steemit.com/photo-lovers/@alice/hello-world'
    );
  });

  // Legacy quirk (CanonicalLinker.build_scheme): without a community_title,
  // Option 1 falls back to `#${category}`, and sanitizing `#hive-123456`
  // strips the dash, yielding `hive123456` — which no longer starts with
  // `hive-`, so the Option 2 tag fallback never fires for hive categories.
  it('sanitizes a bare hive-* category to its dash-less slug (legacy parity)', () => {
    const post: SeoPost = {
      ...basePost,
      category: 'hive-123456',
      json_metadata: { tags: ['hive-123456', 'film'] },
    };
    expect(makeCanonicalLink(post, null)).toBe(
      'https://steemit.com/hive123456/@alice/hello-world'
    );
  });

  it('falls back to the first non-community tag when the community title sanitizes to nothing', () => {
    const post: SeoPost = {
      ...basePost,
      category: 'hive-123456',
      community_title: '!!!',
      json_metadata: { tags: ['hive-123456', 'film'] },
    };
    expect(makeCanonicalLink(post, null)).toBe(
      'https://steemit.com/film/@alice/hello-world'
    );
  });

  it('ignores canonical_url when metadata is null (local URL)', () => {
    const withCanon = makeCanonicalLink(basePost, basePost.json_metadata!);
    const local = makeCanonicalLink(basePost, null);
    expect(withCanon).toBe(local);
  });
});

describe('buildPostMetadata', () => {
  it('maps the legacy addPostMeta fields', () => {
    const meta = buildPostMetadata(basePost);
    expect(meta.title).toBe('Hello World — Steemit');
    expect(meta.description).toBe('A short post about cameras. by alice');
    expect(meta.alternates?.canonical).toBe(
      'https://steemit.com/photography/@alice/hello-world'
    );
    expect(meta.openGraph).toMatchObject({
      title: 'Hello World — Steemit',
      type: 'article',
      url: 'https://steemit.com/photography/@alice/hello-world',
      description: 'A short post about cameras. by alice',
      siteName: 'Steemit',
      tags: ['photography'],
      publishedTime: '2024-01-02T03:04:05',
    });
    expect(meta.twitter).toMatchObject({ site: '@steemit' });
  });

  it('strips markdown syntax from the description', () => {
    const meta = buildPostMetadata({
      ...basePost,
      body: 'A **short** post about cameras.',
    });
    const desc = String(meta.description);
    expect(desc).not.toContain('*');
    expect(desc.replace(/\s+/g, ' ')).toContain('A short post about cameras.');
  });

  it('never emits raw HTML from the body into the description', () => {
    const meta = buildPostMetadata({
      ...basePost,
      body: 'Hello <script>alert(1)</script><b>world</b> https://spam.example/x',
    });
    expect(String(meta.description)).not.toMatch(/<[^>]+>/);
    expect(String(meta.description)).not.toContain('https://');
    expect(String(meta.description)).toContain('Hello');
  });

  it('uses json_metadata.image[0] (validated + proxied) with a summary_large_image card', () => {
    const meta = buildPostMetadata({
      ...basePost,
      json_metadata: {
        tags: ['photography'],
        image: ['https://example.com/pic.jpg'],
      },
    });
    // Third-party hosts pass through the proxy verbatim.
    expect(meta.openGraph?.images).toEqual(['https://example.com/pic.jpg']);
    // Next's Twitter type is a union whose new variant drops `card`; we
    // always emit the classic shape, so read it through that branch.
    const twitter = meta.twitter as { card?: string; images?: string[] };
    expect(twitter.card).toBe('summary_large_image');
    expect(twitter.images).toEqual(['https://example.com/pic.jpg']);
  });

  it('proxies first-party og:image through the image proxy (audit N-17)', () => {
    const meta = buildPostMetadata({
      ...basePost,
      json_metadata: {
        tags: ['photography'],
        image: ['https://steemitimages.com/DQmXabc/pic.jpg'],
      },
    });
    const ogImage = String(
      (meta.openGraph?.images as { url?: string }[] | undefined)?.[0]?.url ??
        meta.openGraph?.images
    );
    expect(ogImage).toMatch(/^https:\/\/steemitimages\.com\/p\//);
    const twitterImage = String(
      (meta.twitter as { images?: string[] }).images?.[0]
    );
    expect(twitterImage).toMatch(/^https:\/\/steemitimages\.com\/p\//);
  });

  it('degrades non-http(s) og:image to the author avatar (audit N-17)', () => {
    const meta = buildPostMetadata({
      ...basePost,
      json_metadata: { tags: ['photography'], image: ['javascript:alert(1)'] },
    });
    expect(meta.openGraph?.images).toEqual([`${SITE_ORIGIN}/avatar/alice`]);
    expect((meta.twitter as { card?: string }).card).toBe('summary');
  });

  it('falls back to the author avatar with a summary card when there is no image', () => {
    const meta = buildPostMetadata({ ...basePost, body: 'no images here' });
    expect(meta.openGraph?.images).toEqual([`${SITE_ORIGIN}/avatar/alice`]);
    expect((meta.twitter as { card?: string }).card).toBe('summary');
  });

  it('strips quotes in the description for replies (depth > 0)', () => {
    const meta = buildPostMetadata({
      ...basePost,
      depth: 1,
      body: '> quoted text\n\nmy reply',
    });
    expect(meta.description).toBe('my reply by alice');
  });

  it('honours an on-site json_metadata.canonical_url as alternates.canonical but keeps og:url local', () => {
    const meta = buildPostMetadata({
      ...basePost,
      json_metadata: {
        tags: ['photography'],
        canonical_url: 'https://steemit.com/photography/@alice/hello-world',
      },
    });
    expect(meta.alternates?.canonical).toBe(
      'https://steemit.com/photography/@alice/hello-world'
    );
    expect(meta.openGraph?.url).toBe(
      'https://steemit.com/photography/@alice/hello-world'
    );
  });

  it('ignores cross-domain canonical_url in metadata too (audit N-17)', () => {
    const meta = buildPostMetadata({
      ...basePost,
      json_metadata: {
        tags: ['photography'],
        canonical_url: 'https://example.com/original',
      },
    });
    expect(meta.alternates?.canonical).toBe(
      'https://steemit.com/photography/@alice/hello-world'
    );
  });
});

describe('buildAccountMetadata', () => {
  it('maps the legacy addAccountMeta fields', () => {
    const meta = buildAccountMetadata('alice', {
      name: 'Alice A.',
      about: 'Photographer',
      profile_image: 'https://example.com/avatar.png',
    });
    expect(meta.title).toBe('@alice');
    expect(meta.description).toBe(
      'The latest posts from Alice A.. Follow me at @alice. Photographer'
    );
    expect(meta.twitter).toMatchObject({
      card: 'summary',
      site: '@steemit',
      title: '@alice',
      // Third-party host: passes the proxy verbatim.
      images: ['https://example.com/avatar.png'],
    });
  });

  it('degrades a non-http(s) profile image to the default share image (audit N-17)', () => {
    const meta = buildAccountMetadata('alice', {
      profile_image: 'javascript:alert(1)',
    });
    expect(meta.twitter?.images).toEqual([
      `${SITE_ORIGIN}/images/steemit-twshare-2.png`,
    ]);
  });

  it('falls back to account name and default about/image', () => {
    const meta = buildAccountMetadata('alice', null);
    expect(meta.title).toBe('@alice');
    expect(meta.description).toBe(
      'The latest posts from alice. Follow me at @alice. Steemit: Communities Without Borders.'
    );
    expect(meta.twitter?.images).toEqual([
      `${SITE_ORIGIN}/images/steemit-twshare-2.png`,
    ]);
    // og falls back to the same default share image (audit N-17).
    expect(meta.openGraph?.images).toEqual([
      `${SITE_ORIGIN}/images/steemit-twshare-2.png`,
    ]);
  });

  it('emits robots noindex,nofollow for private sections (settings/notifications)', () => {
    const meta = buildAccountMetadata('alice', null, { noindex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('emits no robots field by default (indexable, legacy parity)', () => {
    const meta = buildAccountMetadata('alice', null);
    expect(meta.robots).toBeUndefined();
  });

  it('canonical points every section at the profile root (relative path)', () => {
    const meta = buildAccountMetadata('alice', null);
    // Relative: independent of the SITE_ORIGIN constant and of the served
    // host; Next.js passes it through verbatim (no metadataBase is set).
    expect(meta.alternates?.canonical).toBe('/@alice');
  });

  it('adds a minimal og:profile block (legacy had Twitter cards only)', () => {
    const meta = buildAccountMetadata('alice', {
      name: 'Alice A.',
      about: 'Photographer',
      profile_image: 'https://example.com/avatar.png',
    });
    expect(meta.openGraph).toMatchObject({
      title: '@alice',
      type: 'profile',
      url: `${SITE_ORIGIN}/@alice`,
      username: 'alice',
      description:
        'The latest posts from Alice A.. Follow me at @alice. Photographer',
      images: ['https://example.com/avatar.png'],
      siteName: 'Steemit',
    });
  });

  it('proxies a first-party og:image through the image proxy (audit N-17)', () => {
    const meta = buildAccountMetadata('alice', {
      profile_image: 'https://steemitimages.com/u/alice/avatar/large',
    });
    const ogImage = String(
      (meta.openGraph?.images as { url?: string }[] | undefined)?.[0]?.url ??
        meta.openGraph?.images
    );
    expect(ogImage).toMatch(/^https:\/\/steemitimages\.com\/p\//);
  });

  it('omits canonical and og on noindex pages (conflicting signals)', () => {
    const meta = buildAccountMetadata('alice', null, { noindex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
    expect(meta.alternates).toBeUndefined();
    expect(meta.openGraph).toBeUndefined();
    // Twitter card still present (chat-app unfurling, independent of index).
    expect(meta.twitter?.title).toBe('@alice');
  });
});

describe('SITE_ORIGIN env override (X9)', () => {
  it('defaults to https://steemit.com when the env var is unset', () => {
    expect(SITE_ORIGIN).toBe('https://steemit.com');
  });

  it('reads SITE_ORIGIN at module load and strips trailing slashes', async () => {
    vi.resetModules();
    vi.stubEnv('SITE_ORIGIN', 'https://condenser.example.com/');
    try {
      const fresh = await import('@/lib/seo');
      expect(fresh.SITE_ORIGIN).toBe('https://condenser.example.com');
      // og:url and fallback images follow the configured origin.
      const meta = fresh.buildAccountMetadata('alice', null);
      expect(meta.openGraph?.url).toBe(
        'https://condenser.example.com/@alice'
      );
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
