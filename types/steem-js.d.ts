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
  // Runtime export used by current codebase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const steem: any;

  // Root-level helpers from dist/crypto (steem-js 1.x).
  // NOTE: Signature/PublicKey classes are NOT exported at the package root
  // at runtime — only under steem.auth.*. Do not re-add declarations for
  // them here; declaring non-existent exports masks runtime failures.
  export const verify: (message: string | Buffer, signature: string, publicKey: string) => boolean;
  export const sign: (message: string | Buffer, privateKey: string) => string;

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
    call(method: string, params: unknown, callback: (err: unknown, data: unknown) => void): void;
    getAccountsAsync(usernames: string[]): Promise<unknown[]>;
    getDynamicGlobalPropertiesAsync(): Promise<unknown>;
    getFollowingAsync(account: string, start: string, type: string, limit: number): Promise<unknown[]>;
    getFollowersAsync(account: string, start: string, type: string, limit: number): Promise<unknown[]>;
  };

  export const config: {
    set(key: string, value: string): void;
    get(key: string): string;
  };
}

