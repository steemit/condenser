'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GptUtils = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _DomUtils = require('./DomUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GptUtils = function () {
    function GptUtils() {
        (0, _classCallCheck3.default)(this, GptUtils);
    }

    (0, _createClass3.default)(GptUtils, null, [{
        key: 'ShowGptMobileSize',

        /**
         * Should we show the mobile version of an ad?
         *
         * @returns {boolean}
         */
        value: function ShowGptMobileSize() {
            return (0, _DomUtils.getViewportDimensions)().w <= 768;
        }

        /**
         * Naively append-mobile to a given string representing an ad slot name.
         *
         * @param {string} slotName
         * @returns {string}
         */

    }, {
        key: 'MobilizeSlotName',
        value: function MobilizeSlotName(slotName) {
            var mobileSlotAddendum = '';
            if (this.ShowGptMobileSize()) mobileSlotAddendum = '-mobile';
            return '' + slotName + mobileSlotAddendum;
        }

        /**
         * Takes an array of tags and determines whether one or more tags are banned from showing ads.
         *
         * @param {array[strings]} tags
         * @param {array[strings]} bannedTags
         * @returns {boolean}
         */

    }, {
        key: 'HasBannedTags',
        value: function HasBannedTags() {
            var tags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var bannedTags = arguments[1];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(tags), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var tag = _step.value;

                    if (bannedTags.indexOf(tag) != -1) {
                        return true;
                    }
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
        }
    }]);
    return GptUtils;
}();

exports.GptUtils = GptUtils;