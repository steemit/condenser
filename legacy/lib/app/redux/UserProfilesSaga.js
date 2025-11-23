'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.actions = exports.userProfilesWatches = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.fetchUserProfile = fetchUserProfile;

var _effects = require('redux-saga/effects');

var _UserProfilesReducer = require('./UserProfilesReducer');

var userProfileActions = _interopRequireWildcard(_UserProfilesReducer);

var _steemApi = require('app/utils/steemApi');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(fetchUserProfile);

var FETCH_PROFILE = 'userProfilesSaga/FETCH_PROFILE';

var userProfilesWatches = exports.userProfilesWatches = [(0, _effects.takeLatest)(FETCH_PROFILE, fetchUserProfile)];

function fetchUserProfile(action) {
    var _action$payload, account, observer, ret;

    return _regenerator2.default.wrap(function fetchUserProfile$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _action$payload = action.payload, account = _action$payload.account, observer = _action$payload.observer;
                    _context.next = 3;
                    return (0, _effects.call)(_steemApi.callBridge, 'get_profile', { account: account, observer: observer });

                case 3:
                    ret = _context.sent;

                    if (ret) {
                        _context.next = 6;
                        break;
                    }

                    throw new Error('Account not found');

                case 6:
                    _context.next = 8;
                    return (0, _effects.put)(userProfileActions.addProfile({ username: account, account: ret }));

                case 8:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this);
}

// Action creators
var actions = exports.actions = {
    fetchProfile: function fetchProfile(payload) {
        return {
            type: FETCH_PROFILE,
            payload: payload
        };
    }
};