/**
 * Client-side broadcast API
 * Signs transactions locally and forwards to API
 */

import {
  signCommentOperation,
  signVoteOperation,
  signCustomJsonOperation,
  signDeleteCommentOperation,
  SignedTransaction
} from '@/lib/crypto/transaction-signer';
import { getCachedKey, decryptAndRetrieveKey } from '@/lib/crypto/key-storage';
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
 * Broadcast a signed transaction to the Steem network
 */
async function broadcastSignedTransaction(signedTransaction: SignedTransaction): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  const response = await fetch('/api/steem/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      signedTransaction,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to broadcast transaction');
  }

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

  return broadcastSignedTransaction(signedTransaction);
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
  }
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  const privateKey = await getPrivateKeyForSigning();
  
  const signedTransaction = await signVoteOperation(privateKey, {
    voter: params.voter,
    author: params.author,
    permlink: params.permlink,
    weight: params.weight,
  });

  return broadcastSignedTransaction(signedTransaction);
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
  }
): Promise<{ success: boolean; result: unknown; transactionId?: string; permlink?: string }> {
  const privateKey = await getPrivateKeyForSigning();

  const signedTransaction = await signDeleteCommentOperation(privateKey, {
    author: params.author,
    permlink: params.permlink,
  });

  return broadcastSignedTransaction(signedTransaction);
}
