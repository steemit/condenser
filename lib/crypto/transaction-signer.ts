/**
 * Client-side transaction signing utilities
 * Signs transactions locally before sending to API
 */

// @ts-expect-error - steem is exported but TypeScript types may not reflect it
import * as steemModule from '@steemit/steem-js';
const steem = (steemModule as { steem: any }).steem;

const PrivateKey = steem.PrivateKey;

export interface SignedTransaction {
  ref_block_num: number;
  ref_block_prefix: number;
  expiration: string;
  operations: any[];
  extensions: any[];
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
    const privateKey = PrivateKey.fromWif(privateKeyWif);

    // Create transaction object
    const tx: any = {
      ref_block_num: transaction.ref_block_num,
      ref_block_prefix: transaction.ref_block_prefix,
      expiration: transaction.expiration,
      operations: transaction.operations,
      extensions: transaction.extensions || [],
    };

    // Serialize transaction
    const serializedTx = steem.transaction.toBuffer(tx);

    // Sign transaction
    const signature = privateKey.sign(serializedTx);
    const signatureString = signature.toString();

    return {
      ...transaction,
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
    const operation = [
      'comment',
      {
        parent_author: params.parentAuthor || '',
        parent_permlink: params.parentPermlink,
        author: params.author,
        permlink: params.permlink,
        title: params.title,
        body: params.body,
        json_metadata: params.jsonMetadata,
      },
    ];

    // Create transaction
    const transaction = {
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
    const operation = [
      'vote',
      {
        voter: params.voter,
        author: params.author,
        permlink: params.permlink,
        weight: params.weight,
      },
    ];

    // Create transaction
    const transaction = {
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
    const operation = [
      'custom_json',
      {
        required_auths: params.requiredAuths || [],
        required_posting_auths: params.requiredPostingAuths || [],
        id: params.id,
        json: params.json,
      },
    ];

    // Create transaction
    const transaction = {
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
