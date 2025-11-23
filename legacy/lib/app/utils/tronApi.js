'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.transferTrxTo = exports.getTronAccount = exports.createTronAccount = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var createTronAccount = exports.createTronAccount = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var apiTronHost, tronWeb;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        apiTronHost = global.$STM_Config ? global.$STM_Config.tron_host : 'https://api.shasta.trongrid.io';
                        tronWeb = new _tronweb2.default({
                            fullHost: apiTronHost
                        });
                        _context.prev = 2;
                        _context.next = 5;
                        return tronWeb.createAccount();

                    case 5:
                        return _context.abrupt('return', _context.sent);

                    case 8:
                        _context.prev = 8;
                        _context.t0 = _context['catch'](2);

                        console.error('create tron account error:' + _context.t0);
                        return _context.abrupt('return', null);

                    case 12:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[2, 8]]);
    }));

    return function createTronAccount() {
        return _ref.apply(this, arguments);
    };
}(); /* eslint-disable import/prefer-default-export */


var getTronAccount = exports.getTronAccount = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(addr) {
        var apiTronHost, tronWeb;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        apiTronHost = global.$STM_Config ? global.$STM_Config.tron_host : 'https://api.shasta.trongrid.io';
                        tronWeb = new _tronweb2.default({
                            fullHost: apiTronHost
                        });
                        _context2.next = 4;
                        return tronWeb.trx.getAccount(addr);

                    case 4:
                        return _context2.abrupt('return', _context2.sent);

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getTronAccount(_x) {
        return _ref2.apply(this, arguments);
    };
}();

var transferTrxTo = exports.transferTrxTo = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(from, to, amount, memo, privateKey) {
        var apiTronHost, tronWeb, sumAmount, tx, signedTx, trxResult;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        apiTronHost = global.$STM_Config ? global.$STM_Config.tron_host : 'https://api.shasta.trongrid.io';
                        tronWeb = new _tronweb2.default({
                            fullHost: apiTronHost
                        });
                        sumAmount = parseInt(amount * 1e6, 10);
                        // build tx

                        _context3.next = 5;
                        return tronWeb.transactionBuilder.sendTrx(to, sumAmount, from);

                    case 5:
                        tx = _context3.sent;

                        if (!memo) {
                            _context3.next = 10;
                            break;
                        }

                        _context3.next = 9;
                        return tronWeb.transactionBuilder.addUpdateData(tx, memo, 'utf8');

                    case 9:
                        tx = _context3.sent;

                    case 10:
                        _context3.next = 12;
                        return tronWeb.trx.sign(tx, privateKey);

                    case 12:
                        signedTx = _context3.sent;
                        _context3.next = 15;
                        return tronWeb.trx.sendRawTransaction(signedTx);

                    case 15:
                        trxResult = _context3.sent;
                        return _context3.abrupt('return', trxResult);

                    case 17:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function transferTrxTo(_x2, _x3, _x4, _x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

var _tronweb = require('tronweb');

var _tronweb2 = _interopRequireDefault(_tronweb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }