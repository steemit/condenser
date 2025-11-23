'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.globalWatches = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.getDGP = getDGP;

var _effects = require('redux-saga/effects');

var _immutable = require('immutable');

var _steemApi = require('app/utils/steemApi');

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(getDGP);

var globalWatches = exports.globalWatches = [(0, _effects.takeEvery)(globalActions.GET_DGP, getDGP)];

function getDGP() {
    var dgp;
    return _regenerator2.default.wrap(function getDGP$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return (0, _effects.select)(function (state) {
                        return state.global.get('dgp');
                    });

                case 2:
                    dgp = _context.sent;

                    if (dgp) {
                        _context.next = 11;
                        break;
                    }

                    _context.next = 6;
                    return (0, _steemApi.getDynamicGlobalProperties)();

                case 6:
                    dgp = _context.sent;
                    _context.next = 9;
                    return (0, _effects.put)(globalActions.setDGP(dgp));

                case 9:
                    _context.next = 11;
                    return (0, _effects.put)(globalActions.setVestsPerSteem(dgp.total_vesting_shares.split(' ')[0] / dgp.total_vesting_fund_steem.split(' ')[0]));

                case 11:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this);
}