import { beforeEach, describe, expect, it, vi } from 'vitest';

// generateMetadata fetches the on-chain profile through the server Steem
// client; mock it so the metadata assertions run against a fixed profile.
const getProfileMock = vi.fn();
vi.mock('@/lib/steem/client', () => ({
  getProfile: (...args: unknown[]) => getProfileMock(...args),
}));

import UserProfileSectionPage, {
  generateMetadata,
} from '@/app/(main)/user/[username]/[section]/page';
import UserProfileRootPage, {
  generateMetadata as generateRootMetadata,
} from '@/app/(main)/user/[username]/page';

const PROFILE_FIXTURE = {
  metadata: {
    profile: {
      name: 'Alice A.',
      about: 'Photographer',
      profile_image: 'https://example.com/avatar.png',
    },
  },
};

function sectionParams(username: string, section: string) {
  return { params: Promise.resolve({ username, section }) };
}

describe('UserProfileSectionPage generateMetadata (robots / indexability)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfileMock.mockResolvedValue(PROFILE_FIXTURE);
  });

  it.each(['settings', 'notifications'])(
    'emits robots noindex,nofollow on the private %s section',
    async (section) => {
      const meta = await generateMetadata(sectionParams('@alice', section));
      expect(meta.robots).toEqual({ index: false, follow: false });
      expect(meta.title).toBe('@alice');
    }
  );

  it.each([
    'blog',
    'posts',
    'comments',
    'replies',
    'payout',
    'feed',
    'followers',
    'followed',
    'communities',
  ])('keeps the public %s section indexable (legacy parity)', async (section) => {
    const meta = await generateMetadata(sectionParams('@alice', section));
    expect(meta.robots).toBeUndefined();
  });

  it.each(['blog', 'comments', 'settings', 'notifications'])(
    'canonical of every section points at the profile root /@alice (%s)',
    async (section) => {
      const meta = await generateMetadata(sectionParams('@alice', section));
      if (section === 'settings' || section === 'notifications') {
        // noindex pages omit canonical (noindex wins over rel=canonical).
        expect(meta.alternates).toBeUndefined();
      } else {
        expect(meta.alternates?.canonical).toBe('/@alice');
      }
    }
  );

  it('carries og:profile metadata on public sections', async () => {
    const meta = await generateMetadata(sectionParams('@alice', 'blog'));
    expect(meta.openGraph).toMatchObject({
      type: 'profile',
      title: '@alice',
    });
  });

  it('still emits noindex when the profile fetch fails', async () => {
    getProfileMock.mockRejectedValue(new Error('rpc down'));
    const meta = await generateMetadata(sectionParams('@alice', 'settings'));
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('renders the client section component (server shell)', () => {
    expect(typeof UserProfileSectionPage).toBe('function');
  });
});

describe('UserProfilePage (root) generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfileMock.mockResolvedValue(PROFILE_FIXTURE);
  });

  it('canonical points at the profile root itself', async () => {
    const meta = await generateRootMetadata({
      params: Promise.resolve({ username: '@alice' }),
    });
    expect(meta.alternates?.canonical).toBe('/@alice');
    expect(meta.robots).toBeUndefined();
    expect(typeof UserProfileRootPage).toBe('function');
  });
});
