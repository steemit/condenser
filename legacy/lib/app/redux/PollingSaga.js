'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.stopPolling = exports.startPolling = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.watchPollingTasks = watchPollingTasks;

var _effects = require('redux-saga/effects');

var _reduxSaga = require('redux-saga');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(poll),
    _marked2 = /*#__PURE__*/_regenerator2.default.mark(watchPollingTasks);

var START_POLLING = 'START_POLLING';
var STOP_POLLING = 'STOP_POLLING';

function poll(action) {
    var params;
    return _regenerator2.default.wrap(function poll$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    params = (0, _extends3.default)({}, action.payload);

                case 1:
                    if (!true) {
                        _context.next = 15;
                        break;
                    }

                    _context.prev = 2;
                    _context.next = 5;
                    return (0, _effects.put)(params.pollAction(params.pollPayload));

                case 5:
                    _context.next = 7;
                    return (0, _effects.call)(_reduxSaga.delay, params.delay);

                case 7:
                    _context.next = 13;
                    break;

                case 9:
                    _context.prev = 9;
                    _context.t0 = _context['catch'](2);
                    _context.next = 13;
                    return (0, _effects.put)(stopPolling());

                case 13:
                    _context.next = 1;
                    break;

                case 15:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this, [[2, 9]]);
}

function watchPollingTasks() {
    var action;
    return _regenerator2.default.wrap(function watchPollingTasks$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    if (!true) {
                        _context2.next = 8;
                        break;
                    }

                    _context2.next = 3;
                    return (0, _effects.take)(START_POLLING);

                case 3:
                    action = _context2.sent;
                    _context2.next = 6;
                    return (0, _effects.race)([(0, _effects.call)(poll, action), (0, _effects.take)(STOP_POLLING)]);

                case 6:
                    _context2.next = 0;
                    break;

                case 8:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked2, this);
}

var startPolling = exports.startPolling = function startPolling(payload) {
    return {
        type: START_POLLING,
        payload: payload
    };
};

var stopPolling = exports.stopPolling = function stopPolling(payload) {
    return {
        type: STOP_POLLING,
        payload: payload
    };
};