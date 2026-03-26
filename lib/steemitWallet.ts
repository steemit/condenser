/**
 * Steemit wallet is hosted outside Condenser. This returns the wallet origin only.
 *
 * - Set NEXT_PUBLIC_WALLET_URL to override (e.g. https://wallet.steemitdev.com for test).
 * - Production default: https://steemitwallet.com
 * - Local `next dev` (NODE_ENV=development): https://wallet.steemitdev.com
 */
export function getSteemitWalletBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WALLET_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "https://wallet.steemitdev.com";
  }
  return "https://steemitwallet.com";
}
