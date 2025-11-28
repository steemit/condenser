/**
 * Authentication API
 * Handles user login, logout, and authentication-related operations
 * Migrated from legacy/src/app/redux/UserSaga.js and AuthSaga.js
 * 
 * Note: Steem-js operations should be done server-side via API routes
 * This file contains client-side utilities and types
 */

export interface LoginParams {
  username: string;
  password: string;
  saveLogin?: boolean;
  operationType?: string;
}

export interface Account {
  name: string;
  posting: any;
  active: any;
  owner: any;
  memo_key: string;
  [key: string]: any;
}

/**
 * Get account information from Steem API (via server API route)
 */
export async function getAccount(username: string): Promise<Account | null> {
  try {
    const response = await fetch(`/api/steem/account?username=${encodeURIComponent(username)}`);
    if (!response.ok) {
      return null;
    }
    const account = await response.json();
    return account;
  } catch (error) {
    console.error('Error fetching account:', error);
    return null;
  }
}

/**
 * Check authority level for a given account and private keys (via server API route)
 */
export async function checkAuthority(params: {
  username: string;
  password: string;
  role?: string;
}): Promise<{
  auth: {
    posting: string;
    active: string;
    owner: string;
    memo: string;
  };
  account: Account | null;
} | null> {
  try {
    const response = await fetch('/api/auth/check-authority', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking authority:', error);
    return null;
  }
}

/**
 * Server API login (if using server-side authentication)
 */
export async function serverApiLogin(
  username: string,
  signatures: Record<string, string>
): Promise<Response> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, signatures }),
  });

  return response;
}

