'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _GlobalReducer = require('../GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global describe, it, before, beforeEach, after, afterEach */
describe('global reducer', function () {
    it('should return empty state', function () {
        var reduced = (0, globalActions.default)(undefined, {});

        expect(reduced.toJS()).toEqual({ status: {} });
    });

    it('should apply new global state', function () {
        var state = _immutable2.default.fromJS(require('./global.json'));
        var reduced = (0, globalActions.default)(undefined, globalActions.receiveState(state));
        //const action = {type: 'global/RECEIVE_STATE', payload: state};
        expect(reduced.toJS()).toEqual(state.toJS());
    });
});