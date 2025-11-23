'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _reactIntl = require('react-intl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DateJoinWrapper = function (_React$Component) {
    (0, _inherits3.default)(DateJoinWrapper, _React$Component);

    function DateJoinWrapper() {
        (0, _classCallCheck3.default)(this, DateJoinWrapper);
        return (0, _possibleConstructorReturn3.default)(this, (DateJoinWrapper.__proto__ || (0, _getPrototypeOf2.default)(DateJoinWrapper)).apply(this, arguments));
    }

    (0, _createClass3.default)(DateJoinWrapper, [{
        key: 'render',
        value: function render() {
            var date = this.props.date.replace(' ', 'T');
            if (date[date.length - 1] != 'Z') date += 'Z';

            return _react2.default.createElement(
                'span',
                null,
                (0, _counterpart2.default)('g.joined'),
                ' ',
                _react2.default.createElement(_reactIntl.FormattedDate, {
                    value: new Date(date),
                    year: 'numeric',
                    month: 'long'
                })
            );
        }
    }]);
    return DateJoinWrapper;
}(_react2.default.Component);

exports.default = DateJoinWrapper;