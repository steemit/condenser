'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _CanonicalLinker = require('./CanonicalLinker');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('makeCanonicalLink', function () {
    var post_data = {
        author: 'test',
        permlink: 'test-post',
        category: 'testing',
        link: '/testing/@test/test-post'
    };
    var test_cases = [['handles posts without app', (0, _extends3.default)({}, post_data, { json_metadata: {} }), 'https://steemit.com/testing/@test/test-post'], ['handles empty strings as app', (0, _extends3.default)({}, post_data, { json_metadata: { app: '' } }), 'https://steemit.com/testing/@test/test-post'], ["handles apps that don't exist", (0, _extends3.default)({}, post_data, { json_metadata: { app: 'fakeapp/1.2.3' } }), 'https://steemit.com/testing/@test/test-post'], ["handles app that don't exist without version", (0, _extends3.default)({}, post_data, { json_metadata: { app: 'fakeapp' } }), 'https://steemit.com/testing/@test/test-post'], ['handles apps that do exist', (0, _extends3.default)({}, post_data, { json_metadata: { app: 'steempeak/1.1.1' } }), 'https://steempeak.com/testing/@test/test-post'], ['handles posts from steemit', (0, _extends3.default)({}, post_data, { json_metadata: { app: 'steemit/0.1' } }), 'https://steemit.com/testing/@test/test-post'], ['handles badly formatted app strings', (0, _extends3.default)({}, post_data, { json_metadata: { app: 'fakeapp/0.0.1/a////' } }), 'https://steemit.com/testing/@test/test-post'], ['handles objects as apps', (0, _extends3.default)({}, post_data, { json_metadata: { app: { this_is: 'an objct' } } }), 'https://steemit.com/testing/@test/test-post']];
    test_cases.forEach(function (v) {
        it(v[0], function () {
            expect((0, _CanonicalLinker.makeCanonicalLink)(v[1], v[1].json_metadata)).toBe(v[2]);
        });
    });
});