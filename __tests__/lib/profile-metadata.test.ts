import { describe, expect, it } from 'vitest';

import {
  safeCoverImageUrl,
  safeProfileWebsite,
} from '@/lib/profile-metadata';

describe('safeCoverImageUrl (audit N-06)', () => {
  it('accepts a plain third-party http(s) image URL unchanged', () => {
    expect(safeCoverImageUrl('https://example.com/cover.jpg')).toBe(
      'https://example.com/cover.jpg'
    );
    expect(safeCoverImageUrl('http://example.com/cover.jpg')).toBe(
      'http://example.com/cover.jpg'
    );
  });

  it('accepts a first-party (steemitimages.com) URL unchanged', () => {
    expect(safeCoverImageUrl('https://steemitimages.com/DQmXabc/cover.png')).toBe(
      'https://steemitimages.com/DQmXabc/cover.png'
    );
  });

  it('trims surrounding whitespace', () => {
    expect(safeCoverImageUrl('  https://example.com/c.jpg  ')).toBe(
      'https://example.com/c.jpg'
    );
  });

  it('rejects the audit CSS-injection payload', () => {
    expect(
      safeCoverImageUrl(
        'https://evil.com/a.jpg);position:fixed;top:0;left:0;width:100%;height:100%;background:red;z-index:9999'
      )
    ).toBeNull();
  });

  it('rejects values that close the url() token or chain declarations', () => {
    expect(safeCoverImageUrl('https://evil.com/a.jpg);color:red')).toBeNull();
    expect(safeCoverImageUrl('https://evil.com/a.jpg))')).toBeNull();
    expect(safeCoverImageUrl('https://evil.com/a.jpg(attr')).toBeNull();
    expect(safeCoverImageUrl('https://evil.com/a.jpg{a:b}')).toBeNull();
  });

  it('rejects quotes, angle brackets and backslash escapes', () => {
    expect(safeCoverImageUrl('https://evil.com/a.jpg"><script>')).toBeNull();
    expect(safeCoverImageUrl(`https://evil.com/a.jpg'`)).toBeNull();
    expect(safeCoverImageUrl('https://evil.com/a.jpg\\3b')).toBeNull();
    expect(safeCoverImageUrl('https://evil.com/a\\;b.jpg')).toBeNull();
  });

  it('rejects non-http(s) schemes and malformed values', () => {
    expect(safeCoverImageUrl('javascript:alert(1)')).toBeNull();
    expect(safeCoverImageUrl('data:image/svg+xml,<svg onload=alert(1)>')).toBeNull();
    expect(safeCoverImageUrl('//example.com/cover.jpg')).toBeNull();
    expect(safeCoverImageUrl('/local/path.jpg')).toBeNull();
    expect(safeCoverImageUrl('https://')).toBeNull(); // no hostname
  });

  it('rejects embedded control characters and raw spaces', () => {
    expect(safeCoverImageUrl('https://evil.com/a\n.jpg);color:red')).toBeNull();
    expect(safeCoverImageUrl('https://evil.com/a.jpg\t;x:y')).toBeNull();
    expect(safeCoverImageUrl('https://evil.com/my pic.jpg')).toBeNull();
  });

  it('returns null for missing/empty/non-string values', () => {
    expect(safeCoverImageUrl(undefined)).toBeNull();
    expect(safeCoverImageUrl(null)).toBeNull();
    expect(safeCoverImageUrl('')).toBeNull();
    expect(safeCoverImageUrl('   ')).toBeNull();
  });
});

describe('safeProfileWebsite (audit N-16)', () => {
  it('links a normal http(s) URL and strips scheme/www/trailing slash in the label', () => {
    expect(safeProfileWebsite('https://example.com/blog/')).toEqual({
      href: 'https://example.com/blog/',
      label: 'example.com/blog',
    });
    expect(safeProfileWebsite('http://www.example.com')).toEqual({
      href: 'http://www.example.com',
      label: 'example.com',
    });
    expect(safeProfileWebsite('https://www.steemit.com/@alice')).toEqual({
      href: 'https://www.steemit.com/@alice',
      label: 'steemit.com/@alice',
    });
  });

  it('degrades javascript: and data: URLs to plain text (no href)', () => {
    expect(safeProfileWebsite('javascript:alert(1)')).toEqual({
      href: null,
      label: 'javascript:alert(1)',
    });
    expect(
      safeProfileWebsite('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')
    ).toEqual({
      href: null,
      label: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    });
  });

  it('degrades non-http(s) schemes and scheme-relative values to plain text', () => {
    expect(safeProfileWebsite('ftp://files.example.com')).toEqual({
      href: null,
      label: 'ftp://files.example.com',
    });
    expect(safeProfileWebsite('//example.com')).toEqual({
      href: null,
      label: '//example.com',
    });
  });

  it('degrades blacklisted (phishy) hostnames to plain text', () => {
    expect(safeProfileWebsite('https://steewit.com/login')).toEqual({
      href: null,
      label: 'steewit.com/login',
    });
    expect(safeProfileWebsite('https://STEEMIL.com')).toEqual({
      href: null,
      label: 'STEEMIL.com',
    });
    // Subdomains of a blacklisted domain are also caught.
    expect(safeProfileWebsite('https://phish.url.rw/redirect')).toEqual({
      href: null,
      label: 'phish.url.rw/redirect',
    });
  });

  it('does not flag similar-but-legitimate hostnames', () => {
    expect(safeProfileWebsite('https://steemit.com/@alice')).toEqual({
      href: 'https://steemit.com/@alice',
      label: 'steemit.com/@alice',
    });
    expect(safeProfileWebsite('https://blog.steemit.com')).toEqual({
      href: 'https://blog.steemit.com',
      label: 'blog.steemit.com',
    });
  });

  it('degrades malformed http(s)-prefixed values to plain text', () => {
    expect(safeProfileWebsite('https://')).toEqual({
      href: null,
      label: 'https://',
    });
    expect(safeProfileWebsite('http://a b')).toEqual({
      href: null,
      label: 'http://a b',
    });
  });

  it('returns null for missing/empty values', () => {
    expect(safeProfileWebsite(undefined)).toBeNull();
    expect(safeProfileWebsite(null)).toBeNull();
    expect(safeProfileWebsite('')).toBeNull();
    expect(safeProfileWebsite('   ')).toBeNull();
  });
});
