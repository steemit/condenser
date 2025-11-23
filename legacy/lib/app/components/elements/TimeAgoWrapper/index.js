'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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
var TimeAgoWrapper = function (_React$Component) {
    (0, _inherits3.default)(TimeAgoWrapper, _React$Component);

    function TimeAgoWrapper() {
        (0, _classCallCheck3.default)(this, TimeAgoWrapper);
        return (0, _possibleConstructorReturn3.default)(this, (TimeAgoWrapper.__proto__ || (0, _getPrototypeOf2.default)(TimeAgoWrapper)).apply(this, arguments));
    }

    (0, _createClass3.default)(TimeAgoWrapper, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                date = _props.date,
                className = _props.className;

            if (date && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(date)) {
                date = date + 'Z'; // Firefox really wants this Z (Zulu)
            }
            var dt = new Date(date);
            var date_time = this.props.intl.formatDate(dt) + ' ' + this.props.intl.formatTime(dt);
            return _react2.default.createElement(
                _Tooltip2.default,
                { t: date_time, className: className },
                _react2.default.createElement(_reactIntl.FormattedRelative, (0, _extends3.default)({}, this.props, { value: date }))
            );
        }
    }]);
    return TimeAgoWrapper;
}(_react2.default.Component);

exports.default = (0, _reactIntl.injectIntl)(TimeAgoWrapper);