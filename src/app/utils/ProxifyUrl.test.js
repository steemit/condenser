/*global describe, global, before:false, it*/
import assert from 'assert';
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
    it('naked steemit hosted URL (steemitimages.com not cdn: no prefix)', () => {
        const url =
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg';
        testCase(url, '256x512', url);
        testCase(url, false, url);
    });
    it('proxied steemit hosted URL (strip proxy, no prefix for non-cdn)', () => {
        const stripped =
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg';
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            '256x512',
            stripped
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
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
    });
    it('preserve dimensions - strip proxies when appropriate (no prefix for non-cdn)', () => {
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            true,
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
        testCase(
            'https://steemitimages.com/0x0/https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/100x100/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            true,
            'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
        testCase(
            'https://steemitimages.com/0x0/https://steemitimages.com/100x100/https://example.com/img.png',
            true,
            'https://example.com/img.png'
        );
    });
    it('dimensions with trailing slash (only cdn.steemitimages.com gets prefix)', () => {
        // Non-cdn URLs: no prefix
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
        // cdn.steemitimages.com: add prefix
        testCase(
            'https://cdn.steemitimages.com/DQmNRRrBzgpYrFfwD8wWbyPqe5MScZx59gu4sZwkfkw44qu/20220219_125403.jpg',
            '0x0/',
            'https://steemitimages.com/640x0/https://cdn.steemitimages.com/DQmNRRrBzgpYrFfwD8wWbyPqe5MScZx59gu4sZwkfkw44qu/20220219_125403.jpg'
        );
    });
});

const testCase = (inputUrl, outputDims, expectedUrl) => {
    const outputUrl = proxifyImageUrl(inputUrl, outputDims);
    assert.equal(
        outputUrl,
        expectedUrl,
        `(${inputUrl}, ${outputDims}) should return ${
            expectedUrl
        }. output was ${outputUrl}`
    );
};
