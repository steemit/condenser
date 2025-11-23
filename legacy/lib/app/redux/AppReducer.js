'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setRouteTag = exports.setTronErrMsg = exports.setFeRendered = exports.modalLoadingEnd = exports.modalLoadingBegin = exports.selectors = exports.receiveFeatureFlags = exports.toggleBlogmode = exports.toggleNightmode = exports.setUserPreferences = exports.removeNotification = exports.addNotification = exports.fetchDataEnd = exports.fetchDataBegin = exports.steemApiError = exports.defaultState = exports.MODAL_LOADING_END = exports.MODAL_LOADING_BEGIN = exports.RECEIVE_FEATURE_FLAGS = exports.TOGGLE_BLOGMODE = exports.TOGGLE_NIGHTMODE = exports.SET_USER_PREFERENCES = exports.ROUTE_TAG_SET = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = reducer;

var _immutable = require('immutable');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-case-declarations */
var STEEM_API_ERROR = 'app/STEEM_API_ERROR';
var FETCH_DATA_BEGIN = 'app/FETCH_DATA_BEGIN';
var FETCH_DATA_END = 'app/FETCH_DATA_END';
var ADD_NOTIFICATION = 'app/ADD_NOTIFICATION';
var REMOVE_NOTIFICATION = 'app/REMOVE_NOTIFICATION';
var SET_FE_RENDERED = 'app/SET_FE_RENDERED';
var SET_TRON_ERR_MSG = 'app/SET_TRON_ERR_MSG';
var ROUTE_TAG_SET = exports.ROUTE_TAG_SET = 'app/ROUTE_TAG_SET';
var SET_USER_PREFERENCES = exports.SET_USER_PREFERENCES = 'app/SET_USER_PREFERENCES';
var TOGGLE_NIGHTMODE = exports.TOGGLE_NIGHTMODE = 'app/TOGGLE_NIGHTMODE';
var TOGGLE_BLOGMODE = exports.TOGGLE_BLOGMODE = 'app/TOGGLE_BLOGMODE';
var RECEIVE_FEATURE_FLAGS = exports.RECEIVE_FEATURE_FLAGS = 'app/RECEIVE_FEATURE_FLAGS';
var MODAL_LOADING_BEGIN = exports.MODAL_LOADING_BEGIN = 'app/MODAL_LOADING_BEGIN';
var MODAL_LOADING_END = exports.MODAL_LOADING_END = 'app/MODAL_LOADING_END';

var defaultState = exports.defaultState = (0, _immutable.Map)({
    loading: false,
    error: '',
    location: {},
    notifications: null,
    user_preferences: (0, _immutable.Map)({
        locale: null,
        nsfwPref: 'warn',
        nightmode: false,
        blogmode: false,
        currency: 'USD',
        defaultBlogPayout: '50%',
        defaultCommentPayout: '50%',
        selectedRpc: ''
    }),
    featureFlags: (0, _immutable.Map)({}),
    modalLoading: false,
    tronErrMsg: null,
    routeTag: null
});

