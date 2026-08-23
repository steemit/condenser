import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges plain class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('drops falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar');
  });

  it('resolves conflicting tailwind classes via tailwind-merge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm text-red-500', 'text-blue-500')).toBe(
      'text-sm text-blue-500'
    );
  });

  it('supports conditional object syntax', () => {
    expect(cn({ hidden: true, block: false }, 'mt-2')).toBe('hidden mt-2');
  });
});
