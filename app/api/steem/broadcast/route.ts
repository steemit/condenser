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
    // The API only forwards, it does not sign or modify the transaction
    const result = await callSteemApi('broadcast_transaction', [signedTransaction]);

    // Extract operation details for response
    const firstOperation = signedTransaction.operations[0];
    let permlink: string | undefined;
    
    if (firstOperation && Array.isArray(firstOperation) && firstOperation.length >= 2) {
      const opData = firstOperation[1];
      if (opData && typeof opData === 'object') {
        permlink = opData.permlink || opData.parent_permlink;
      }
    }

    return NextResponse.json({
      success: true,
      result,
      transactionId: result?.id,
      permlink,
    });
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
