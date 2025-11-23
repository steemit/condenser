'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.communitySearchResult = exports.communitySearchError = exports.communitySearchPending = exports.communitySearch = undefined;
exports.default = reducer;

var _immutable = require('immutable');

var COMMUNITY_SEARCH_DISPATCH = 'communitySearch/COMMUNITY_SEARCH_DISPATCH';
var COMMUNITY_SEARCH_PENDING = 'communitySearch/COMMUNITY_SEARCH_PENDING';
var COMMUNITY_SEARCH_ERROR = 'communitySearch/COMMUNITY_SEARCH_ERROR';
var COMMUNITY_SEARCH_RESULT = 'communitySearch/COMMUNITY_SEARCH_RESULT';

var defaultCommunitySearchState = (0, _immutable.Map)({
    pending: false,
    error: false,
    result: (0, _immutable.List)([])
});

function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultCommunitySearchState;
    var action = arguments[1];

    var payload = action.payload;

    switch (action.type) {
        // Has a saga watcher.
        case COMMUNITY_SEARCH_DISPATCH:
            {
                return state;
            }
        case COMMUNITY_SEARCH_PENDING:
            {
                var pending = payload.pending;

                return state.setIn(['pending'], pending);
            }
        case COMMUNITY_SEARCH_ERROR:
            {
                var error = payload.error;

                return state.setIn(['error'], error);
            }
        case COMMUNITY_SEARCH_RESULT:
            {
                // TODO: format / parse the search result and put it into state
                return state;
            }
        default:
            return state;
    }
}

var communitySearch = exports.communitySearch = function communitySearch(payload) {
    return {
        type: COMMUNITY_SEARCH_DISPATCH,
        payload: payload
    };
};
var communitySearchPending = exports.communitySearchPending = function communitySearchPending(payload) {
    return {
        type: COMMUNITY_SEARCH_PENDING,
        payload: payload
    };
};
var communitySearchError = exports.communitySearchError = function communitySearchError(payload) {
    return {
        type: COMMUNITY_SEARCH_PENDING,
        payload: payload
    };
};

var communitySearchResult = exports.communitySearchResult = function communitySearchResult(payload) {
    return {
        type: COMMUNITY_SEARCH_RESULT,
        payload: payload
    };
};