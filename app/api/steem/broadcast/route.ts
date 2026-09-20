/**
 * Steem API Route: Broadcast Signed Transactions
 * POST /api/steem/broadcast
 * 
 * This API only forwards pre-signed transactions to the Steem network.
 * All signing is done client-side for security.
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
import { cacheDeleteByPrefix } from '@/lib/cache/redis';
import {
  recordPendingVote,
  recordPendingRootPost,
  recordPendingChild,
  recordPendingDeletion,
  recordPendingProfile,
  synthesizePostFromCommentOp,
} from '@/lib/steem/pending-overlay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
 * stale. Each invalidation targets a specific prefix set rather than flushing
 * everything, so unrelated cached feeds stay warm.
 */
async function invalidateAfterBroadcast(operations: Array<[string, Record<string, unknown>]>): Promise<void> {
  for (const [opName, opData] of operations) {
    switch (opName) {
      case 'vote': {
        // A vote changes the post's ranking and the voter's profile.
        // NOTE: do NOT delete `steem:post:{author}:{permlink}` here — the
        // indexer needs a few seconds to see the vote, so the next read
        // would re-cache PRE-vote data as fresh for a full TTL. Keeping the
        // old entry bounds staleness to its remaining TTL instead.
        const voter = String(opData.voter || '');
        const author = String(opData.author || '');
        await cacheDeleteByPrefix('steem:posts:ranked:');
        if (voter) await cacheDeleteByPrefix(`steem:profile:${voter}`);
        if (author) await cacheDeleteByPrefix(`steem:profile:${author}`);
        break;
      }
      case 'comment': {
        // New post/reply invalidates feeds + the author's account posts + profile.
        const author = String(opData.author || '');
        if (author) {
          await cacheDeleteByPrefix(`steem:posts:account:${author}:`);
          await cacheDeleteByPrefix(`steem:profile:${author}`);
        }
        await cacheDeleteByPrefix('steem:posts:ranked:');
        break;
      }
      case 'delete_comment':
      case 'custom_json': {
        // custom_json covers reblog/follow/mute — feeds & profiles may shift.
        await cacheDeleteByPrefix('steem:posts:ranked:');
        await cacheDeleteByPrefix('steem:profile:');
        break;
      }
      case 'account_update2': {
        // Profile settings save — the account's cached profile is stale.
        const account = String(opData.account || '');
        if (account) await cacheDeleteByPrefix(`steem:profile:${account}`);
        break;
      }
      default:
        // Other ops (transfer, witness, etc.) don't touch feed/profile caches.
        break;
    }
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
