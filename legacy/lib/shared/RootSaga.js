'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.default = rootSaga;

var _effects = require('redux-saga/effects');

var _GlobalSaga = require('app/redux/GlobalSaga');

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _SagaShared = require('app/redux/SagaShared');

var _UserSaga = require('app/redux/UserSaga');

var _AuthSaga = require('app/redux/AuthSaga');

var _TransactionSaga = require('app/redux/TransactionSaga');

var _CommunitySaga = require('app/redux/CommunitySaga');

var _UserProfilesSaga = require('app/redux/UserProfilesSaga');

var _SearchSaga = require('app/redux/SearchSaga');

var _PollingSaga = require('app/redux/PollingSaga');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(rootSaga);

function rootSaga() {
    return _regenerator2.default.wrap(function rootSaga$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return (0, _effects.all)([].concat((0, _toConsumableArray3.default)(_UserSaga.userWatches), (0, _toConsumableArray3.default)(_GlobalSaga.globalWatches), (0, _toConsumableArray3.default)(_FetchDataSaga.fetchDataWatches), (0, _toConsumableArray3.default)(_SagaShared.sharedWatches), (0, _toConsumableArray3.default)(_AuthSaga.authWatches), (0, _toConsumableArray3.default)(_TransactionSaga.transactionWatches), (0, _toConsumableArray3.default)(_CommunitySaga.communityWatches), (0, _toConsumableArray3.default)(_UserProfilesSaga.userProfilesWatches), (0, _toConsumableArray3.default)(_SearchSaga.searchWatches), [(0, _PollingSaga.watchPollingTasks)()]));

                case 2:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this);
}