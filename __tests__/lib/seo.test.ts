import { describe, expect, it } from 'vitest';
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

  it('accepts an absolute http(s) canonical_url from json_metadata', () => {
    expect(
      makeCanonicalLink(basePost, {
        canonical_url: 'https://example.com/my-post',
      })
    ).toBe('https://example.com/my-post');
  });

  it.each([
    'javascript:alert(1)',
    'ftp://example.com/post',
    '//example.com/post',
    'example.com/post',
  ])('rejects non-http canonical_url %j', (url) => {
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

  it('uses json_metadata.image[0] with a summary_large_image card', () => {
    const meta = buildPostMetadata({
      ...basePost,
      json_metadata: {
        tags: ['photography'],
        image: ['https://example.com/pic.jpg'],
      },
    });
    expect(meta.openGraph?.images).toEqual(['https://example.com/pic.jpg']);
    // Next's Twitter type is a union whose new variant drops `card`; we
    // always emit the classic shape, so read it through that branch.
    const twitter = meta.twitter as { card?: string; images?: string[] };
    expect(twitter.card).toBe('summary_large_image');
    expect(twitter.images).toEqual(['https://example.com/pic.jpg']);
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

  it('honours json_metadata.canonical_url as alternates.canonical but keeps og:url local', () => {
    const meta = buildPostMetadata({
      ...basePost,
      json_metadata: {
        tags: ['photography'],
        canonical_url: 'https://example.com/original',
      },
    });
    expect(meta.alternates?.canonical).toBe('https://example.com/original');
    expect(meta.openGraph?.url).toBe(
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
      images: ['https://example.com/avatar.png'],
    });
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
  });
});
