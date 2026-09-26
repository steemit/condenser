/**
 * Client-side broadcast API
 * Signs transactions locally and forwards to API
 */

import {
  signCommentOperation,
  signVoteOperation,
  signCustomJsonOperation,
  signDeleteCommentOperation,
  signAccountUpdate2Operation,
  SignedTransaction
} from '@/lib/crypto/transaction-signer';
import { getCachedKey, decryptAndRetrieveKey } from '@/lib/crypto/key-storage';
import { invalidateFromResponse } from '@/lib/cache/client-fetch';
import type { CommentOptionsConfig } from '@/lib/utils/comment-options';

/**
 * Get private key for signing
 * Tries memory cache first, then decrypts from storage if needed
 */
async function getPrivateKeyForSigning(): Promise<string> {
  // Try memory cache first
  const cachedKey = getCachedKey();
  if (cachedKey) {
    return cachedKey;
  }

  // Decrypt from storage (no password needed, uses application-level key material)
  const decrypted = await decryptAndRetrieveKey();
  if (decrypted) {
    return decrypted.privateKey;
  }

  throw new Error('Private key not available. Please login again.');
}

/**
 * Optional cache-invalidation context sent alongside the signed transaction.
 *
 * `rootPermlink` names the ROOT discussion a comment-level write belongs to
 * (C2): a depth>=2 reply's op names only its immediate parent, and
 * delete_comment carries no parent reference at all — but the L1 entries
 * that must refresh after the write (/api/steem/post, /api/steem/comments)
 * are keyed by the ROOT permlink. The component rendering the discussion
 * knows the root and passes it down so the server can emit a
 * root-dimension X-Cache-Invalidate token. The server re-validates the
 * charset before using it; a bogus value only misses an eviction in the
 * sender's own browser.
 */
export interface BroadcastCacheContext {
  rootPermlink?: string;
}

/**
 * Broadcast a signed transaction to the Steem network
 */
async function broadcastSignedTransaction(
  signedTransaction: SignedTransaction,
  cacheContext?: BroadcastCacheContext
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  // Only carry the context when it names something — an empty object would
  // be dead weight on every vote/post broadcast.
  const hasCacheContext = Boolean(cacheContext?.rootPermlink);
  const response = await fetch('/api/steem/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      hasCacheContext ? { signedTransaction, cacheContext } : { signedTransaction }
    ),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to broadcast transaction');
  }

  // The server flags which L1 entries this write made stale
  // (X-Cache-Invalidate tokens) — apply before the next read.
  invalidateFromResponse(response);

  return response.json();
}

/**
 * Create and broadcast a comment/post
 */
export async function broadcastComment(
  params: {
    parentAuthor: string;
    parentPermlink: string;
    author: string;
    permlink: string;
    title: string;
    body: string;
    jsonMetadata: string;
    /** Payout/beneficiary options (root posts only); appended as a
     * comment_options op right after the comment op. */
    commentOptions?: CommentOptionsConfig;
    /** Root discussion permlink (comments/edits at any depth, C2). */
    rootPermlink?: string;
  }
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  const privateKey = await getPrivateKeyForSigning();

  const signedTransaction = await signCommentOperation(privateKey, {
    parentAuthor: params.parentAuthor,
    parentPermlink: params.parentPermlink,
    author: params.author,
    permlink: params.permlink,
    title: params.title,
    body: params.body,
    jsonMetadata: params.jsonMetadata,
  }, params.commentOptions);

  return broadcastSignedTransaction(signedTransaction, {
    rootPermlink: params.rootPermlink,
  });
}

/**
 * Create and broadcast a vote
 */
export async function broadcastVote(
  params: {
    voter: string;
    author: string;
    permlink: string;
    weight: number; // -10000 to 10000
    /** Root discussion permlink when voting on a COMMENT (C2). */
    rootPermlink?: string;
  }
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  const privateKey = await getPrivateKeyForSigning();

  const signedTransaction = await signVoteOperation(privateKey, {
    voter: params.voter,
    author: params.author,
    permlink: params.permlink,
    weight: params.weight,
  });

  return broadcastSignedTransaction(signedTransaction, {
    rootPermlink: params.rootPermlink,
  });
}

/**
 * Create and broadcast a custom JSON operation (follow, reblog, etc.)
 */
export async function broadcastCustomJson(
  params: {
    requiredAuths: string[];
    requiredPostingAuths: string[];
    id: string;
    json: string;
  }
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  const privateKey = await getPrivateKeyForSigning();
  
  const signedTransaction = await signCustomJsonOperation(privateKey, {
    requiredAuths: params.requiredAuths,
    requiredPostingAuths: params.requiredPostingAuths,
    id: params.id,
    json: params.json,
  });

  return broadcastSignedTransaction(signedTransaction);
}

/**
 * Broadcast a pre-signed transaction (for advanced use cases)
 */
export async function broadcastPreSignedTransaction(
  signedTransaction: SignedTransaction
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  return broadcastSignedTransaction(signedTransaction);
}

/**
 * Delete a comment/post (legacy Comment.jsx deletePost: broadcasts
 * delete_comment after the user confirms).
 */
export async function broadcastDeleteComment(
  params: {
    author: string;
    permlink: string;
    /** Root discussion permlink (C2) — the delete op carries no parent
     * reference, so the root context must come from the caller. */
    rootPermlink?: string;
  }
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  const privateKey = await getPrivateKeyForSigning();

  const signedTransaction = await signDeleteCommentOperation(privateKey, {
    author: params.author,
    permlink: params.permlink,
  });

  return broadcastSignedTransaction(signedTransaction, {
    rootPermlink: params.rootPermlink,
  });
}

/**
 * Update account profile metadata (legacy Settings.jsx updateAccount):
 * broadcasts account_update2 with the profile in posting_json_metadata.
 */
export async function broadcastAccountUpdate(
  params: {
    account: string;
    jsonMetadata: string;
    postingJsonMetadata: string;
  }
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  const privateKey = await getPrivateKeyForSigning();

  const signedTransaction = await signAccountUpdate2Operation(privateKey, {
    account: params.account,
    jsonMetadata: params.jsonMetadata,
    postingJsonMetadata: params.postingJsonMetadata,
  });

  return broadcastSignedTransaction(signedTransaction);
}
