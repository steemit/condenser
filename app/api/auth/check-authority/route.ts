/**
 * Auth API Route: Check Authority
 * POST /api/auth/check-authority
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccount } from '@/lib/steem/client';
import { PrivateKey } from '@/lib/steem/client';

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

    // Derive private keys
    const isRole = (r: string, fn: () => InstanceType<typeof PrivateKey>) => (!role || role === r ? fn() : undefined);

    let privateKeys: {
      posting_private?: InstanceType<typeof PrivateKey>;
      active_private?: InstanceType<typeof PrivateKey>;
      owner_private?: InstanceType<typeof PrivateKey>;
      memo_private: InstanceType<typeof PrivateKey>;
    };

    try {
      // Try to parse as WIF (private key)
      const privateKey = PrivateKey.fromWif(password);
      privateKeys = {
        owner_private: isRole('owner', () => privateKey),
        posting_private: isRole('posting', () => privateKey),
        active_private: isRole('active', () => privateKey),
        memo_private: privateKey,
      };
    } catch (e) {
      // Not a WIF, treat as password and derive keys
      privateKeys = {
        posting_private: isRole('posting', () =>
          PrivateKey.fromSeed(username + 'posting' + password)
        ),
        active_private: isRole('active', () =>
          PrivateKey.fromSeed(username + 'active' + password)
        ),
        memo_private: PrivateKey.fromSeed(username + 'memo' + password),
      };
    }

    // Check authority (simplified version)
    const toPub = (k?: InstanceType<typeof PrivateKey>) => (k ? k.toPublicKey().toString() : '-');
    const postingPub = toPub(privateKeys.posting_private);
    const activePub = toPub(privateKeys.active_private);
    const ownerPub = toPub(privateKeys.owner_private);
    const memoPub = toPub(privateKeys.memo_private);

    // Simplified authority check
    const checkKeyAuth = (pubkey: string, authority: any): 'full' | 'partial' | 'none' => {
      if (!authority || !authority.key_auths) return 'none';
      for (const keyAuth of authority.key_auths) {
        const [key, weight] = Array.isArray(keyAuth) ? keyAuth : [keyAuth.key, keyAuth.weight];
        if (key === pubkey && weight >= (authority.weight_threshold || 1)) {
          return 'full';
        }
      }
      return 'none';
    };

    const auth = {
      posting: privateKeys.posting_private
        ? checkKeyAuth(postingPub, account.posting)
        : 'none',
      active: privateKeys.active_private
        ? checkKeyAuth(activePub, account.active)
        : 'none',
      owner: privateKeys.owner_private
        ? checkKeyAuth(ownerPub, account.owner)
        : 'none',
      memo: account.memo_key === memoPub ? 'full' : 'none',
    };

    return NextResponse.json({ auth, account });
  } catch (error: any) {
    console.error('Error checking authority:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check authority' },
      { status: 500 }
    );
  }
}

