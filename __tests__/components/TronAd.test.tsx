import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Audit N-19: the vendored Tron ads SDK relays the ad iframe's postMessage
 * `clickUrl` value straight into window.open without validation; the guard
 * installed by the TronAd component must block non-http(s) URLs while
 * passing through every legitimate open.
 *
 * The guard carries module state (installed-once flag), so each case
 * re-imports the module freshly.
 */
describe('TronAd window.open guard (audit N-19)', () => {
  const originalOpen = window.open;
  let openSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    openSpy = vi.fn().mockReturnValue(null);
    window.open = openSpy as unknown as typeof window.open;
  });

  afterEach(() => {
    window.open = originalOpen;
    vi.restoreAllMocks();
  });

  async function freshInstall() {
    const { installWindowOpenGuard } = await import('@/components/elements/TronAd');
    installWindowOpenGuard();
  }

  it('passes absolute http(s) URLs (and no-URL opens) through unchanged', async () => {
    await freshInstall();

    window.open('https://engine.tronads.io/click', '_blank');
    window.open('http://example.com/x');
    window.open(undefined, '_blank');

    expect(openSpy).toHaveBeenCalledTimes(3);
    expect(openSpy).toHaveBeenNthCalledWith(
      1,
      'https://engine.tronads.io/click',
      '_blank',
      undefined
    );
    expect(openSpy).toHaveBeenNthCalledWith(2, 'http://example.com/x', undefined, undefined);
    expect(openSpy).toHaveBeenNthCalledWith(3, undefined, '_blank', undefined);
  });

  it('blocks javascript:, data: and other non-http(s) URLs', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    openSpy.mockReturnValue({} as Window);
    await freshInstall();

    expect(window.open('javascript:alert(1)', '_blank')).toBeNull();
    expect(window.open('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(window.open('//protocol-relative.example/x')).toBeNull();
    expect(openSpy).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it('is idempotent — installing twice does not wrap twice', async () => {
    const { installWindowOpenGuard } = await import('@/components/elements/TronAd');
    installWindowOpenGuard();
    installWindowOpenGuard();

    window.open('https://example.com/ok');
    expect(openSpy).toHaveBeenCalledTimes(1);
  });
});
