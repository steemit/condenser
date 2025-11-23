'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.TronPrice = TronPrice;

var _config = require('config');

var config = _interopRequireWildcard(_config);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _nodeCache = require('node-cache');

var _nodeCache2 = _interopRequireDefault(_nodeCache);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var key = config.steem_market_cache.key + '_tron';
function TronPrice() {
    var _this = this;

    var ttl = config.steem_market_cache.ttl;
    var cache = new _nodeCache2.default({
        stdTTL: ttl
    });
    // const key = `${config.steem_market_cache.key}_tron`;
    cache.on('expired', function (k, v) {
        console.log('Tron price Cache key expired', k);
        if (key === k) {
            _this.refresh();
        }
    });
    this.cache = cache;
    // Store empty data while we wait for the network request to complete
    this.storeEmpty().then(function () {
        return _this.refresh();
    });
}

TronPrice.prototype.storeEmpty = function () {
    var _this2 = this;

    // const key = config.steem_market_cache.key;
    return new _promise2.default(function (res, rej) {
        _this2.cache.set(key, {}, function (err, success) {
            console.info('Storing empty tron price data...');
            res();
        });
    });
};

TronPrice.prototype.get = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var _this3 = this;

    return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    return _context.abrupt('return', new _promise2.default(function (res, rej) {
                        // const key = config.steem_market_cache.key;
                        _this3.cache.get(key, function (err, value) {
                            if (err) {
                                console.error('Could not retrieve tron price data');
                                res({});
                                return;
                            }
                            res(value || {});
                        });
                    }));

                case 1:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this);
}));

TronPrice.prototype.refresh = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var _this4 = this;

    var url;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    console.info('Refreshing tron price data...');

                    url = 'https://apilist.tronscan.org/api/token/price?token=trx';
                    // const key = config.steem_market_cache.key;

                    if (url) {
                        _context2.next = 5;
                        break;
                    }

                    console.info('No tron price provided...');
                    return _context2.abrupt('return', this.storeEmpty());

                case 5:
                    _context2.next = 7;
                    return (0, _axios2.default)({
                        url: url,
                        method: 'GET'
                    }).then(function (response) {
                        console.info('Received Tron price data from endpoint...');
                        _this4.cache.set(key, response.data, function (err, success) {
                            if (err) {
                                rej(err);
                                return;
                            }
                            console.info('tron price data refreshed...');
                        });
                    }).catch(function (err) {
                        console.error('Could not fetch tron price data:', err.message);
                        return _this4.storeEmpty();
                    });

                case 7:
                    return _context2.abrupt('return', _context2.sent);

                case 8:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _callee2, this);
}));