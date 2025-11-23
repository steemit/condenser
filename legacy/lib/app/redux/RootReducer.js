'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _immutable = require('immutable');

var _reactRouterRedux = require('react-router-redux');

var _redux = require('redux');

var _reduxForm = require('redux-form');

var _AppReducer = require('./AppReducer');

var _AppReducer2 = _interopRequireDefault(_AppReducer);

var _GlobalReducer = require('./GlobalReducer');

var _GlobalReducer2 = _interopRequireDefault(_GlobalReducer);

var _UserReducer = require('./UserReducer');

var _UserReducer2 = _interopRequireDefault(_UserReducer);

var _TransactionReducer = require('./TransactionReducer');

var _TransactionReducer2 = _interopRequireDefault(_TransactionReducer);

var _OffchainReducer = require('./OffchainReducer');

var _OffchainReducer2 = _interopRequireDefault(_OffchainReducer);

var _CommunityReducer = require('./CommunityReducer');

var _CommunityReducer2 = _interopRequireDefault(_CommunityReducer);

var _UserProfilesReducer = require('./UserProfilesReducer');

var _UserProfilesReducer2 = _interopRequireDefault(_UserProfilesReducer);

var _SearchReducer = require('./SearchReducer');

var _SearchReducer2 = _interopRequireDefault(_SearchReducer);

var _adReducer = require('./adReducer');

var _adReducer2 = _interopRequireDefault(_adReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initReducer(reducer, type) {
    return function (state, action) {
        if (!state) return reducer(state, action);

        // @@redux/INIT server and client init
        if (action.type === '@@redux/INIT' || action.type === '@@INIT') {
            if (!(state instanceof _immutable.Map)) {
                state = (0, _immutable.fromJS)(state);
            }
            return state;
        }

        if (action.type === '@@router/LOCATION_CHANGE' && type === 'global') {
            state = state.set('pathname', action.payload.pathname);
            // console.log(action.type, type, action, state.toJS())
        }

        return reducer(state, action);
    };
} // @deprecated, instead use: app/utils/ReactForm.js
exports.default = (0, _redux.combineReducers)({
    community: initReducer(_CommunityReducer2.default),
    global: initReducer(_GlobalReducer2.default, 'global'),
    offchain: initReducer(_OffchainReducer2.default),
    user: initReducer(_UserReducer2.default),
    transaction: initReducer(_TransactionReducer2.default),
    discussion: initReducer(function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return state;
    }),
    routing: initReducer(_reactRouterRedux.routerReducer),
    app: initReducer(_AppReducer2.default),
    form: _reduxForm.reducer,
    userProfiles: initReducer(_UserProfilesReducer2.default),
    search: initReducer(_SearchReducer2.default),
    ad: initReducer(_adReducer2.default)
});