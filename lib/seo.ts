/**
 * Server-side SEO metadata builders for post and user pages.
 *
 * Ported from legacy src/app/utils/ExtractMeta.js (addPostMeta /
 * addAccountMeta) and src/app/utils/CanonicalLinker.js, mapped onto the
 * Next.js Metadata API. Used by generateMetadata() in the post and user
 * page server shells.
 *
 * Post bodies are untrusted: the description goes through
 * extractBodySummary (markdown rendered to plain text, all HTML stripped,
 * URLs removed) before it ever reaches a meta tag.
 */

import type { Metadata } from 'next';
import { extractBodySummary, extractImageLink } from '@/lib/extract-content';
import { proxifyImageUrl } from '@/lib/media/proxify-url';

/**
 * Origin of this site, used for absolute URLs in metadata (avatar fallback
 * image, og:url base). Legacy read state.app.site_domain (default
 * steemit.com); this app has no site-domain env var, so default to the
 * production origin.
 */
export const SITE_ORIGIN = 'https://steemit.com';

/**
 * Hosts whose canonical_url json_metadata values are honored (audit N-17).
 *
 * Legacy (CanonicalLinker.read_md_canonical) accepted ANY absolute http(s)
 * canonical_url, letting a post author point rel=canonical at an arbitrary
 * site — an SEO-hijack surface on our own pages. Legacy has no domain
 * whitelist for this, so the rule is restricted to this site's own host
 * family; anything else falls through to the app-scheme/local URL logic.
 */
const CANONICAL_URL_ALLOWED_HOSTS = new Set(['steemit.com', 'www.steemit.com']);

/** Only absolute http(s) URLs may become metadata images (audit N-17). */
const ABSOLUTE_HTTP_URL = /^https?:\/\//i;

/**
 * URL schemes from steemscript apps.json, restricted to the apps legacy
 * whitelisted as canonical-reciprocating (CanonicalLinker.allowed_app):
 * a post whose json_metadata.app is one of these keeps its canonical URL
 * on that app's scheme instead of ours.
 */
const APP_URL_SCHEMES: Record<string, string> = {
  steemit: 'https://steemit.com/{category}/@{username}/{permlink}',
  steempeak: 'https://steempeak.com/{category}/@{username}/{permlink}',
  travelfeed: 'https://travelfeed.io/@{username}/{permlink}',
};

/** Subset of a bridge content object that SEO metadata needs. */
export interface SeoPost {
  author: string;
  permlink: string;
  category: string;
  title?: string;
  body?: string;
  created?: string;
  depth?: number;
  community_title?: string;
  json_metadata?: {
    tags?: unknown;
    image?: unknown;
    app?: unknown;
    canonical_url?: unknown;
    [key: string]: unknown;
  } | null;
}

type JsonMetadata = NonNullable<SeoPost['json_metadata']>;

/** Legacy read_md_app: "appname/version" -> "appname". */
function readMdApp(metadata: JsonMetadata | null): string | null {
  const app = metadata?.app;
  if (typeof app !== 'string') return null;
  const parts = app.split('/');
  return parts.length === 2 ? parts[0] : null;
}

/**
 * Legacy read_md_canonical, tightened (audit N-17): accept only absolute
 * http(s) canonical_url whose host is this site's own (steemit.com /
 * www.steemit.com). Cross-domain canonical_url values fall through to the
 * app-scheme / local URL instead of being emitted as rel=canonical.
 */
