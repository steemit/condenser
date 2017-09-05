import assert from 'assert'
import SanitizeUrl from 'app/utils/SanitizeUrl'

describe('SanitizeUrl', () => {
    before(function (){
        global.$STM_Config = {img_proxy_prefix: 'https://steemitimages.com/'};
    });

    it('naked URL', () => {
        testCase('https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png')
        testCase('https://example.com/img.png', '0x0', 'https://steemitimages.com/0x0/https://example.com/img.png')
        testCase('https://example.com/img.png', false, 'https://example.com/img.png')
    })
    it('proxied URL', () => {
        testCase('https://steemitimages.com/0x0/https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png')
        testCase('https://steemitimages.com/0x0/https://example.com/img.png', false, 'https://example.com/img.png')
    })
    it('double-proxied URL', () => {
        testCase('https://steemitimages.com/0x0/https://steemitimages.com/0x0/https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png')
    })
})

const testCase = (inputUrl, outputDims, expectedUrl) => {
    const outputUrl = SanitizeUrl(inputUrl, outputDims);
    assert.equal(outputUrl, expectedUrl, `(${inputUrl}, ${outputDims}) should return ${expectedUrl}. output was ${outputUrl}`)
}
