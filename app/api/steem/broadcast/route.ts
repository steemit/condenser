/**
 * Steem API Route: Broadcast Signed Transactions
 * POST /api/steem/broadcast
 *
 * This API only forwards pre-signed transactions to the Steem network.
 * All signing is done client-side for security. Operations are gated by an
 * allowlist (audit N-10) — see ALLOWED_OPERATION_TYPES below.
 *
 * Expected payload:
 * {
 *   signedTransaction: {
 *     ref_block_num: number,
 *     ref_block_prefix: number,
 *     expiration: string,
 *     operations: any[],
 *     extensions: any[],
 *     signatures: string[]
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeSteemApi, callSteemApi } from '@/lib/steem/client';
import { cacheDelete } from '@/lib/cache/redis';
import { MAX_BROADCAST_BODY_BYTES, readJsonWithLimit } from '@/lib/api/body-limit';
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';
import {
  recordPendingVote,
  recordPendingRootPost,
  recordPendingChild,
  recordPendingDeletion,
  recordPendingProfile,
  synthesizePostFromCommentOp,
} from '@/lib/steem/pending-overlay';

/**
 * Operation allowlist (audit N-10).
 *
 * This endpoint is an open relay for pre-signed transactions: the chain
 * verifies signatures, so ops cannot be forged — but anything forwarded here
 * is relayed from our infrastructure. The allowlist is exactly the operation
 * set this client constructs (lib/crypto/transaction-signer.ts and its
 * callers in lib/api/broadcast.ts):
 *
 *   vote            — Voting.tsx (broadcastVote)
 *   comment         — PostEditor.tsx (broadcastComment)
 *   comment_options — PostEditor.tsx, appended right after comment when the
 *                     editor applies payout/beneficiary options
 *   delete_comment  — PostPageClient.tsx (broadcastDeleteComment)
 *   custom_json     — Follow/Reblog (id "follow"), SubscribeButton
 *                     (id "community"), NotificationsList (id "notify")
 *   account_update2 — UserSettings.tsx (broadcastAccountUpdate)
 *
 * Anything else (transfer, account_update, witness ops, …) is not a client
 * flow and is rejected with a 400 before the relay attempt.
 */
const ALLOWED_OPERATION_TYPES: ReadonlySet<string> = new Set([
  'vote',
  'comment',
  'comment_options',
  'delete_comment',
  'custom_json',
  'account_update2',
]);

/**
 * Allowed custom_json ids, from the actual call sites (audit N-10). The id
 * namespaces the payload protocol; whitelisting op types alone would still
 * relay arbitrary third-party protocols through custom_json.
 */
const ALLOWED_CUSTOM_JSON_IDS: ReadonlySet<string> = new Set([
  'follow', // follow/unfollow/ignore (mute) + reblog payloads
  'community', // community subscribe/unsubscribe
  'notify', // mark notifications read (setLastRead)
]);

/** Cap for echoing a rejected custom_json id back in the error body. */
const REJECTED_OP_LABEL_LIMIT = 32;

/**
 * Validate every operation against the allowlist. Returns the labels of the
 * rejected operations (empty array = all allowed). Labels name only what the
 * client itself sent — the allowlist contents are never disclosed.
 */
function findRejectedOperations(operations: unknown[]): string[] {
  const rejected = new Set<string>();
  for (const op of operations) {
    if (!Array.isArray(op) || op.length < 2 || typeof op[0] !== 'string') {
      rejected.add('malformed operation');
      continue;
    }
    const name = op[0];
    if (!ALLOWED_OPERATION_TYPES.has(name)) {
      rejected.add(name.slice(0, REJECTED_OP_LABEL_LIMIT));
      continue;
    }
    if (name === 'custom_json') {
      const data = op[1];
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        rejected.add('malformed operation');
        continue;
      }
      const record = data as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : '';
      if (!ALLOWED_CUSTOM_JSON_IDS.has(id)) {
        rejected.add(
          `custom_json id=${id.slice(0, REJECTED_OP_LABEL_LIMIT) || '(missing)'}`
        );
        continue;
      }
      // Every client custom_json is posting-auth only (login is posting-key
      // only); an active-auth custom_json is not a client flow.
      const requiredAuths = Array.isArray(record.required_auths)
        ? record.required_auths
        : [];
      if (requiredAuths.length > 0) {
        rejected.add('custom_json with required_auths');
      }
    }
  }
  return [...rejected];
}

