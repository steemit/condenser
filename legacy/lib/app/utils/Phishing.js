'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.looksPhishy = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var domains = ['steewit.com', 'śteemit.com', 'ŝteemit.com', 'şteemit.com', 'šteemit.com', 'sţeemit.com', 'sťeemit.com', 'șteemit.com', 'sleemit.com', 'aba.ae', 'autobidbot.cf', 'autobidbot.ga', 'autobidbot.gq', 'autobotsteem.cf', 'autobotsteem.ga', 'autobotsteem.gq', 'autobotsteem.ml', 'autosteem.info', 'autosteembot.cf', 'autosteembot.ga', 'autosteembot.gq', 'autosteembot.ml', 'autosteemit.wapka.mobi', 'boostbot.ga', 'boostbot.gq', 'boostwhaleup.cf', 'cutt.us', 'dereferer.me', 'eb2a.com', 'lordlinkers.tk', 'nullrefer.com', 'steeemit.ml', 'steeemitt.aba.ae', 'steemart.ga', 'steemautobot.bid', 'steemautobot.cf', 'steemautobot.trade', 'steemers.aba.ae', 'steemiit.cf', 'steemiit.ga', 'steemij.tk', 'steemik.ga', 'steemik.tk', 'steemil.com', 'steemil.ml', 'steemir.tk', 'steemitou.co.nf', 'steemitservices.ga', 'steemitservices.gq', 'steemiz.tk', 'steemnow.cf', 'steemnow.ga', 'steemnow.gq', 'steemnow.ml', 'steempostupper.win', 'steemrewards.ml', 'steemrobot.ga', 'steemrobot.ml', 'steemupgot.cf', 'steemupgot.ga', 'steemupgot.gq', 'steemupper.cf', 'steemupper.ga', 'steemupper.gq', 'steemupper.ml', 'steenit.cf', 'stemit.com', 'stssmater.aba.ae', 'uppervotes.ga', 'uppervotes.gq', 'upperwhaleplus.cf', 'upperwhaleplus.ga', 'upperwhaleplus.gq', 'upvoteme.cf', 'upvoteme.ga', 'upvoteme.gq', 'upvoteme.ml', 'url.rw', 'us.aba.ae', 'whaleboostup.ga', 'whaleboostup.ml', 'steemboostup.icu', 'proservices.website'];

/**
 * Does this URL look like a phishing attempt?
 *
 * @param {string} questionableUrl
 * @returns {boolean}
 */
var looksPhishy = exports.looksPhishy = function looksPhishy(questionableUrl) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(domains), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var domain = _step.value;

            if (questionableUrl.toLocaleLowerCase().indexOf(domain) > -1) return true;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return false;
};