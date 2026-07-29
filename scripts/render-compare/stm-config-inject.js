/**
 * esbuild `inject` shim providing the legacy global $STM_Config for the
 * bundled legacy pipeline. Mirrors config/production.json values that matter
 * to ProxifyUrl/HtmlReady, and matches the next implementation's defaults
 * (NEXT_PUBLIC_IMAGE_PROXY_PREFIX fallback, no IPFS gateway).
 */
export const $STM_Config = {
  img_proxy_prefix: 'https://steemitimages.com/',
  ipfs_prefix: false,
};
