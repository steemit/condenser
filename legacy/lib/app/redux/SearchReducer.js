'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.searchTotal = exports.searchSort = exports.searchDepth = exports.searchReset = exports.searchResult = exports.searchError = exports.searchPending = exports.search = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = reducer;

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SEARCH_DISPATCH = 'search/SEARCH_DISPATCH';
var SEARCH_PENDING = 'search/SEARCH_PENDING';
var SEARCH_ERROR = 'search/SEARCH_ERROR';
var SEARCH_RESULT = 'search/SEARCH_RESULT';
var SEARCH_RESET = 'search/SEARCH_RESET';
var SEARCH_DEPTH = 'search/SEARCH_DEPTH';
var SEARCH_SORT = 'search/SEARCH_SORT';
var SEARCH_TOTAL = 'search/SEARCH_TOTAL';
var searchTypes = ['hive_posts', 'hive_replies', 'hive_accounts'];

var defaultSearchState = (0, _immutable.Map)({
    pending: false,
    error: false,
    scrollId: false,
    result: (0, _immutable.List)([]),
    depth: 0,
    total_result: 0,
    sort: 'created_at'
});

function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultSearchState;
    var action = arguments[1];

    var payload = action.payload;

    switch (action.type) {
        // Has a saga watcher.
        case SEARCH_DISPATCH:
            {
                return state;
            }
        case SEARCH_PENDING:
            {
                var pending = payload.pending;

                return state.setIn(['pending'], pending);
            }
        case SEARCH_ERROR:
            {
                var error = payload.error;

                return state.setIn(['error'], error);
            }
        case SEARCH_RESET:
            {
                return state.setIn(['result'], (0, _immutable.List)([]));
            }
        case SEARCH_DEPTH:
            {
                return state.setIn(['depth'], payload);
            }
        case SEARCH_SORT:
            {
                return state.setIn(['sort'], payload);
            }
        case SEARCH_TOTAL:
            {
                return state.setIn(['total_result'], payload);
            }
        case SEARCH_RESULT:
            {
                var hits = payload.hits,
                    _scroll_id = payload._scroll_id,
                    append = payload.append;

                var results = hits.hits;
                var scroll_id = _scroll_id;
                var depth = state.getIn(['depth']);
                if (results.length > 0) {
                    if (results[0]._index !== searchTypes[depth]) {
                        return state;
                    }
                }
                var posts = (0, _immutable.List)(results.map(function (post) {
                    var updatedPost = (0, _extends3.default)({}, post._source);
                    updatedPost.created = post._source.created_at;
                    updatedPost.author_reputation = post._source.author_rep;
                    updatedPost.stats = {
                        total_votes: post._source.total_votes
                    };
                    return (0, _immutable.fromJS)(updatedPost);
                }));

                var newState = {};
                if (!append) {
                    newState = state.set('result', posts).set('scrollId', scroll_id).set('total_result', hits.total.value);
                } else {
                    // If append is true. need to process results and append them to previous result
                    var updatedResults = state.get('result').concat(posts);
                    newState = state.setIn(['result'], new _immutable.List(updatedResults)).setIn(['scrollId'], scroll_id).setIn(['total_result'], hits.total.value);
                }
                return newState;
            }
        default:
            return state;
    }
}

var search = exports.search = function search(payload) {
    return {
        type: SEARCH_DISPATCH,
        payload: payload
    };
};
var searchPending = exports.searchPending = function searchPending(payload) {
    return {
        type: SEARCH_PENDING,
        payload: payload
    };
};
var searchError = exports.searchError = function searchError(payload) {
    return {
        type: SEARCH_PENDING,
        payload: payload
    };
};

var searchResult = exports.searchResult = function searchResult(payload) {
    return {
        type: SEARCH_RESULT,
        payload: payload
    };
};

var searchReset = exports.searchReset = function searchReset(payload) {
    return {
        type: SEARCH_RESET,
        payload: payload
    };
};

var searchDepth = exports.searchDepth = function searchDepth(payload) {
    return {
        type: SEARCH_DEPTH,
        payload: payload
    };
};

var searchSort = exports.searchSort = function searchSort(payload) {
    return {
        type: SEARCH_SORT,
        payload: payload
    };
};

var searchTotal = exports.searchTotal = function searchTotal(payload) {
    return {
        type: SEARCH_TOTAL,
        payload: payload
    };
};