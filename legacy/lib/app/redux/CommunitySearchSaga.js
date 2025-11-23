'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.searchWatches = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.communitySearchSaga = communitySearchSaga;

var _effects = require('redux-saga/effects');

var _CommunitySearchReducer = require('app/redux/CommunitySearchReducer');

var reducer = _interopRequireWildcard(_CommunitySearchReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = /*#__PURE__*/_regenerator2.default.mark(communitySearchSaga);

var searchWatches = exports.searchWatches = [(0, _effects.takeEvery)('communitySearch/COMMUNITY_SEARCH_DISPATCH', communitySearchSaga)];

function communitySearchSaga(action) {
    return _regenerator2.default.wrap(function communitySearchSaga$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return (0, _effects.put)(reducer.communitySearchPending({ pending: true }));

                case 2:
                    _context.prev = 2;
                    _context.next = 10;
                    break;

                case 5:
                    _context.prev = 5;
                    _context.t0 = _context['catch'](2);

                    console.log('Search error', _context.t0);
                    _context.next = 10;
                    return (0, _effects.put)(reducer.communitySearchError({ error: _context.t0 }));

                case 10:
                    _context.next = 12;
                    return (0, _effects.put)(reducer.communitySearchPending({ pending: false }));

                case 12:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked, this, [[2, 5]]);
}