/**
 * Client-side transaction signing utilities
 * Signs transactions locally before sending to API
 */

// Import steem object directly as a named export
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { steem } from '@steemit/steem-js';

// Import types directly from dist (these are TypeScript definition files)
// @ts-expect-error - TypeScript can't resolve these paths, but they exist at runtime
import type { Transaction } from '@steemit/steem-js/dist/types';

// Get classes and functions from steem object at runtime
const PrivateKeyClass = steem.auth.PrivateKey;
const SignatureClass = steem.auth.Signature;
const serializeTransaction = steem.serializer.serializeTransaction;
const createComment = steem.operations.createComment;
const createVote = steem.operations.createVote;
const createCustomJson = steem.operations.createCustomJson;

/**
 * Signed transaction with signatures
 * Operations can be in tuple format (as created by operations module) or Operation[] format
 */
export interface SignedTransaction extends Omit<Transaction, 'operations'> {
  operations: Transaction['operations'] | Array<[string, Record<string, unknown>]>;
  signatures: string[];
}

/**
 * Sign a transaction with private key
 */
export async function signTransaction(
  transaction: Omit<SignedTransaction, 'signatures'>,
  privateKeyWif: string
): Promise<SignedTransaction> {
  try {
    const privateKey = PrivateKeyClass.fromWif(privateKeyWif);

    // Create transaction object
    // Note: serializer accepts operations in tuple format, but Transaction type expects Operation[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx: any = {
      ref_block_num: transaction.ref_block_num,
      ref_block_prefix: transaction.ref_block_prefix,
      expiration: transaction.expiration,
      operations: transaction.operations,
      extensions: transaction.extensions || [],
    };

    // Serialize transaction
    const serializedTx = serializeTransaction(tx as Transaction);

    // Sign transaction using Signature.signBufferSha256
    const signature = SignatureClass.signBufferSha256(serializedTx, privateKey);
    const signatureString = signature.toHex();

    return {
      ...transaction,
      operations: transaction.operations,
      extensions: transaction.extensions || [],
      signatures: [signatureString],
    };
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
  }
): Promise<SignedTransaction> {
  try {
    // Get dynamic global properties for transaction header
    const response = await fetch('/api/steem/dynamic-global-properties');
    if (!response.ok) {
      throw new Error('Failed to get dynamic global properties');
    }
    const props = await response.json();

    // Calculate transaction header
    const headBlockNumber = props.head_block_number;
    const refBlockNum = headBlockNumber & 0xffff;
    const headBlockId = props.head_block_id;
    const refBlockPrefix = Buffer.from(headBlockId, 'hex').readUInt32LE(4);

    // Calculate expiration (1 hour from now)
    const expiration = new Date(Date.now() + 60 * 60 * 1000);
    const expirationStr = expiration.toISOString().slice(0, -5);

    // Create comment operation
    const operation = createComment(
      params.parentAuthor || '',
      params.parentPermlink,
      params.author,
      params.permlink,
      params.title,
      params.body,
      params.jsonMetadata
    );

    // Create transaction
    const transaction: Omit<SignedTransaction, 'signatures'> = {
      ref_block_num: refBlockNum,
      ref_block_prefix: refBlockPrefix,
      expiration: expirationStr,
      operations: [operation],
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
    // Get dynamic global properties
    const response = await fetch('/api/steem/dynamic-global-properties');
    if (!response.ok) {
      throw new Error('Failed to get dynamic global properties');
    }
    const props = await response.json();

    // Calculate transaction header
    const headBlockNumber = props.head_block_number;
    const refBlockNum = headBlockNumber & 0xffff;
    const headBlockId = props.head_block_id;
    const refBlockPrefix = Buffer.from(headBlockId, 'hex').readUInt32LE(4);

    // Calculate expiration
    const expiration = new Date(Date.now() + 60 * 60 * 1000);
    const expirationStr = expiration.toISOString().slice(0, -5);

    // Create vote operation
    const operation = createVote(
      params.voter,
      params.author,
      params.permlink,
      params.weight
    );

    // Create transaction
    const transaction: Omit<SignedTransaction, 'signatures'> = {
      ref_block_num: refBlockNum,
      ref_block_prefix: refBlockPrefix,
      expiration: expirationStr,
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
    // Get dynamic global properties
    const response = await fetch('/api/steem/dynamic-global-properties');
    if (!response.ok) {
      throw new Error('Failed to get dynamic global properties');
    }
    const props = await response.json();

    // Calculate transaction header
    const headBlockNumber = props.head_block_number;
    const refBlockNum = headBlockNumber & 0xffff;
    const headBlockId = props.head_block_id;
    const refBlockPrefix = Buffer.from(headBlockId, 'hex').readUInt32LE(4);

    // Calculate expiration
    const expiration = new Date(Date.now() + 60 * 60 * 1000);
    const expirationStr = expiration.toISOString().slice(0, -5);

    // Create custom_json operation
    const operation = createCustomJson(
      params.requiredAuths || [],
      params.requiredPostingAuths || [],
      params.id,
      params.json
    );

    // Create transaction
    const transaction: Omit<SignedTransaction, 'signatures'> = {
      ref_block_num: refBlockNum,
      ref_block_prefix: refBlockPrefix,
      expiration: expirationStr,
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
