'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.searchWatches = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

exports.search = search;
exports.searchReset = searchReset;
exports.searchUser = searchUser;

var _effects = require('redux-saga/effects');

var _SearchReducer = require('app/redux/SearchReducer');

var reducer = _interopRequireWildcard(_SearchReducer);

var _ServerApiClient = require('app/utils/ServerApiClient');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(search),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(searchReset),
    _marked3 = /*#__PURE__*/_regenerator2.default.mark(searchUser);

var searchWatches = exports.searchWatches = [(0, _effects.takeEvery)('search/SEARCH_DISPATCH', search)];

function search(action) {
    var _action$payload, q, s, scroll_id, depth, sort, append, luceneQuery, userQuery, requestParams, searchResponse, searchJSON;

    return _regenerator2.default.wrap(function search$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _action$payload = action.payload, q = _action$payload.q, s = _action$payload.s, scroll_id = _action$payload.scroll_id, depth = _action$payload.depth, sort = _action$payload.sort;
                    append = action.payload.scroll_id ? true : false;
                    _context.next = 4;
                    return (0, _effects.put)(reducer.searchPending({ pending: true }));

                case 4:
                    // const luceneQuery = {
                    //     term: {
                    //         searchable: {
                    //             value: q,
                    //             boost: 1.0,
                    //         },
                    //     },
                    // };
                    luceneQuery = {
                        match_phrase: {
                            searchable: {
                                query: q,
                                slop: 3
                            }
                        }
                    };
                    userQuery = {
                        wildcard: {
                            name: {
                                value: q + '*'
                            }
                        }
                    };
                    _context.prev = 6;
                    requestParams = {
                        body: {
                            searchQuery: {
                                size: 30
                            },
                            depth: depth
                        }
                    };

                    if (depth < 2) {
                        requestParams.body.searchQuery.query = luceneQuery;
                        requestParams.body.searchQuery.sort = (0, _defineProperty3.default)({}, sort, {
                            order: 'desc'
                        });
                    } else {
                        requestParams.body.searchQuery.query = userQuery;
                    }
                    if (scroll_id) {
                        requestParams.body.scrollQuery = {
                            scroll: '1m',
                            scroll_id: scroll_id
                        };
                    }
                    _context.next = 12;
                    return (0, _effects.call)(_ServerApiClient.conductSearch, requestParams);

                case 12:
                    searchResponse = _context.sent;
                    _context.next = 15;
                    return (0, _effects.call)([searchResponse, searchResponse.json]);

                case 15:
                    searchJSON = _context.sent;
                    _context.next = 18;
                    return (0, _effects.put)(reducer.searchResult((0, _extends3.default)({}, searchJSON, { append: append })));

                case 18:
                    _context.next = 25;
                    break;

                case 20:
                    _context.prev = 20;
                    _context.t0 = _context['catch'](6);

                    console.log('Search error', _context.t0);
                    _context.next = 25;
                    return (0, _effects.put)(reducer.searchError({ error: _context.t0 }));

                case 25:
                    _context.next = 27;
                    return (0, _effects.put)(reducer.searchPending({ pending: false }));

                case 27:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this, [[6, 20]]);
}

function searchReset(action) {
    return _regenerator2.default.wrap(function searchReset$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return (0, _effects.put)(reducer.searchReset());

                case 2:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked2, this);
}

function searchUser(action) {
    var searchUserResponse;
    return _regenerator2.default.wrap(function searchUser$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return (0, _effects.call)(_ServerApiClient.userSearch, {});

                case 2:
                    searchUserResponse = _context3.sent;

                case 3:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked3, this);
}