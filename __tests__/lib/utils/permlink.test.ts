import { describe, expect, it } from 'vitest';

import {
  generateCommentPermlink,
  generateStoryPermlink,
  slugifyTitle,
} from '@/lib/utils/permlink';

describe('slugifyTitle', () => {
  it('slugifies a plain title like legacy (lowercase, dashes)', () => {
    expect(slugifyTitle('Hello World!')).toBe('hello-world');
  });

  it('strips angle brackets before slugifying (legacy slug())', () => {
    expect(slugifyTitle('<b>Bold</b> Title')).toBe('bbold-b-title');
  });

  it('drops everything except [a-z0-9-]', () => {
    expect(slugifyTitle('Café & Restaurant — 50% off!!')).toBe(
      'caf-restaurant-50-off'
    );
  });

  it('truncates the slug to 128 characters', () => {
    const long = 'word '.repeat(100);
    expect(slugifyTitle(long).length).toBeLessThanOrEqual(128);
  });

  it('falls back to random base58 when nothing slug-safe survives', () => {
    const slug = slugifyTitle('日本語のタイトル');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThan(0);
  });
});

describe('generateStoryPermlink', () => {
  it('returns the slug when no uniqueness check is provided', async () => {
    await expect(generateStoryPermlink('My Test Post')).resolves.toBe(
      'my-test-post'
    );
  });

  it('returns the slug when the chain check says it is free', async () => {
    await expect(
      generateStoryPermlink('My Test Post', async () => false)
    ).resolves.toBe('my-test-post');
  });

  it('prefixes random noise when the slug is already taken', async () => {
    const permlink = await generateStoryPermlink('My Test Post', async () => true);
    expect(permlink).toMatch(/^[a-z0-9]+-my-test-post$/);
    expect(permlink).not.toBe('my-test-post');
  });

  it('caps the final permlink at 255 characters', async () => {
    const long = 'word '.repeat(100);
    const permlink = await generateStoryPermlink(long, async () => true);
    expect(permlink.length).toBeLessThanOrEqual(255);
  });
});

describe('generateCommentPermlink', () => {
  it('is base36 unix seconds (legacy empty-title branch)', () => {
    const now = 1700000000123;
    const permlink = generateCommentPermlink(now);
    expect(permlink).toBe(Math.floor(now / 1000).toString(36));
    expect(permlink).toMatch(/^[a-z0-9]+$/);
  });

  it('defaults to the current time', () => {
    const before = Math.floor(Date.now() / 1000);
    const permlink = generateCommentPermlink();
    const value = parseInt(permlink, 36);
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(before + 5);
  });
});
