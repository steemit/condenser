'use strict';

var _effects = require('redux-saga/effects');

var _steemJs = require('@steemit/steem-js');

var _steemApi = require('app/utils/steemApi');

var _AppReducer = require('./AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _GlobalReducer = require('./GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _FetchDataSaga = require('./FetchDataSaga');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('FetchDataSaga', function () {
    describe('should fetch multiple and filter', function () {
        var payload = {
            order: 'blog',
            category: '@bob',
            author: 'alice',
            permlink: 'hair',
            postFilter: function postFilter(value) {
                return value.author === 'bob';
            }
        };
        var action = {
            category: '',
            payload: payload
        };
        _constants2.default.FETCH_DATA_BATCH_SIZE = 2;
        var gen = (0, _FetchDataSaga.fetchData)(action);
        it('should signal data fetch', function () {
            var actual = gen.next().value;
            expect(actual).toEqual((0, _effects.put)(globalActions.fetchingData({
                order: 'blog',
                category: '@bob'
            })));
        });
        it('should call discussions by blog', function () {
            var actual = gen.next().value;
            expect(actual).toEqual((0, _effects.put)(appActions.fetchDataBegin()));

            actual = gen.next().value;
            expect(actual).toEqual((0, _effects.call)(_steemApi.callBridge, 'get_account_posts', {
                sort: 'blog',
                account: payload.category.slice(1),
                limit: _constants2.default.FETCH_DATA_BATCH_SIZE,
                start_author: payload.author,
                start_permlink: payload.permlink
            }));
        });
        it('should continue fetching data filtering 1 out', function () {
            var actual = gen.next([{
                author: 'alice'
            }, {
                author: 'bob',
                permlink: 'post1'
            }]).value;
            expect(actual).toEqual((0, _effects.put)(globalActions.receiveData({
                data: [{ author: 'alice' }, { author: 'bob', permlink: 'post1' }],
                order: 'blog',
                category: '@bob',
                author: 'alice',
                fetching: true,
                endOfData: false
            })));
        });
        it('should finish fetching data filtering 1 out', function () {
            var actual = gen.next().value;
            expect(actual).toEqual((0, _effects.call)(_steemApi.callBridge, 'get_account_posts', {
                sort: 'blog',
                account: payload.category.slice(1),
                limit: _constants2.default.FETCH_DATA_BATCH_SIZE,
                start_author: 'bob',
                start_permlink: 'post1'
            }));

            actual = gen.next([{
                author: 'bob',
                permlink: 'post2'
            }]).value;
            expect(actual).toEqual((0, _effects.put)(globalActions.receiveData({
                data: [{ author: 'bob', permlink: 'post2' }],
                order: 'blog',
                category: '@bob',
                author: 'alice',
                fetching: false,
                endOfData: true
            })));

            actual = gen.next().value;
            expect(actual).toEqual((0, _effects.put)(appActions.fetchDataEnd()));
        });
    });
    describe('should not fetch more batches than max batch size', function () {
        var payload = {
            order: 'blog',
            author: 'alice',
            permlink: 'hair',
            category: '@bob',
            postFilter: function postFilter(value) {
                return value.author === 'bob';
            }
        };
        var action = {
            category: '',
            payload: payload
        };
        _constants2.default.FETCH_DATA_BATCH_SIZE = 2;
        _constants2.default.MAX_BATCHES = 2;
        var gen = (0, _FetchDataSaga.fetchData)(action);

        var actual = gen.next().value;
        expect(actual).toEqual((0, _effects.put)(globalActions.fetchingData({
            order: 'blog',
            category: '@bob'
        })));

        actual = gen.next().value;
        expect(actual).toEqual((0, _effects.put)(appActions.fetchDataBegin()));

        actual = gen.next().value;
        expect(actual).toEqual((0, _effects.call)(_steemApi.callBridge, 'get_account_posts', {
            sort: 'blog',
            account: payload.category.slice(1),
            limit: _constants2.default.FETCH_DATA_BATCH_SIZE,
            start_author: payload.author,
            start_permlink: payload.permlink
        }));

        // these all will not satisfy the filter
        actual = gen.next([{
            author: 'alice'
        }, {
            author: 'alice'
        }]).value;
        expect(actual).toEqual((0, _effects.put)(globalActions.receiveData({
            data: [{ author: 'alice' }, { author: 'alice' }],
            order: 'blog',
            category: '@bob',
            author: 'alice',
            fetching: true,
            endOfData: false
        })));

        actual = gen.next().value;
        expect(actual).toEqual((0, _effects.call)(_steemApi.callBridge, 'get_account_posts', {
            sort: 'blog',
            account: payload.category.slice(1),
            limit: _constants2.default.FETCH_DATA_BATCH_SIZE,
            start_author: 'alice'
        }));

        actual = gen.next([{
            author: 'alice'
        }, {
            author: 'alice'
        }]).value;
        expect(actual).toEqual((0, _effects.put)(globalActions.receiveData({
            data: [{ author: 'alice' }, { author: 'alice' }],
            order: 'blog',
            category: '@bob',
            author: 'alice',
            fetching: false,
            endOfData: false
        })));

        actual = gen.next().value;
        expect(actual).toEqual((0, _effects.put)(appActions.fetchDataEnd()));
    });
});