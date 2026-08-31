/**
 * Client-side transaction signing utilities
 * Signs transactions locally before sending to API
 */

// Import steem object directly as a named export
import { steem } from '@steemit/steem-js';

import type { CommentOptionsConfig } from '@/lib/utils/comment-options';

// Import types directly from dist (these are TypeScript definition files)
// @ts-expect-error - TypeScript can't resolve these paths, but they exist at runtime
import type { Transaction } from '@steemit/steem-js/dist/types';

// Get operation factories from steem object at runtime
const createComment = steem.operations.createComment;
const createVote = steem.operations.createVote;
const createCustomJson = steem.operations.createCustomJson;

/**
 * The operation factories return `{0: name, 1: payload}` objects, but the
 * transaction serializer requires real `[name, payload]` array tuples.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toOperationTuple(op: any): [string, Record<string, unknown>] {
  return [op[0], op[1]];
}

/**
 * Signed transaction with signatures
 * Operations can be in tuple format (as created by operations module) or Operation[] format
 */
export interface SignedTransaction extends Omit<Transaction, 'operations'> {
  operations: Transaction['operations'] | Array<[string, Record<string, unknown>]>;
  signatures: string[];
}

/**
 * Build the transaction header from the chain's dynamic global properties.
 *
 * The expiration MUST be based on the chain head block time (props.time),
 * not the client wall clock: steemd rejects transactions whose expiration
 * exceeds head_time + STEEM_MAX_TIME_UNTIL_EXPIRATION (1h), and head_time
 * lags wall clock by a few seconds — so "client now + 1h" is right at the
 * boundary and intermittently fails with transaction_expiration_exception,
 * quite apart from client clock skew. Head time + 10 minutes matches the
 * wallet's transaction-header approach and leaves ample margin.
 */
async function getTransactionHeader(): Promise<{
  ref_block_num: number;
  ref_block_prefix: number;
  expiration: string;
}> {
  const response = await fetch('/api/steem/dynamic-global-properties');
  if (!response.ok) {
    throw new Error('Failed to get dynamic global properties');
  }
  const props = await response.json();

  const headBlockNumber = props.head_block_number;
  const refBlockNum = headBlockNumber & 0xffff;
  const headBlockId = props.head_block_id;
  const refBlockPrefix = Buffer.from(headBlockId, 'hex').readUInt32LE(4);

  // props.time is the head block time as "YYYY-MM-DDTHH:MM:SS" (UTC, no Z).
  const headTimeStr: string = props.time;
  const headTimeMs = new Date(headTimeStr.endsWith('Z') ? headTimeStr : headTimeStr + 'Z').getTime();
  if (!Number.isFinite(headTimeMs)) {
    throw new Error('Invalid head block time in dynamic global properties');
  }
  const expiration = new Date(headTimeMs + 600 * 1000).toISOString().slice(0, -5);

  return { ref_block_num: refBlockNum, ref_block_prefix: refBlockPrefix, expiration };
}

/**
 * Sign a transaction with private key
 */
