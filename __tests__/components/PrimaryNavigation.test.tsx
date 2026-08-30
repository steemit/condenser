import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import userReducer, { setUser } from '@/store/slices/userSlice';
import { PrimaryNavigation } from '@/components/layout/PrimaryNavigation';

afterEach(cleanup);

function makeStore(loggedIn = true) {
  const store = configureStore({ reducer: { user: userReducer } });
  if (loggedIn) {
    store.dispatch(setUser({ username: 'alice', posting_authority: true }));
  }
  return store;
}

function renderNav(pathname: string, loggedIn = true) {
  return render(
    <Provider store={makeStore(loggedIn)}>
      <PrimaryNavigation pathname={pathname} />
    </Provider>
  );
}

function itemByLabel(label: string): HTMLElement {
  const el = screen.getByText(label).closest('a,button');
  if (!el) throw new Error(`no link/button for ${label}`);
  return el as HTMLElement;
}

const isActive = (el: HTMLElement) => el.className.includes('font-semibold');

describe('PrimaryNavigation post-page context (legacy previousUrl)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('highlights My Profile > Posts when arriving at a post from the own profile', () => {
    window.localStorage.setItem('previousUrl', '/@alice/posts');
    renderNav('/category/@alice/some-post');
    expect(isActive(itemByLabel('Posts'))).toBe(true);
    // Explore collapsed: its children are not rendered at all.
    expect(screen.queryByText('All Posts')).toBeNull();
    expect(screen.queryByText('Communities')).toBeNull();
  });

  it('falls back to Explore > All Posts on a direct post visit', () => {
    renderNav('/category/@bob/some-post');
    expect(isActive(itemByLabel('All Posts'))).toBe(true);
    // Explore expanded.
    expect(screen.getByText('Communities')).toBeTruthy();
  });

  it('resolves permlink-style post urls (/@user/permlink) as post routes', () => {
    window.localStorage.setItem('previousUrl', '/trending');
    renderNav('/@bob/some-post');
    expect(isActive(itemByLabel('All Posts'))).toBe(true);
  });

  it('records non-post navigations as previousUrl', () => {
    renderNav('/@alice/posts');
    expect(window.localStorage.getItem('previousUrl')).toBe('/@alice/posts');
  });

  it('keeps route-driven state on non-post pages regardless of previousUrl', () => {
    window.localStorage.setItem('previousUrl', '/@alice/posts');
    renderNav('/trending');
    expect(isActive(itemByLabel('All Posts'))).toBe(true);
    expect(window.localStorage.getItem('previousUrl')).toBe('/trending');
  });
});

describe('PrimaryNavigation profile group identity', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('labels the group "My Profile" on the own profile page', () => {
    renderNav('/@alice/posts');
    expect(screen.getByText('My Profile')).toBeTruthy();
    expect(isActive(itemByLabel('Posts'))).toBe(true);
    // Own group has no Friends Feed entry (it lives under Explore).
    expect(screen.queryByText('Friends Feed')).toBeNull();
  });

  it('labels the group with the viewed username on other profiles (logged in)', () => {
    renderNav('/@bob/comments');
    expect(screen.getByText('@bob')).toBeTruthy();
    expect(screen.queryByText('My Profile')).toBeNull();
    expect(isActive(itemByLabel('Comments'))).toBe(true);
    // Other users' groups expose Friends Feed (legacy "More" menu).
    expect(screen.getByText('Friends Feed')).toBeTruthy();
  });

  it('shows the viewed profile group when logged out', () => {
    renderNav('/@bob/posts', false);
    expect(screen.getByText('@bob')).toBeTruthy();
    expect(isActive(itemByLabel('Posts'))).toBe(true);
  });

  it('expands the viewed profile group on their feed page', () => {
    renderNav('/@bob/feed', false);
    expect(isActive(itemByLabel('Friends Feed'))).toBe(true);
  });

  it('keeps My Friends under Explore on the own feed page', () => {
    renderNav('/@alice/feed');
    expect(isActive(itemByLabel('My Friends'))).toBe(true);
    expect(screen.getByText('My Profile')).toBeTruthy();
  });
});
