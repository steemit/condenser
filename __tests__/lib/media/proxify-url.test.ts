import bs58 from 'bs58';
import { describe, expect, it } from 'vitest';
import {
  defaultSrcSet,
  defaultWidth,
  isDefaultImageSize,
  proxifyImageUrl,
} from '@/lib/media/proxify-url';

const PROXY = 'https://steemitimages.com/';

/** Decode the base58 payload of a /p/ proxy URL. */
function decodeProxied(url: string): string {
  const u = new URL(url);
  const b58 = u.pathname.replace(/^\/p\//, '');
  return Buffer.from(bs58.decode(b58)).toString('utf8');
}

describe('proxifyImageUrl', () => {
  it('returns the bare URL unchanged when there is no proxy wrapper and no dimensions', () => {
    expect(proxifyImageUrl('https://example.com/pic.jpg')).toBe(
      'https://example.com/pic.jpg'
    );
  });

  it('strips a legacy proxy wrapper when dimensions are falsy', () => {
    expect(
      proxifyImageUrl('https://steemitimages.com/640x0/https://example.com/pic.jpg')
    ).toBe('https://example.com/pic.jpg');
  });

  it('passes third-party images through unproxied (#3976)', () => {
    expect(proxifyImageUrl('https://example.com/pic.jpg', true)).toBe(
      'https://example.com/pic.jpg'
    );
  });

  it('proxies first-party images via /p/ at the capped 640px width', () => {
    const out = proxifyImageUrl('https://steemitimages.com/QmX/photo.png', true);
    const u = new URL(out);
    expect(u.origin).toBe('https://steemitimages.com');
    expect(u.pathname.startsWith('/p/')).toBe(true);
    expect(u.searchParams.get('mode')).toBe('fit');
    expect(u.searchParams.get('format')).toBe('match');
    expect(u.searchParams.get('width')).toBe(String(defaultWidth()));
    expect(u.searchParams.get('height')).toBeNull();
    expect(decodeProxied(out)).toBe('https://steemitimages.com/QmX/photo.png');
  });

  it('canonicalizes steemitimages.com/D* uploads to the cdn host before encoding (#3978)', () => {
    const out = proxifyImageUrl('https://steemitimages.com/DQmXabc/photo.png', true);
    expect(decodeProxied(out)).toBe(
      'https://cdn.steemitimages.com/DQmXabc/photo.png'
    );
  });

  it('keeps GIFs at natural size (no width cap)', () => {
    const out = proxifyImageUrl('https://steemitimages.com/anim.gif', true);
    const u = new URL(out);
    expect(u.pathname.startsWith('/p/')).toBe(true);
    expect(u.searchParams.get('width')).toBeNull();
    expect(u.searchParams.get('height')).toBeNull();
  });

  it('honours explicit dimensions for first-party images', () => {
    const out = proxifyImageUrl('https://steemitimages.com/QmX/photo.png', '256x512/');
    const u = new URL(out);
    expect(u.searchParams.get('width')).toBe('256');
    expect(u.searchParams.get('height')).toBe('512');
  });

  it('does not re-encode an existing /p/ URL, only rewrites its query (#3977)', () => {
    const once = proxifyImageUrl('https://steemitimages.com/QmX/photo.png', '640x0/');
    const twice = proxifyImageUrl(once, '640x0/');
    const a = new URL(once);
    const b = new URL(twice);
    expect(b.pathname).toBe(a.pathname);
    expect(b.searchParams.get('mode')).toBe('fit');
    expect(b.searchParams.get('format')).toBe('match');
    expect(b.searchParams.get('width')).toBe('640');
  });

  it('returns malformed URLs untouched', () => {
    expect(proxifyImageUrl('not a url', true)).toBe('not a url');
  });
});

describe('defaultSrcSet', () => {
  it('builds a 1x/2x srcset for legacy path-based sizing', () => {
    const url = `${PROXY}640x0/https://example.com/pic.jpg`;
    expect(defaultSrcSet(url)).toBe(
      `${url} 1x, ${PROXY}1280x0/https://example.com/pic.jpg 2x`
    );
  });

  it('doubles the width for /p/ URLs', () => {
    const url = `${PROXY}p/abc?width=640`;
    expect(defaultSrcSet(url)).toBe(`${url} 1x, ${PROXY}p/abc?width=1280 2x`);
  });

  it('falls back to 1x only when there is no usable width', () => {
    expect(defaultSrcSet('https://example.com/pic.jpg')).toBe(
      'https://example.com/pic.jpg 1x'
    );
  });
});

describe('isDefaultImageSize', () => {
  it('recognizes the legacy capped-size prefix', () => {
    expect(
      isDefaultImageSize(`${PROXY}640x0/https://example.com/pic.jpg`)
    ).toBe(true);
  });

  it('recognizes /p/ URLs at the default width only', () => {
    expect(isDefaultImageSize(`${PROXY}p/abc?width=${defaultWidth()}`)).toBe(true);
    expect(isDefaultImageSize(`${PROXY}p/abc?width=1280`)).toBe(false);
    expect(isDefaultImageSize('https://example.com/pic.jpg')).toBe(false);
  });
});