function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    switch (action.type) {
        case '@@router/LOCATION_CHANGE':
            return state.set('location', { pathname: action.payload.pathname });
        case STEEM_API_ERROR:
            // Until we figure out how to better handle these errors, let em slide.
            // This action is the only part of the app that marks an error in state.app.error,
            // and the only part of the app which pays attn to this part of the state is in App.jsx.
            // return  state.set('error', action.error).set('loading', false);
            // It is also worth noting that showTransactionErrorNotification in SagaShared
            // Will check state.transaction.errors and create a notification for whatever it finds there.
            // While TransactionReducer will add items to state.transaction.errors.
            console.error('SteemApiError', action.payload);
            return state;
        case FETCH_DATA_BEGIN:
            return state.set('loading', true);
        case FETCH_DATA_END:
            return state.set('loading', false);
        case ADD_NOTIFICATION:
            {
                var n = (0, _extends3.default)({
                    action: (0, _counterpart2.default)('g.dismiss'),
                    dismissAfter: 10000
                }, action.payload);
                return state.update('notifications', function (s) {
                    return s ? s.set(n.key, n) : (0, _immutable.OrderedMap)((0, _defineProperty3.default)({}, n.key, n));
                });
            }
        case REMOVE_NOTIFICATION:
            return state.update('notifications', function (s) {
                return s.delete(action.payload.key);
            });
        case SET_USER_PREFERENCES:
            return state.set('user_preferences', (0, _immutable.Map)(action.payload));
        case TOGGLE_NIGHTMODE:
            return state.setIn(['user_preferences', 'nightmode'], !state.getIn(['user_preferences', 'nightmode']));
        case TOGGLE_BLOGMODE:
            return state.setIn(['user_preferences', 'blogmode'], !state.getIn(['user_preferences', 'blogmode']));
        case RECEIVE_FEATURE_FLAGS:
            var newFlags = state.get('featureFlags') ? state.get('featureFlags').merge(action.flags) : (0, _immutable.Map)(action.flags);
            return state.set('featureFlags', newFlags);
        case MODAL_LOADING_BEGIN:
            return state.set('modalLoading', true);
        case MODAL_LOADING_END:
            return state.set('modalLoading', false);
        case SET_FE_RENDERED:
            return state.set('frontend_has_rendered', true);
        case SET_TRON_ERR_MSG:
            return state.set('tronErrMsg', action.msg);
        case ROUTE_TAG_SET:
            return state.set('routeTag', action);
        default:
            return state;
    }
}

var steemApiError = exports.steemApiError = function steemApiError(error) {
    return {
        type: STEEM_API_ERROR,
        error: error
    };
};

var fetchDataBegin = exports.fetchDataBegin = function fetchDataBegin() {
    return {
        type: FETCH_DATA_BEGIN
    };
};

var fetchDataEnd = exports.fetchDataEnd = function fetchDataEnd() {
    return {
        type: FETCH_DATA_END
    };
};

var addNotification = exports.addNotification = function addNotification(payload) {
    return {
        type: ADD_NOTIFICATION,
        payload: payload
    };
};

var removeNotification = exports.removeNotification = function removeNotification(payload) {
    return {
        type: REMOVE_NOTIFICATION,
        payload: payload
    };
};

var setUserPreferences = exports.setUserPreferences = function setUserPreferences(payload) {
    return {
        type: SET_USER_PREFERENCES,
        payload: payload
    };
};

var toggleNightmode = exports.toggleNightmode = function toggleNightmode() {
    return {
        type: TOGGLE_NIGHTMODE
    };
};

var toggleBlogmode = exports.toggleBlogmode = function toggleBlogmode() {
    return {
        type: TOGGLE_BLOGMODE
    };
};

var receiveFeatureFlags = exports.receiveFeatureFlags = function receiveFeatureFlags(flags) {
    return {
        type: RECEIVE_FEATURE_FLAGS,
        flags: flags
    };
};

var selectors = exports.selectors = {
    getFeatureFlag: function getFeatureFlag(state, flagName) {
        return state.getIn(['featureFlags', flagName], false);
    }
};

var modalLoadingBegin = exports.modalLoadingBegin = function modalLoadingBegin(payload) {
    return {
        type: MODAL_LOADING_BEGIN,
        payload: payload
    };
};

var modalLoadingEnd = exports.modalLoadingEnd = function modalLoadingEnd(payload) {
    return {
        type: MODAL_LOADING_END,
        payload: payload
    };
};

var setFeRendered = exports.setFeRendered = function setFeRendered(payload) {
    return {
        type: SET_FE_RENDERED,
        payload: payload
    };
};

var setTronErrMsg = exports.setTronErrMsg = function setTronErrMsg(msg) {
    return {
        type: SET_TRON_ERR_MSG,
        msg: msg
    };
};

var setRouteTag = exports.setRouteTag = function setRouteTag(payload) {
    return {
        type: ROUTE_TAG_SET,
        routeTag: payload.routeTag,
        params: payload.params
    };
};