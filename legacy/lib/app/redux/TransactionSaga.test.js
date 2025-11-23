'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _effects = require('redux-saga/effects');

var _steemJs = require('@steemit/steem-js');

var _steemJs2 = _interopRequireDefault(_steemJs);

var _steemApi = require('app/utils/steemApi');

var _utils = require('redux-saga/utils');

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _TransactionSaga = require('./TransactionSaga');

var _client_config = require('app/client_config');

var _enzyme = require('enzyme');

var _enzymeAdapterReact = require('enzyme-adapter-react-15');

var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _enzyme.configure)({ adapter: new _enzymeAdapterReact2.default() }); /* global describe, it, before, beforeEach, after, afterEach */

var operation = {
    type: 'comment',
    author: 'Alice',
    body: "The Body is a pretty long chunck of text that represents the user's voice, it seems they have much to say, and this is one place where they can do that.",
    category: 'hi',
    json_metadata: (0, _stringify2.default)({
        tags: ['hi'],
        app: 'steemit/0.1',
        format: 'markdown'
    }),
    parent_author: 'candide',
    parent_permlink: 'cool',
    title: 'test',
    __config: {},
    errorCallback: function errorCallback() {
        return '';
    },
    successCallback: function successCallback() {
        return '';
    },
    memo: '#testing'
};

var username = 'Beatrice';

describe('TransactionSaga', function () {
    describe('watch user actions and trigger appropriate saga', function () {
        var gen = _TransactionSaga.transactionWatches;
        it('should call the broadcastOperation saga with every transactionActions.BROADCAST_OPERATION action', function () {
            expect(gen).toEqual([(0, _effects.takeEvery)(transactionActions.BROADCAST_OPERATION, _TransactionSaga.broadcastOperation)]);
        });
    });

    describe('createPatch', function () {
        it('should return undefined if empty arguments are passed', function () {
            var actual = (0, _TransactionSaga.createPatch)('', '');
            expect(actual).toEqual(undefined);
        });
        it('should return the patch that reconciles two different strings', function () {
            var testString = 'there is something interesting going on here that I do not fully understand it is seemingly complex but it is actually quite simple';
            var actual = (0, _TransactionSaga.createPatch)(testString, testString + 'ILU');
            expect(actual).toEqual('@@ -120,12 +120,15 @@\n quite simple\n+ILU\n');
        });
    });

    describe('createPermlink', function () {
        var gen = (0, _TransactionSaga.createPermlink)(operation.title, operation.author);
        it('should call the api to get a permlink if the title is valid', function () {
            var actual = gen.next().value;
            var mockCall = (0, _effects.call)(_steemApi.callBridge, 'get_post_header', {
                author: operation.author,
                permlink: operation.title
            });
            expect(actual).toEqual(mockCall);
        });
        it('should return a string containing the transformed data from the api', function () {
            var permlink = gen.next({ body: 'test' }).value;
            expect(permlink.indexOf('test') > -1).toEqual(true); // TODO: cannot deep equal due to date stamp at runtime.
        });
        it('should generate own permlink, independent of api if title is empty', function () {
            var gen2 = (0, _TransactionSaga.createPermlink)('', operation.author);
            var actual = gen2.next().value;
            expect(actual.match(/^[a-z0-9]{6}$/) !== null).toEqual(true);
        });
    });

    describe('preBroadcast_comment', function () {
        var gen = (0, _TransactionSaga.preBroadcast_comment)({ operation: operation, username: username });

        it('should call createPermlink', function () {
            var permlink = gen.next(operation.title, operation.author).value;
            var actual = permlink.next().value;
            var expected = (0, _effects.call)(_steemApi.callBridge, 'get_post_header', {
                author: operation.author,
                permlink: operation.title
            });
            expect(expected).toEqual(actual);
        });
        it('should return the comment options array.', function () {
            var actual = gen.next('mock-permlink-123').value;
            var expected = [['comment', {
                author: operation.author,
                category: operation.category,
                errorCallback: operation.errorCallback,
                successCallback: operation.successCallback,
                parent_author: operation.parent_author,
                parent_permlink: operation.parent_permlink,
                type: operation.type,
                __config: operation.__config,
                memo: operation.memo,
                permlink: 'mock-permlink-123',
                json_metadata: operation.json_metadata,
                title: (operation.title || '').trim(),
                body: operation.body
            }]];
            expect(actual).toEqual(expected);
        });
        it('should return a patch as body value if patch is smaller than body.', function () {
            var originalBod = operation.body + 'minor difference';
            operation.__config.originalBody = originalBod;
            gen = (0, _TransactionSaga.preBroadcast_comment)({ operation: operation, username: username });
            gen.next(operation.title, operation.author, operation.parent_author, operation.parent_permlink);
            var actual = gen.next('mock-permlink-123').value;
            var expected = (0, _TransactionSaga.createPatch)(originalBod, operation.body);
            expect(actual[0][1].body).toEqual(expected);
        });
        it('should return body as body value if patch is larger than body.', function () {
            var originalBod = 'major difference';
            operation.__config.originalBody = originalBod;
            gen = (0, _TransactionSaga.preBroadcast_comment)({ operation: operation, username: username });
            gen.next(operation.title, operation.author, operation.parent_author, operation.parent_permlink);
            var actual = gen.next('mock-permlink-123').value;
            var expected = operation.body;
            expect(actual[0][1].body).toEqual(expected, 'utf-8');
        });
    });
});