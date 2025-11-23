'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ProxifyUrl = require('./ProxifyUrl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global describe, global, before:false, it*/
describe('ProxifyUrl', function () {
    beforeAll(function () {
        global.$STM_Config = { img_proxy_prefix: 'https://steemitimages.com/' };
    });
    it('naked URL', function () {
        testCase('https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png');
        testCase('https://example.com/img.png', '0x0', 'https://steemitimages.com/640x0/https://example.com/img.png');
        testCase('https://example.com/img.png', true, 'https://steemitimages.com/640x0/https://example.com/img.png');
        testCase('https://example.com/img.png', false, 'https://example.com/img.png');
    });
    it('naked steemit hosted URL', function () {
        testCase('https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', '256x512', 'https://steemitimages.com/256x512/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg');
        testCase('https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', false, 'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg');
    });
    it('proxied steemit hosted URL', function () {
        testCase('https://steemitimages.com/0x0/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', '256x512', 'https://steemitimages.com/256x512/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg');
        testCase('https://steemitimages.com/256x512/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', false, 'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg');
    });
    it('proxied URL', function () {
        testCase('https://steemitimages.com/0x0/https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png');
        testCase('https://steemitimages.com/256x512/https://peopledotcom.files.wordpress.com/2017/09/grumpy-harvey-cat.jpg?w=2000', '100x200', 'https://steemitimages.com/100x200/https://peopledotcom.files.wordpress.com/2017/09/grumpy-harvey-cat.jpg?w=2000');
        testCase('https://steemitimages.com/0x0/https://example.com/img.png', false, 'https://example.com/img.png');
    });
    it('double-proxied URL', function () {
        testCase('https://steemitimages.com/0x0/https://steemitimages.com/0x0/https://example.com/img.png', '100x200', 'https://steemitimages.com/100x200/https://example.com/img.png');
        testCase('https://steemitimages.com/0x0/https://steemitimages.com/256x512/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', false, 'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg');
    });
    it('preserve dimensions - single-proxied URL', function () {
        //simple preservation
        testCase('https://steemitdevimages.com/100x200/https://example.com/img.png', true, 'https://steemitimages.com/100x200/https://example.com/img.png');
        testCase('https://steemitdevimages.com/1001x2001/https://example.com/img.png', true, 'https://steemitimages.com/1001x2001/https://example.com/img.png');
    });
    it('preserve dimensions - double-proxied URL', function () {
        //simple preservation at a 2 nesting level
        //foreign domain
        testCase('https://steemitimages.com/100x200/https://steemitimages.com/0x0/https://example.com/img.png', true, 'https://steemitimages.com/100x200/https://example.com/img.png');
        testCase('https://steemitdevimages.com/1001x2001/https://steemitimages.com/0x0/https://example.com/img.png', true, 'https://steemitimages.com/1001x2001/https://example.com/img.png');
        //steemit domain
        testCase('https://steemitdevimages.com/1001x2001/https://steemitimages.com/0x0/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', true, 'https://steemitimages.com/1001x2001/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg');
    });
    it('preserve dimensions - strip proxies & dimensions when appropriate', function () {
        //simple preservation at a 2 nesting level
        //steemit domain
        testCase('https://steemitimages.com/0x0/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', true, 'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg');
        //foreign domain
        testCase('https://steemitimages.com/0x0/https://example.com/img.png', true, 'https://steemitimages.com/640x0/https://example.com/img.png');
        //case where last is natural sizing, assumes natural sizing - straight to direct steemit file url
        testCase('https://steemitimages.com/0x0/https://steemitimages.com/100x100/https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg', true, 'https://steemitimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg');
        //case where last is natural sizing, assumes natural sizing - straight to direct steemit /0x0/ domain host url
        testCase('https://steemitimages.com/0x0/https://steemitimages.com/100x100/https://example.com/img.png', true, 'https://steemitimages.com/640x0/https://example.com/img.png');
    });
});

var testCase = function testCase(inputUrl, outputDims, expectedUrl) {
    var outputUrl = (0, _ProxifyUrl.proxifyImageUrl)(inputUrl, outputDims);
    _assert2.default.equal(outputUrl, expectedUrl, '(' + inputUrl + ', ' + outputDims + ') should return ' + expectedUrl + '. output was ' + outputUrl);
};