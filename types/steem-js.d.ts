/**
 * Type declarations for @steemit/steem-js
 */

declare module '@steemit/steem-js/lib/auth/ecc' {
  export class PrivateKey {
    static fromWif(wif: string): PrivateKey;
    static fromSeed(seed: string): PrivateKey;
    toPublicKey(): PublicKey;
    toString(): string;
  }

  export class PublicKey {
    toString(): string;
  }
}

declare module '@steemit/steem-js' {
  export const api: {
    setOptions(options: {
      url: string;
      retry?: boolean | {
        retries?: number;
        factor?: number;
        minTimeout?: number;
        maxTimeout?: number;
        randomize?: boolean;
      };
      useAppbaseApi?: boolean;
    }): void;
    call(method: string, params: any, callback: (err: any, data: any) => void): void;
    getAccountsAsync(usernames: string[]): Promise<any[]>;
    getDynamicGlobalPropertiesAsync(): Promise<any>;
    getFollowingAsync(account: string, start: string, type: string, limit: number): Promise<any[]>;
    getFollowersAsync(account: string, start: string, type: string, limit: number): Promise<any[]>;
  };

  export const config: {
    set(key: string, value: string): void;
    get(key: string): string;
  };
}