export async function POST(request: NextRequest) {
  try {
    // Abuse wrappers (audit N-08): rate limit before reading the body, then
    // enforce the body size cap while reading it. The chain node enforces
    // its own limits; this caps the relay's surface. The cap here is the
    // broadcast-specific 256KB: a maximal legitimate post (65280-byte body
    // client-side, 65536 on-chain) inflates to ~67KB of HTTP body after the
    // JSON envelope, escaping and signature — the default 64KB would 413 it.
    const rateLimit = await checkRateLimit(request, RATE_LIMITS.steemBroadcast);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const limited = await readJsonWithLimit(request, MAX_BROADCAST_BODY_BYTES);
    if (!limited.ok) {
      return limited.response;
    }
    const body = limited.data as {
      signedTransaction?: {
        operations?: unknown;
        signatures?: unknown[];
      };
    };
    const { signedTransaction } = body;

    if (!signedTransaction) {
      return NextResponse.json(
        { error: 'Missing required field: signedTransaction' },
        { status: 400 }
      );
    }

    // Validate transaction structure
    if (!signedTransaction.operations || !Array.isArray(signedTransaction.operations)) {
      return NextResponse.json(
        { error: 'Invalid transaction: operations must be an array' },
        { status: 400 }
      );
    }

    if (!signedTransaction.signatures || !Array.isArray(signedTransaction.signatures) || signedTransaction.signatures.length === 0) {
      return NextResponse.json(
        { error: 'Invalid transaction: must have at least one signature' },
        { status: 400 }
      );
    }

    // Allowlist gate (audit N-10): reject non-client operations before the
    // relay attempt. The error names only the rejected operations (client
    // input), never the allowlist contents.
    const rejectedOperations = findRejectedOperations(signedTransaction.operations);
    if (rejectedOperations.length > 0) {
      return NextResponse.json(
        { error: `Operation not allowed: ${rejectedOperations.join(', ')}` },
        { status: 400 }
      );
    }

    // Initialize Steem API
    initializeSteemApi();

    // Forward the signed transaction to Steem network
    // The API only forwards, it does not sign or modify the transaction.
    // The method MUST be namespaced: bare "broadcast_transaction" makes
    // steemd's appbase JSON-RPC assert "method specification invalid.
    // Should be api.method". (network_broadcast_api is avoided per the
    // wallet project's findings — it bad_casts on some nodes.)
    const result = await callSteemApi<{ id?: string }>('condenser_api.broadcast_transaction', [signedTransaction]);

    // Extract operation details for response + cache invalidation
    const firstOperation = signedTransaction.operations[0];
    let permlink: string | undefined;
    let actor: string | undefined;
    let opType: string | undefined;
    let opData: Record<string, unknown> | undefined;

    if (firstOperation && Array.isArray(firstOperation) && firstOperation.length >= 2) {
      opType = firstOperation[0];
      const rawOpData = firstOperation[1];
      if (rawOpData && typeof rawOpData === 'object') {
        opData = rawOpData as Record<string, unknown>;
        permlink = (opData.permlink as string) || (opData.parent_permlink as string);
        // The actor varies by op type: vote/comment use `voter`/`author`,
        // custom_json (reblog/follow/mute) carries the signer in
        // `required_posting_auths[0]` and a nested payload — but not voter/author.
        if (opType === 'custom_json') {
          const postingAuths = opData.required_posting_auths;
          actor = Array.isArray(postingAuths) ? String(postingAuths[0] || '') : undefined;
        } else if (opType === 'account_update2') {
          // Profile settings save — the signer is the `account` field.
          actor = (opData.account as string) || undefined;
        } else {
          actor = (opData.voter as string) || (opData.author as string);
        }
      }
    }

    // Invalidate read caches affected by this write. We scope by the prefixes
    // that could hold stale content rather than a blanket flush, mirroring the
    // wallet project's per-route invalidation. Failures here are non-critical.
    await invalidateAfterBroadcast(signedTransaction.operations);

    // Record the write in the pending overlay so reads within the hivemind
    // indexing window still reflect it (lib/steem/pending-overlay.ts).
    await recordPendingOverlays(signedTransaction.operations);

    const response = NextResponse.json({
      success: true,
      result,
      transactionId: result?.id,
      permlink,
    });

    // Signal the browser (L1) cache to drop affected entries. Tokens are
    // comma-separated and matched by substring against cached URLs: the
    // actor covers per-user entries, and `permlink=...` covers the
    // post + comments entries (their URLs are author/permlink-shaped and
    // would otherwise survive a vote/reply, serving pre-write data).
    // Tokens are op-derived (client-controlled), so restrict them to the
    // account/permlink charset — anything else is dropped, never trusted.
    const SAFE_TOKEN = /^[a-z0-9.=-]+$/;
    const invalidateTokens: string[] = [];
    if (actor && SAFE_TOKEN.test(actor)) invalidateTokens.push(actor);
    if (opType === 'vote' && permlink && SAFE_TOKEN.test(`permlink=${permlink}`)) {
      invalidateTokens.push(`permlink=${permlink}`);
    }
    if (opType === 'comment' && opData) {
      const parentPermlink = opData.parent_permlink as string | undefined;
      if (opData.parent_author) {
        // A reply must also drop the parent discussion's L1 entries so the
        // pending overlay gets a chance to merge it on the next read.
        if (parentPermlink && SAFE_TOKEN.test(`permlink=${parentPermlink}`)) {
          invalidateTokens.push(`permlink=${parentPermlink}`);
        }
      } else {
        // A root-post EDIT keeps the post's own L1 entry otherwise; the
        // token is harmless for new posts (their URL was never cached).
        const ownPermlink = opData.permlink as string | undefined;
        if (ownPermlink && SAFE_TOKEN.test(`permlink=${ownPermlink}`)) {
          invalidateTokens.push(`permlink=${ownPermlink}`);
        }
      }
    }
    if (invalidateTokens.length > 0) {
      response.headers.set('X-Cache-Invalidate', invalidateTokens.join(','));
    }
    return response;
  } catch (error: unknown) {
    console.error('Broadcast error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to broadcast transaction';
    const errorDetails = error instanceof Error ? error.toString() : String(error);

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}

/**
 * Drop read-cache entries that this transaction's operations may have made
 * stale (audit N-10: exact-key O(1) deletes only — no prefix sweeps).
 *
 * The previous implementation swept whole prefixes (`steem:profile:` covered
 * EVERY user's profile; `steem:posts:ranked:` all ranked feeds), and each
 * sweep is a SCAN over the entire keyspace regardless of how many keys
 * match — so any registered account could punch the shared Redis cache
 * through at ~zero cost, 30 times a minute per IP.
 *
 * List caches (`steem:posts:ranked:*`, `steem:posts:account:*`,
 * `steem:post:*`) are deliberately NOT invalidated here anymore:
 *   - their fresh TTL is 3s (CACHE_TTL.posts), so natural expiry bounds
 *     staleness to seconds;
 *   - the pending overlay (lib/steem/pending-overlay.ts) already merges
 *     freshly broadcast votes into ranked/account-post reads for 120s after
 *     the write, so vote visibility does not depend on the sweep;
 *   - new posts/replies are surfaced by the overlay on the discussion path,
 *     and list placement follows within the 3s fresh window;
 *   - deleting `steem:post:*` outright would re-cache PRE-write data as
 *     fresh for a full TTL while hivemind lags (the pre-existing reason the
 *     vote branch never deleted it).
 *
 * Profile caches ARE deleted exactly: `steem:profile:{account}` is a single
 * fully-known key (observer reads bypass the cache; see getProfile) with a
 * 30s fresh TTL, and the exact delete guarantees the next read refetches
 * instead of serving the pre-write value for the remaining TTL.
 */
async function invalidateAfterBroadcast(operations: Array<[string, Record<string, unknown>]>): Promise<void> {
  for (const [opName, opData] of operations) {
    switch (opName) {
      case 'vote': {
        // A vote can shift hivemind-side profile fields of both parties;
        // two exact deletes, actor-scoped.
        const voter = String(opData.voter || '');
        const author = String(opData.author || '');
        if (voter) await deleteAccountScopedKey('steem:profile:', voter);
        if (author) await deleteAccountScopedKey('steem:profile:', author);
        break;
      }
      case 'comment':
      case 'delete_comment': {
        // New/edited/deleted post changes the author's profile post count;
        // their account-post lists are 3s-TTL caches left to natural expiry
        // (see the function comment).
        const author = String(opData.author || '');
        if (author) await deleteAccountScopedKey('steem:profile:', author);
        break;
      }
      case 'custom_json': {
        await invalidateCustomJson(opData);
        break;
      }
      case 'account_update2': {
        // Profile settings save — the account's cached profile is stale.
        const account = String(opData.account || '');
        if (account) await deleteAccountScopedKey('steem:profile:', account);
        break;
      }
      default:
        // comment_options piggybacks on comment; other whitelisted ops
        // don't touch the caches tracked here.
        break;
    }
  }
}

/**
 * Delete `{prefix}{account}` exactly. Account names are case-insensitive
 * on-chain but the read routes cache under whatever casing the reader used,
 * so delete both the lowercase and raw variants to cover mixed-case keys.
 */
async function deleteAccountScopedKey(prefix: string, account: string): Promise<void> {
  const normalized = account.toLowerCase();
  await cacheDelete(`${prefix}${normalized}`);
  if (normalized !== account) {
    await cacheDelete(`${prefix}${account}`);
  }
}

/** Parse a `["kind", {…}]`-shaped custom_json payload; null when unshaped. */
function parseCustomJsonPayload(raw: unknown): [string, Record<string, unknown>] | null {
  if (typeof raw !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length >= 2 &&
      typeof parsed[0] === 'string' &&
      parsed[1] !== null &&
      typeof parsed[1] === 'object' &&
      !Array.isArray(parsed[1])
    ) {
      return [parsed[0], parsed[1] as Record<string, unknown>];
    }
  } catch {
    // Unparsable payload — invalidate nothing beyond the actor's own keys.
  }
  return null;
}

/**
 * custom_json invalidation scoped to what each payload id actually touches
 * (audit N-10; the old branch swept every profile + every ranked feed).
 */
async function invalidateCustomJson(opData: Record<string, unknown>): Promise<void> {
  const postingAuths = Array.isArray(opData.required_posting_auths)
    ? opData.required_posting_auths
    : [];
  const actor = String(postingAuths[0] || '');
  // The actor's own profile: covers follow-count shifts for `follow` and any
  // hivemind-side profile field uniformly; harmless when nothing
  // profile-visible changed.
  if (actor) await deleteAccountScopedKey('steem:profile:', actor);

  const payload = parseCustomJsonPayload(opData.json);
  if (!payload) return;
  const [kind, args] = payload;

  switch (opData.id) {
    case 'follow': {
      if (kind === 'follow') {
        // follow/unfollow/ignore also shifts the TARGET's cached
        // follower-count profile — one exact key, not every user's profile.
        const following = String(args.following || '');
        if (following) await deleteAccountScopedKey('steem:profile:', following);
      }
      // kind === 'reblog': the post lands in the REBLOGGER's blog list (a
      // 3s-TTL list cache, left to natural expiry); the target author's
      // blog/profile are unchanged by a reblog.
      break;
    }
    case 'community': {
      // subscribe/unsubscribe changes the community's subscriber list —
      // an exact key with a 10-minute fresh TTL (CACHE_TTL.communityRoles),
      // previously not invalidated at all. The `steem:communities:*` list
      // cache also embeds subscriber counts, but its key space is unbounded
      // (sort x query x limit) so no exact delete is possible; its 10-minute
      // TTL bounds the drift.
      const community = String(args.community || '');
      if (community) await deleteAccountScopedKey('steem:community-subscribers:', community);
      break;
    }
    default:
      // 'notify' (setLastRead): notifications are not cached (getAccountNotifications/
      // getUnreadNotifications bypass withCache), nothing to drop.
      break;
  }
}

/**
 * Record freshly broadcast writes into the pending overlay (short-TTL Redis
 * keys merged into read results until hivemind indexes the change).
 */
async function recordPendingOverlays(operations: Array<[string, Record<string, unknown>]>): Promise<void> {
  for (const [opName, opData] of operations) {
    switch (opName) {
      case 'vote': {
        const author = String(opData.author || '');
        const permlink = String(opData.permlink || '');
        const voter = String(opData.voter || '');
        const weight = Number(opData.weight ?? 0);
        if (author && permlink && voter) {
          await recordPendingVote(author, permlink, voter, weight);
        }
        break;
      }
      case 'comment': {
        const author = String(opData.author || '');
        const permlink = String(opData.permlink || '');
        if (!author || !permlink) break;
        const post = synthesizePostFromCommentOp({
          parent_author: opData.parent_author as string | undefined,
          parent_permlink: opData.parent_permlink as string | undefined,
          author,
          permlink,
          title: opData.title as string | undefined,
          body: opData.body as string | undefined,
          json_metadata: opData.json_metadata as string | undefined,
        });
        const parentAuthor = String(opData.parent_author || '');
        if (parentAuthor) {
          await recordPendingChild(parentAuthor, String(opData.parent_permlink || ''), post);
        } else {
          await recordPendingRootPost(post);
        }
        break;
      }
      case 'delete_comment': {
        const author = String(opData.author || '');
        const permlink = String(opData.permlink || '');
        if (author && permlink) await recordPendingDeletion(author, permlink);
        break;
      }
      case 'account_update2': {
        // Profile settings save — remember the new profile sub-object so
        // get_profile reads show it before hivemind indexes the account row.
        // An absent/empty posting_json_metadata means "leave unchanged"
        // (optional-field semantics, e.g. key-only updates) — record nothing.
        const account = String(opData.account || '');
        const raw = opData.posting_json_metadata ? String(opData.posting_json_metadata) : '';
        if (!account || !raw) break;
        try {
          const md = JSON.parse(raw) as Record<string, unknown> | null;
          if (
            md &&
            typeof md.profile === 'object' &&
            md.profile !== null &&
            !Array.isArray(md.profile)
          ) {
            await recordPendingProfile(account, md.profile as Record<string, unknown>);
          }
          // Metadata without a profile key: skip the overlay too — a {}
          // overlay would blank the profile for the whole TTL window.
        } catch {
          // Malformed metadata — skip the overlay, chain data will surface.
        }
        break;
      }
      default:
        break;
    }
  }
}
