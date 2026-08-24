/**
 * Permlink generation.
 *
 * Ported from legacy condenser-legacy/src/app/redux/TransactionSaga.js:
 * createPermlink() (lines 511-544) and slug() (lines 587-589).
 *
 * Strategy parity with legacy:
 *  - Story permlinks are derived from the title (slugified, max 128 chars for
 *    the slug part). If the slug is empty (e.g. non-latin title), fall back to
 *    random base58. Uniqueness is checked against the chain by the caller
 *    (legacy used bridge.get_post_header); when taken, a random base58 noise
 *    prefix is prepended: `<noise>-<slug>`. Final permlink capped at 255 chars
 *    (STEEMIT_MAX_PERMLINK_LENGTH).
 *  - Comment permlinks have no title: base36 of unix seconds. Legacy appends
 *    NO entropy suffix and does NOT dedupe comments (permlinks only need to be
 *    unique per author, and one comment per second per author is the assumed
 *    ceiling).
 */

import bs58 from 'bs58';

const SLUG_TRUNCATE = 128;
const STEEMIT_MAX_PERMLINK_LENGTH = 255;

/** 4 random bytes, base58-encoded (legacy used secureRandom.randomBuffer(4)). */
function randomBase58(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return bs58.encode(bytes);
}

/**
 * Slugify a post title the way legacy createPermlink does:
 * strip `<>`, slugify (approximating speakingurl's getSlug with
 * `{ truncate: 128 }`), then lowercase and drop everything that is not
 * [a-z0-9-]. Empty result falls back to random base58.
 */
export function slugifyTitle(title: string): string {
  let s = title
    .replace(/[<>]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, SLUG_TRUNCATE)
    .replace(/-+$/g, '');

  if (s === '') {
    s = randomBase58();
  }

  // Only letters, numbers and dashes shall survive.
  s = s.toLowerCase().replace(/[^a-z0-9-]+/g, '');
  return s;
}

/**
 * Generate a permlink for a new story (top-level post).
 *
 * `isTaken` should check the chain for an existing post by this author with
 * the candidate permlink (legacy: bridge.get_post_header). When omitted, no
 * uniqueness check is performed.
 */
export async function generateStoryPermlink(
  title: string,
  isTaken?: (permlink: string) => Promise<boolean>
): Promise<string> {
  let permlink = slugifyTitle(title);

  if (isTaken && (await isTaken(permlink))) {
    const noise = randomBase58().toLowerCase();
    permlink = `${noise}-${permlink}`;
  }

  if (permlink.length > STEEMIT_MAX_PERMLINK_LENGTH) {
    permlink = permlink.substring(0, STEEMIT_MAX_PERMLINK_LENGTH);
  }

  return permlink;
}

/**
 * Generate a permlink for a new comment (no title): base36 unix seconds,
 * exactly like legacy createPermlink's empty-title branch.
 */
export function generateCommentPermlink(now: number = Date.now()): string {
  return Math.floor(now / 1000).toString(36);
}
