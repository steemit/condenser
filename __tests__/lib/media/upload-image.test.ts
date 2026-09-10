/**
 * @vitest-environment node
 * noble hashes (steem-js 1.2.x) require same-realm Uint8Array; jsdom's
 * Buffer crosses realms and fails with "expected Uint8Array".
 */
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('@/lib/crypto/key-storage', () => ({
  getCachedKey: vi.fn(),
  decryptAndRetrieveKey: vi.fn(),
}));

import { steem } from '@steemit/steem-js';
import { uploadImage } from '@/lib/media/upload-image';
import { decryptAndRetrieveKey, getCachedKey } from '@/lib/crypto/key-storage';

const getCachedKeyMock = getCachedKey as unknown as Mock;
const decryptMock = decryptAndRetrieveKey as unknown as Mock;
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const WIF = steem.auth.toWif('alice', 'password', 'posting');

function makeImageFile(name = 'pic.png', type = 'image/png'): File {
  return new File([new Uint8Array([1, 2, 3, 4])], name, { type });
}

function okResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('uploadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCachedKeyMock.mockReturnValue(WIF);
  });

  it('rejects non-image files before touching the key or network', async () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    await expect(uploadImage(file, 'alice')).rejects.toThrow(/image files/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails fast when no posting key is available', async () => {
    getCachedKeyMock.mockReturnValue(null);
    decryptMock.mockResolvedValue(null);
    await expect(uploadImage(makeImageFile(), 'alice')).rejects.toThrow(/login again/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('signs the ImageSigningChallenge and posts the file to the hoster', async () => {
    fetchMock.mockResolvedValue(okResponse({ url: 'https://steemitimages.com/abc/pic.png' }));

    const url = await uploadImage(makeImageFile(), 'alice');

    expect(url).toBe('https://steemitimages.com/abc/pic.png');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0];
    // /{username}/{signature} — signature is the hex posting-key signature.
    expect(endpoint).toMatch(/^https:\/\/steemitimages\.com\/alice\/[0-9a-f]{130}$/);
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('file')).toBeTruthy();
  });

  it('honors NEXT_PUBLIC_UPLOAD_IMAGE_URL when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_UPLOAD_IMAGE_URL', 'https://img.example.com/');
    fetchMock.mockResolvedValue(okResponse({ url: 'https://img.example.com/x.png' }));

    await uploadImage(makeImageFile(), 'alice');
    const [endpoint] = fetchMock.mock.calls[0];
    expect(endpoint).toMatch(/^https:\/\/img\.example\.com\/alice\//);
    vi.unstubAllEnvs();
  });

  it('surfaces hoster error responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ error: 'Signature is invalid' }),
    } as Response);
    await expect(uploadImage(makeImageFile(), 'alice')).rejects.toThrow('Signature is invalid');
  });
});