export async function signTransaction(
  transaction: Omit<SignedTransaction, 'signatures'>,
  privateKeyWif: string
): Promise<SignedTransaction> {
  try {
    // Delegate digest building and signing to steem-js: it signs
    // sha256(chain_id || serialize(trx)) with the config chain_id
    // (default: Steem mainnet) and returns a signed_transaction object with
    // hex signatures. The previous hand-rolled path referenced
    // steem.serializer (removed in @steemit/steem-js 1.x, crashed at module
    // load) and also omitted the chain id from the digest.
    const signed = steem.auth.signTransaction(
      {
        ref_block_num: transaction.ref_block_num,
        ref_block_prefix: transaction.ref_block_prefix,
        expiration: transaction.expiration,
        operations: transaction.operations,
        extensions: transaction.extensions || [],
      },
      [privateKeyWif]
    );

    return signed as SignedTransaction;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to sign transaction: ${errorMessage}`);
  }
}

/**
 * Create and sign a comment operation
 */
export async function signCommentOperation(
  privateKeyWif: string,
  params: {
    parentAuthor: string;
    parentPermlink: string;
    author: string;
    permlink: string;
    title: string;
    body: string;
    jsonMetadata: string;
  },
  commentOptions?: CommentOptionsConfig
): Promise<SignedTransaction> {
  try {
    const header = await getTransactionHeader();

    // Create comment operation
    const operation = toOperationTuple(createComment(
      params.parentAuthor || '',
      params.parentPermlink,
      params.author,
      params.permlink,
      params.title,
      params.body,
      params.jsonMetadata
    ));

    const operations: Array<[string, Record<string, unknown>]> = [operation];

    // comment_options must come directly after comment (legacy
    // TransactionSaga.js preBroadcast_comment stresses this ordering).
    // @steemit/steem-js 1.x has no createCommentOptions factory, but its
    // serializer supports the op, so the tuple is constructed manually with
    // the same defaults legacy applies.
    if (commentOptions) {
      operations.push([
        'comment_options',
        {
          author: params.author,
          permlink: params.permlink,
          max_accepted_payout:
            commentOptions.maxAcceptedPayout ?? '1000000.000 SBD',
          percent_steem_dollars:
            commentOptions.percentSteemDollars ?? 10000, // 10000 === 100%
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: commentOptions.extensions ?? [],
        },
      ]);
    }

    // Create transaction
    const transaction: Omit<SignedTransaction, 'signatures'> = {
      ref_block_num: header.ref_block_num,
      ref_block_prefix: header.ref_block_prefix,
      expiration: header.expiration,
      operations,
      extensions: [],
    };

    // Sign transaction
    return await signTransaction(transaction, privateKeyWif);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create comment operation: ${errorMessage}`);
  }
}

/**
 * Create and sign a vote operation
 */
export async function signVoteOperation(
  privateKeyWif: string,
  params: {
    voter: string;
    author: string;
    permlink: string;
    weight: number; // -10000 to 10000
  }
): Promise<SignedTransaction> {
  try {
    const header = await getTransactionHeader();

    // Create vote operation
    const operation = toOperationTuple(createVote(
      params.voter,
      params.author,
      params.permlink,
      params.weight
    ));

    // Create transaction
    const transaction: Omit<SignedTransaction, 'signatures'> = {
      ref_block_num: header.ref_block_num,
      ref_block_prefix: header.ref_block_prefix,
      expiration: header.expiration,
      operations: [operation],
      extensions: [],
    };

    // Sign transaction
    return await signTransaction(transaction, privateKeyWif);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create vote operation: ${errorMessage}`);
  }
}

/**
 * Create and sign a custom JSON operation (for follow, reblog, etc.)
 */
export async function signCustomJsonOperation(
  privateKeyWif: string,
  params: {
    requiredAuths: string[];
    requiredPostingAuths: string[];
    id: string;
    json: string;
  }
): Promise<SignedTransaction> {
  try {
    const header = await getTransactionHeader();

    // Create custom_json operation
    const operation = toOperationTuple(createCustomJson(
      params.requiredAuths || [],
      params.requiredPostingAuths || [],
      params.id,
      params.json
    ));

    // Create transaction
    const transaction: Omit<SignedTransaction, 'signatures'> = {
      ref_block_num: header.ref_block_num,
      ref_block_prefix: header.ref_block_prefix,
      expiration: header.expiration,
      operations: [operation],
      extensions: [],
    };

    // Sign transaction
    return await signTransaction(transaction, privateKeyWif);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create custom_json operation: ${errorMessage}`);
  }
}

/**
 * Create and sign a delete_comment operation (legacy Comment.jsx
 * deletePost). steem-js 1.x has no createDeleteComment factory, but its
 * serializer supports the op, so the tuple is constructed manually.
 */
export async function signDeleteCommentOperation(
  privateKeyWif: string,
  params: {
    author: string;
    permlink: string;
  }
): Promise<SignedTransaction> {
  try {
    const header = await getTransactionHeader();

    const transaction: Omit<SignedTransaction, 'signatures'> = {
      ref_block_num: header.ref_block_num,
      ref_block_prefix: header.ref_block_prefix,
      expiration: header.expiration,
      operations: [
        [
          'delete_comment',
          { author: params.author, permlink: params.permlink },
        ],
      ],
      extensions: [],
    };

    return await signTransaction(transaction, privateKeyWif);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create delete_comment operation: ${errorMessage}`);
  }
}
