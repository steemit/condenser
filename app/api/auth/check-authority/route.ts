/**
 * Auth API Route: Check Authority
 * POST /api/auth/check-authority
 */

import { NextRequest, NextResponse } from 'next/server';
import { steem } from '@steemit/steem-js';
import { getAccount } from '@/lib/steem/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get account
    const account = await getAccount(username);
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Derive public keys via the steem-js SDK auth helpers.
    const isRole = (r: string, fn: () => string) => (!role || role === r ? fn() : undefined);

    let publicKeys: {
      posting_pub?: string;
      active_pub?: string;
      owner_pub?: string;
      memo_pub: string;
    };

    if (steem.auth.isWif(password)) {
      // A WIF: check the same key against every role
      const pub = steem.auth.wifToPublic(password);
      publicKeys = {
        owner_pub: isRole('owner', () => pub),
        posting_pub: isRole('posting', () => pub),
        active_pub: isRole('active', () => pub),
        memo_pub: pub,
      };
    } else {
      // A master password: derive per-role keys
      const derivePub = (r: string) => steem.auth.wifToPublic(steem.auth.toWif(username, password, r));
      publicKeys = {
        posting_pub: isRole('posting', () => derivePub('posting')),
        active_pub: isRole('active', () => derivePub('active')),
        memo_pub: derivePub('memo'),
      };
    }

    // Check authority (simplified version)
    const postingPub = publicKeys.posting_pub ?? '-';
    const activePub = publicKeys.active_pub ?? '-';
    const ownerPub = publicKeys.owner_pub ?? '-';
    const memoPub = publicKeys.memo_pub;

    // Simplified authority check
    /**
     * Checks the authority of a given public key against an account authority object.
     * @param pubkey The public key to check.
     * @param authority The account authority object with key_auths and weight_threshold.
     * @returns 'full' if the key meets the threshold, 'none' otherwise.
     */
    type KeyAuth = [string, number] | { key: string; weight: number };
    type Authority = {
      key_auths: KeyAuth[];
      weight_threshold: number;
    };
    type AccountWithAuthorities = {
      posting?: Authority;
      active?: Authority;
      owner?: Authority;
      memo_key?: string;
    };
    const accountData = account as AccountWithAuthorities;

    const checkKeyAuth = (
      pubkey: string,
      authority: Authority | undefined | null
    ): 'full' | 'partial' | 'none' => {
      if (!authority || !authority.key_auths) return 'none';
      for (const keyAuth of authority.key_auths) {
        const [key, weight] = Array.isArray(keyAuth)
          ? keyAuth
          : [keyAuth.key, keyAuth.weight];
        if (key === pubkey && weight >= (authority.weight_threshold || 1)) {
          return 'full';
        }
      }
      return 'none';
    };

    const auth = {
      posting: publicKeys.posting_pub
        ? checkKeyAuth(postingPub, accountData.posting)
        : 'none',
      active: publicKeys.active_pub
        ? checkKeyAuth(activePub, accountData.active)
        : 'none',
      owner: publicKeys.owner_pub
        ? checkKeyAuth(ownerPub, accountData.owner)
        : 'none',
      memo: accountData.memo_key === memoPub ? 'full' : 'none',
    };

    return NextResponse.json({ auth, account });
  } catch (error: unknown) {
    console.error('Error checking authority:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check authority';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

