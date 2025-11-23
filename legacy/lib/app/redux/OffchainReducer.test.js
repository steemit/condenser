'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _immutable = require('immutable');

var _OffchainReducer = require('./OffchainReducer');

var _OffchainReducer2 = _interopRequireDefault(_OffchainReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mockAction = {
    type: 'user/SAVE_LOGIN_CONFIRM'
};

var mockActionWithPayload = (0, _extends3.default)({}, mockAction, { payload: 'Foo Barman' });

describe('offchain reducer', function () {
    it('should provide a nice initial state, with any payload', function () {
        var initial = (0, _OffchainReducer2.default)();
        var expected = (0, _immutable.Map)({ user: (0, _immutable.Map)({}) });
        expect(initial).toEqual(expected);
        var withPayload = (0, _OffchainReducer2.default)(initial, mockActionWithPayload);
        expect(withPayload).toEqual(expected);
    });
    it('should return an account of null when action has no payload', function () {
        var initial = (0, _OffchainReducer2.default)();
        var account = (0, _OffchainReducer2.default)(initial, mockAction);
        expect(account).toEqual((0, _immutable.Map)({ user: (0, _immutable.Map)({}), account: null }));
    });
});