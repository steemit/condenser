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

    if (firstOperation && Array.isArray(firstOperation) && firstOperation.length >= 2) {
      const opType = firstOperation[0];
      const opData = firstOperation[1];
      if (opData && typeof opData === 'object') {
        permlink = opData.permlink || opData.parent_permlink;
        // The actor varies by op type: vote/comment use `voter`/`author`,
        // custom_json (reblog/follow/mute) carries the signer in
        // `required_posting_auths[0]` and a nested payload — but not voter/author.
        if (opType === 'custom_json') {
          const postingAuths = (opData as Record<string, unknown>).required_posting_auths;
          actor = Array.isArray(postingAuths) ? String(postingAuths[0] || '') : undefined;
        } else {
          actor = (opData as Record<string, unknown>).voter as string
            || (opData as Record<string, unknown>).author as string;
        }
      }
    }

    // Invalidate read caches affected by this write. We scope by the prefixes
    // that could hold stale content rather than a blanket flush, mirroring the
    // wallet project's per-route invalidation. Failures here are non-critical.
    await invalidateAfterBroadcast(signedTransaction.operations);

    const response = NextResponse.json({
      success: true,
      result,
      transactionId: result?.id,
      permlink,
    });

    // Signal the browser (L1) cache to drop this user's entries. The value is
    // consumed by client-fetch.ts in PR2; harmless until then.
    if (actor) {
      response.headers.set('X-Cache-Invalidate', actor);
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
        const author = String(opData.author || '');
        const permlink = String(opData.permlink || '');
        const voter = String(opData.voter || '');
        if (author && permlink) await cacheDeleteByPrefix(`steem:post:${author}:${permlink}`);
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
