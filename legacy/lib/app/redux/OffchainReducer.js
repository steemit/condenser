'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = reducer;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _react = require('react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultState = _immutable2.default.fromJS({ user: {} });

function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (action.type === 'user/SAVE_LOGIN_CONFIRM') {
        if (!action.payload) {
            state = state.set('account', null);
        }
    }
    return state;
}