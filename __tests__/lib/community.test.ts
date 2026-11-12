import { describe, expect, it } from 'vitest';

import { Role, ifHive, viewerRole, viewerSubscribed } from '@/lib/community';

describe('Role levels (paired port of legacy utils/Community.js)', () => {
  it('orders the ladder muted < guest < member < mod < admin < owner', () => {
    expect(Role.atLeast('owner', 'admin')).toBe(true);
    expect(Role.atLeast('admin', 'mod')).toBe(true);
    expect(Role.atLeast('mod', 'member')).toBe(true);
    expect(Role.atLeast('member', 'guest')).toBe(true);
    expect(Role.atLeast('guest', 'muted')).toBe(true);
    expect(Role.atLeast('muted', 'guest')).toBe(false);
    expect(Role.atLeast('guest', 'member')).toBe(false);
  });

  it('throws on empty or unknown roles', () => {
    expect(() => Role.level('')).toThrow();
    expect(() => Role.level('nope')).toThrow();
  });

  it('canPost allows guests on hive-1* ids and members above (journal/council quirk)', () => {
    // parseType reads name[5]: 'hive-166405'[5] === '1' → minRole 'guest'.
    expect(Role.canPost('hive-166405', 'guest')).toBe(true);
    // Any other leading digit requires 'member'.
    expect(Role.canPost('hive-234567', 'guest')).toBe(false);
    expect(Role.canPost('hive-234567', 'member')).toBe(true);
    // Muted can never post.
    expect(Role.canPost('hive-166405', 'muted')).toBe(false);
  });

  it('canComment mirrors the council-only restriction for hive-3*', () => {
    expect(Role.canComment('hive-345678', 'guest')).toBe(false);
    expect(Role.canComment('hive-345678', 'member')).toBe(true);
    expect(Role.canComment('hive-145678', 'muted')).toBe(false);
    expect(Role.canComment('hive-145678', 'guest')).toBe(true);
  });

  it('empty name disables all restrictions', () => {
    expect(Role.canPost('', 'muted')).toBe(true);
    expect(Role.canComment('', 'muted')).toBe(true);
  });
});

describe('ifHive', () => {
  it('returns the tag for hive-* and null otherwise', () => {
    expect(ifHive('hive-123')).toBe('hive-123');
    expect(ifHive('bitcoin')).toBeNull();
    expect(ifHive('')).toBeNull();
    expect(ifHive(null)).toBeNull();
  });
});

describe('viewerRole / viewerSubscribed (hivemind context: [] when anonymous)', () => {
  it('defaults to guest for an empty-array context (legacy getIn default)', () => {
    expect(viewerRole({ name: 'hive-1', title: 'T', context: [] })).toBe(
      'guest'
    );
  });

  it('reads the role/subscribed fields when present', () => {
    const community = {
      name: 'hive-1',
      title: 'T',
      context: { role: 'mod', subscribed: true },
    };
    expect(viewerRole(community)).toBe('mod');
    expect(viewerSubscribed(community)).toBe(true);
  });

  it('defaults safely for null/missing context or community', () => {
    expect(viewerRole(null)).toBe('guest');
    expect(viewerRole({ name: 'hive-1', title: 'T' })).toBe('guest');
    expect(viewerSubscribed(null)).toBe(false);
  });
});