function readMdCanonical(metadata: JsonMetadata | null): string | null {
  const url = metadata?.canonical_url;
  if (typeof url !== 'string' || !/^https?:\/\//.test(url)) return null;
  try {
    if (!CANONICAL_URL_ALLOWED_HOSTS.has(new URL(url).hostname.toLowerCase())) {
      return null;
    }
  } catch {
    return null;
  }
  return url;
}

/**
 * Validate an untrusted image URL (post json_metadata.image[0], on-chain
 * profile_image) before it lands in og:image / twitter images, then force it
 * through the image proxy (audit N-17 — mirrors the safe* style of
 * lib/profile-metadata.ts):
 *  - only absolute http(s) URLs with a parseable hostname pass (javascript:,
 *    data:, protocol-relative and malformed values degrade to null);
 *  - proxifyImageUrl then proxies first-party hosts (base58 /p/ form) and
 *    passes third-party hosts through verbatim, matching the read pipeline.
 */
function safeMetadataImage(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const url = raw.trim();
  if (!ABSOLUTE_HTTP_URL.test(url)) return null;
  try {
    if (!new URL(url).hostname) return null;
  } catch {
    return null;
  }
  return proxifyImageUrl(url, '640x0/');
}

/**
 * Legacy build_scheme: fill {category}/{username}/{permlink}, with the
 * community slug rewrite from legacy PostFull.jsx:313-343 —
 * Option 1: replace hive-xxxxxx with the sanitized community title;
 * Option 2: if still hive-*, fall back to the first non-community tag.
 */
function buildScheme(scheme: string, post: SeoPost): string {
  let tempCategory = post.category || '';

  const tags = Array.isArray(post.json_metadata?.tags)
    ? (post.json_metadata.tags as unknown[]).filter(
        (t): t is string => typeof t === 'string'
      )
    : [];

  // Option 1: community title slug (no-op for non-community posts).
  const communityTitle = post.community_title || `#${tempCategory}` || '';
  const urlFriendlyTitle = communityTitle
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  if (urlFriendlyTitle) {
    tempCategory = urlFriendlyTitle;
  }

  // Option 2: first tag of the post (sometimes the first tag is still the
  // community, so check the second tag in that case).
  if (tempCategory.startsWith('hive-') && tags.length > 0) {
    const firstTag = tags[0].startsWith('#') ? tags[0].substring(1) : tags[0];
    tempCategory =
      firstTag.startsWith('hive-') && tags.length > 1 ? tags[1] : firstTag;
    tempCategory = tempCategory.startsWith('#')
      ? tempCategory.substring(1)
      : tempCategory;
  }

  return scheme
    .split('{category}')
    .join(tempCategory)
    .split('{username}')
    .join(post.author)
    .split('{permlink}')
    .join(post.permlink);
}

/**
 * Legacy makeCanonicalLink. Pass `metadata = null` to get the local URL
 * (ignores canonical_url/app from json_metadata) — legacy used that for
 * og:url.
 */
export function makeCanonicalLink(
  post: SeoPost,
  metadata: JsonMetadata | null
): string {
  let scheme: string | null = null;

  if (metadata) {
    const canonUrl = readMdCanonical(metadata);
    if (canonUrl) return canonUrl;

    const app = readMdApp(metadata);
    if (app && app in APP_URL_SCHEMES) {
      scheme = APP_URL_SCHEMES[app];
    }
  }
  if (!scheme) scheme = APP_URL_SCHEMES.steemit;
  return buildScheme(scheme, post);
}

/** Legacy addPostMeta mapped to the Next.js Metadata API. */
export function buildPostMetadata(post: SeoPost): Metadata {
  const isReply = (post.depth ?? 0) > 0;
  const jsonMetadata = post.json_metadata ?? null;

  const title = `${post.title} — Steemit`;
  const description = `${extractBodySummary(post.body ?? '', isReply)} by ${post.author}`;
  // Attacker-controlled (json_metadata.image[0] / first body image): must
  // pass safeMetadataImage before it reaches og:image or twitter (N-17).
  const imageLink = safeMetadataImage(
    extractImageLink(jsonMetadata ?? undefined, post.body ?? null)
  );
  const profileImage = `${SITE_ORIGIN}/avatar/${post.author}`;

  const canonical = makeCanonicalLink(post, jsonMetadata);
  const localUrl = makeCanonicalLink(post, null);
  const image = imageLink || profileImage;
  const card = imageLink ? 'summary_large_image' : 'summary';

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      type: 'article',
      url: localUrl,
      images: [image],
      description,
      siteName: 'Steemit',
      tags: post.category ? [post.category] : undefined,
      publishedTime: post.created,
    },
    twitter: {
      card,
      site: '@steemit',
      title,
      description,
      images: [image],
    },
  };
}

/** Profile subset legacy addAccountMeta consumed. */
export interface SeoProfile {
  name?: string;
  about?: string;
  profile_image?: string;
}

/** Options for buildAccountMetadata. */
export interface AccountMetadataOptions {
  /**
   * Emit robots noindex for private/semi-private account UI pages
   * (settings, notifications). Legacy had no noindex anywhere, but these
   * sections render account UI rather than public content, so they are
   * excluded from indexing. Canonical/OpenGraph are omitted in this mode:
   * noindex takes precedence over rel=canonical (Google guidance: do not
   * combine the two signals on the same page).
   */
  noindex?: boolean;
}

/** Legacy addAccountMeta mapped to the Next.js Metadata API. */
export function buildAccountMetadata(
  accountname: string,
  profile: SeoProfile | null,
  options: AccountMetadataOptions = {}
): Metadata {
  const name = profile?.name || accountname;
  const about = profile?.about || 'Steemit: Communities Without Borders.';
  // On-chain profile_image is attacker-controlled (account_update2): validate
  // + proxy it like post images instead of emitting it raw (audit N-17).
  const profileImage =
    safeMetadataImage(profile?.profile_image) ||
    `${SITE_ORIGIN}/images/steemit-twshare-2.png`;

  const title = `@${accountname}`;
  const description = `The latest posts from ${name}. Follow me at @${accountname}. ${about}`;

  // All ~11 profile sections (blog/posts/comments/replies/payout/feed/
  // followers/followed/communities/...) previously emitted identical
  // metadata with no canonical — a duplicate-content signal. Point every
  // section at the profile root instead. The canonical is kept relative:
  // this app sets no metadataBase, so Next.js emits it verbatim and crawlers
  // resolve it against the served origin (correct on any host, independent
  // of the SITE_ORIGIN constant).
  const canonical = `/@${accountname}`;

  // Legacy addAccountMeta emitted Twitter-card meta only — no OpenGraph for
  // accounts. This is a minimal og:profile addition (title/url/type) aligned
  // with the post-page og shape; og:url must be absolute per the OG spec.
  const openGraph = {
    title,
    type: 'profile' as const,
    url: `${SITE_ORIGIN}/@${accountname}`,
    username: accountname,
    description,
    images: [profileImage],
    siteName: 'Steemit',
  };

  return {
    title,
    description,
    // Private/semi-private UI pages self-declare noindex (Google treats
    // noindex + follow:false as "neither index nor crawl links from here").
    // In that mode canonical/og are omitted: noindex takes precedence over
    // rel=canonical (Google guidance: do not combine the two signals).
    ...(options.noindex && {
      robots: { index: false, follow: false },
    }),
    ...(!options.noindex && { alternates: { canonical }, openGraph }),
    twitter: {
      card: 'summary',
      site: '@steemit',
      title,
      description,
      images: [profileImage],
    },
  };
}
