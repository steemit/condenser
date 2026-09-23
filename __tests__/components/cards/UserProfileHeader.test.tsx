import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IntlWrapper } from '@/__tests__/helpers/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/@alice',
}));

// Follow requires a Redux store; it is irrelevant to what we assert here.
vi.mock('@/components/elements/Follow', () => ({
  default: () => <div data-testid="follow" />,
}));

import UserProfileHeader from '@/components/cards/UserProfileHeader';

/** The full-bleed banner div that carries the cover background style. */
function bannerDiv(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('div.bg-cover');
  expect(el).toBeTruthy();
  return el as HTMLElement;
}

const PROPS = {
  accountname: 'alice',
  reputation: '60',
  postCount: 10,
  created: '2016-03-24T00:00:00Z',
  stats: { rank: 1, following: 2, followers: 3 },
};

describe('UserProfileHeader cover_image hardening (audit N-06)', () => {
  it('does not emit a background-image for the audit CSS-injection payload', () => {
    const { container } = render(
      <IntlWrapper>
        <UserProfileHeader
          {...PROPS}
          profile={{
            cover_image:
              'https://evil.com/a.jpg);position:fixed;top:0;left:0;width:100%;height:100%;background:red;z-index:9999',
          }}
        />
      </IntlWrapper>
    );

    const banner = bannerDiv(container);
    expect(banner.style.backgroundImage).toBe('');
    expect(banner.getAttribute('style')).not.toContain('position:fixed');
    expect(banner.getAttribute('style')).not.toContain('evil.com');
  });

  it('does not emit a background-image for non-http(s) cover values', () => {
    for (const cover of [
      'javascript:alert(1)',
      'data:image/svg+xml,<svg onload=alert(1)>',
      '/local/path.jpg',
    ]) {
      const { container } = render(
        <IntlWrapper>
          <UserProfileHeader {...PROPS} profile={{ cover_image: cover }} />
        </IntlWrapper>
      );
      expect(bannerDiv(container).style.backgroundImage).toBe('');
    }
  });

  it('renders a valid third-party cover URL as the background image (passthrough)', () => {
    const { container } = render(
      <IntlWrapper>
        <UserProfileHeader
          {...PROPS}
          profile={{ cover_image: 'https://example.com/cover.jpg' }}
        />
      </IntlWrapper>
    );

    // Third-party images are proxied verbatim (#3976): URL must appear intact
    // and without any injected declarations around it.
    const bg = bannerDiv(container).style.backgroundImage;
    expect(bg).toContain('https://example.com/cover.jpg');
    expect(bg).not.toContain(';');
  });

  it('renders a first-party cover URL via the /p/ proxy (base58-encoded)', () => {
    const { container } = render(
      <IntlWrapper>
        <UserProfileHeader
          {...PROPS}
          profile={{ cover_image: 'https://steemitimages.com/DQmXabc/c.png' }}
        />
      </IntlWrapper>
    );

    const bg = bannerDiv(container).style.backgroundImage;
    expect(bg).toContain('url("https://steemitimages.com/p/');
    // The (metachar-free) raw URL must not be spliced in directly.
    expect(bg).not.toContain('DQmXabc');
  });

  it('renders no background style when cover_image is missing', () => {
    const { container } = render(
      <IntlWrapper>
        <UserProfileHeader {...PROPS} profile={null} />
      </IntlWrapper>
    );

    expect(bannerDiv(container).style.backgroundImage).toBe('');
  });
});

describe('UserProfileHeader website hardening (audit N-16)', () => {
  function renderWithWebsite(website: string) {
    return render(
      <IntlWrapper>
        <UserProfileHeader {...PROPS} profile={{ website }} />
      </IntlWrapper>
    );
  }

  it('does not render a link for javascript: / data: / scheme-relative values', () => {
    for (const website of [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      '//example.com',
      'not a url',
    ]) {
      const { container, unmount } = renderWithWebsite(website);
      expect(container.querySelector('a.underline')).toBeNull();
      expect(screen.getByText(website)).toBeTruthy();
      unmount();
    }
  });

  it('does not render a link for blacklisted (phishy) hostnames', () => {
    const { container } = renderWithWebsite('https://steewit.com/login');
    expect(container.querySelector('a.underline')).toBeNull();
    // Degraded to plain text with the same stripped label.
    expect(screen.getByText('steewit.com/login')).toBeTruthy();
  });

  it('renders a normal website as an external link with a stripped label', () => {
    const { container } = renderWithWebsite('https://www.example.com/blog/');
    const anchor = container.querySelector<HTMLAnchorElement>('a.underline');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('href')).toBe('https://www.example.com/blog/');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.getByText('example.com/blog')).toBeTruthy();
  });

  it('renders nothing for an empty website value', () => {
    const { container } = renderWithWebsite('');
    expect(container.querySelector('a.underline')).toBeNull();
  });
});
