'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactIntl = require('react-intl');

var _Tooltip = require('app/components/elements/Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint react/prop-types: 0 */
var ContentEditedWrapper = function (_React$Component) {
    (0, _inherits3.default)(ContentEditedWrapper, _React$Component);

    function ContentEditedWrapper() {
        (0, _classCallCheck3.default)(this, ContentEditedWrapper);
        return (0, _possibleConstructorReturn3.default)(this, (ContentEditedWrapper.__proto__ || (0, _getPrototypeOf2.default)(ContentEditedWrapper)).apply(this, arguments));
    }

    (0, _createClass3.default)(ContentEditedWrapper, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                createDate = _props.createDate,
                updateDate = _props.updateDate,
                className = _props.className;

            if (createDate === updateDate) return null;

            if (updateDate && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(updateDate)) {
                updateDate = updateDate + 'Z'; // Firefox really wants this Z (Zulu)
            }
            var dt = new Date(updateDate);
            var date_time = this.props.intl.formatDate(dt) + ' ' + this.props.intl.formatTime(dt);
            return _react2.default.createElement(
                _Tooltip2.default,
                { t: date_time, className: className },
                '(edited)'
            );
        }
    }]);
    return ContentEditedWrapper;
}(_react2.default.Component);

exports.default = (0, _reactIntl.injectIntl)(ContentEditedWrapper);