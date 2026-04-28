/*global describe, global, before:false, it*/
import assert from 'assert';
import base58 from 'bs58';
import { proxifyImageUrl } from './ProxifyUrl';

describe('ProxifyUrl', () => {
    beforeAll(() => {
        global.$STM_Config = { img_proxy_prefix: 'https://steemitimages.com/' };
    });
    it('naked URL (non-cdn.steemitimages.com: no prefix)', () => {
        testCase(
            'https://example.com/img.png',
            '100x200',
            'https://example.com/img.png'
        );
        testCase(
            'https://example.com/img.png',
            '0x0',
            'https://example.com/img.png'
        );
        testCase(
            'https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
        testCase(
            'https://example.com/img.png',
            false,
            'https://example.com/img.png'
        );
    });
    it('naked steemit hosted URL (first-party domain: use /p/)', () => {
        const url =
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg';
        const canonical =
            'https://cdn.steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg';
        testCase(
            url,
            '256x512',
            expectedP(canonical, { width: 256, height: 512 })
        );
        testCase(url, false, url);
    });
    it('proxied steemit hosted URL (strip proxy, then /p/ for first-party)', () => {
        const stripped =
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg';
        const strippedCanonical =
            'https://cdn.steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg';
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            '256x512',
            expectedP(strippedCanonical, { width: 256, height: 512 })
        );
        testCase(
            'https://steemitimages.com/256x512/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            false,
            stripped
        );
    });
    it('proxied URL (strip proxy, no prefix for non-cdn)', () => {
        testCase(
            'https://steemitimages.com/0x0/https://example.com/img.png',
            '100x200',
            'https://example.com/img.png'
        );
        testCase(
            'https://steemitimages.com/256x512/https://peopledotcom.files.wordpress.com/2017/09/grumpy-harvey-cat.jpg?w=2000',
            '100x200',
            'https://peopledotcom.files.wordpress.com/2017/09/grumpy-harvey-cat.jpg?w=2000'
        );
        testCase(
            'https://steemitimages.com/0x0/https://example.com/img.png',
            false,
            'https://example.com/img.png'
        );
    });
    it('double-proxied URL (strip to final url, no prefix for non-cdn)', () => {
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/0x0/https://example.com/img.png',
            '100x200',
            'https://example.com/img.png'
        );
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/256x512/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            false,
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
    });
    it('preserve dimensions - single-proxied URL (no prefix for non-cdn)', () => {
        testCase(
            'https://steemitdevimages.com/100x200/https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
        testCase(
            'https://steemitdevimages.com/1001x2001/https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
    });
    it('preserve dimensions - double-proxied URL (no prefix for non-cdn)', () => {
        testCase(
            'https://steemitimages.com/100x200/https://steemitimages.com/0x0/https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
        testCase(
            'https://steemitdevimages.com/1001x2001/https://steemitimages.com/0x0/https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
        testCase(
            'https://steemitdevimages.com/1001x2001/https://steemitimages.com/0x0/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            true,
            expectedP(
                'https://cdn.steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
                { width: 1001, height: 2001 }
            )
        );
    });
    it('preserve dimensions - strip proxies when appropriate (no prefix for non-cdn)', () => {
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            true,
            expectedP(
                'https://cdn.steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
                { width: 640 }
            )
        );
        testCase(
            'https://steemitimages.com/0x0/https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/100x100/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            true,
            expectedP(
                'https://cdn.steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
                { width: 640 }
            )
        );
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/100x100/https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
    });
    it('dimensions with trailing slash (third-party: no /p/)', () => {
        // Third-party URLs: no /p/
        testCase(
            'https://example.com/img.png',
            '0x0/',
            'https://example.com/img.png'
        );
        testCase(
            'https://example.com/img.gif',
            '0x0/',
            'https://example.com/img.gif'
        );
        // First-party (subdomain): use /p/ and omit height when 0 (0x0 => 640x0 cap)
        testCase(
            'https://cdn.steemitimages.com/DQmNRRrBzgpYrFfwD8wWbyPqe5MScZx59gu4sZwkfkw44qu/20220219_125403.jpg',
            '0x0/',
            expectedP(
                'https://cdn.steemitimages.com/DQmNRRrBzgpYrFfwD8wWbyPqe5MScZx59gu4sZwkfkw44qu/20220219_125403.jpg',
                { width: 640 }
            )
        );
    });

    it('already /p/ URL is idempotent and params are forced to match policy', () => {
        const orig =
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg';
        const canonical =
            'https://cdn.steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg';
        const b58 = base58.encode(Buffer.from(canonical, 'utf8'));

        testCase(
            `https://steemitimages.com/p/${
                b58
            }?width=123&height=456&mode=cover&format=png`,
            true,
            // dimensions=true -> NATURAL_SIZE -> CAPPED_SIZE -> width=640 only, and mode/format forced
            `https://steemitimages.com/p/${b58}?mode=fit&format=match&width=640`
        );

        testCase(
            `https://steemitimages.com/p/${
                b58
            }?width=123&height=456&mode=cover&format=png`,
            '256x512',
            `https://steemitimages.com/p/${
                b58
            }?mode=fit&format=match&width=256&height=512`
        );

        // height=0 must not be present after normalization
        testCase(
            `https://steemitimages.com/p/${b58}?height=0&mode=cover&format=png`,
            true,
            `https://steemitimages.com/p/${b58}?mode=fit&format=match&width=640`
        );
    });
});

const testCase = (inputUrl, outputDims, expectedUrl) => {
    const outputUrl = proxifyImageUrl(inputUrl, outputDims);
    assertUrlEqual(
        outputUrl,
        expectedUrl,
        `(${inputUrl}, ${outputDims}) should return ${
            expectedUrl
        }. output was ${outputUrl}`
    );
};

function assertUrlEqual(actual, expected, message) {
    try {
        const a = new URL(actual);
        const e = new URL(expected);

        assert.equal(a.origin, e.origin, message);
        assert.equal(a.pathname, e.pathname, message);

        const aParams = [...a.searchParams.entries()].sort();
        const eParams = [...e.searchParams.entries()].sort();
        assert.deepEqual(aParams, eParams, message);
        return;
    } catch (err) {
        // Fall back to string comparison when URL parsing is not applicable.
    }
    assert.equal(actual, expected, message);
}

const expectedP = (url, { width, height } = {}) => {
    const b58 = base58.encode(Buffer.from(url, 'utf8'));
    const base = `https://steemitimages.com/p/${b58}`;
    const params = [];
    params.push('mode=fit');
    params.push('format=match');
    if (width) params.push(`width=${width}`);
    if (height) params.push(`height=${height}`);
    return params.length ? `${base}?${params.join('&')}` : base;
};
