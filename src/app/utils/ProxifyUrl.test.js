/*global describe, global, before:false, it*/
import assert from 'assert'
import proxifyImageUrl from './ProxifyUrl'

describe('ProxifyUrl', () => {
    before(() => {
        global.$STM_Config = {img_proxy_prefix: 'https://steemitimages.com/'};
    });
    it('naked URL', () => {
        testCase('https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png')
        testCase('https://example.com/img.png', '0x0', 'https://steemitimages.com/0x0/https://example.com/img.png')
        testCase('https://example.com/img.png', false, 'https://example.com/img.png')
    })
    it('naked steemit proxy URL', () => {
        testCase('https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', '256x512', 'https://steemitimages.com/256x512/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg')
        testCase('https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', false, 'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg')
    })
    it('proxied URL', () => {
        testCase('https://steemitimages.com/0x0/https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png')
        testCase('https://steemitimages.com/256x512/https://peopledotcom.files.wordpress.com/2017/09/grumpy-harvey-cat.jpg?w=2000', '100x200', 'https://steemitimages.com/100x200/https://peopledotcom.files.wordpress.com/2017/09/grumpy-harvey-cat.jpg?w=2000')
        testCase('https://steemitimages.com/0x0/https://example.com/img.png', false, 'https://example.com/img.png')
    })
    it('double-proxied URL', () => {
        testCase('https://steemitimages.com/0x0/https://steemitimages.com/0x0/https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png')
    })
})

const testCase = (inputUrl, outputDims, expectedUrl) => {
    const outputUrl = proxifyImageUrl(inputUrl, outputDims);
    assert.equal(outputUrl, expectedUrl, `(${inputUrl}, ${outputDims}) should return ${expectedUrl}. output was ${outputUrl}`)
}
