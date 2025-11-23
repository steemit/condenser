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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SvgImage = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(SvgImage, _React$Component);

    function SvgImage() {
        (0, _classCallCheck3.default)(this, SvgImage);
        return (0, _possibleConstructorReturn3.default)(this, (SvgImage.__proto__ || (0, _getPrototypeOf2.default)(SvgImage)).apply(this, arguments));
    }

    (0, _createClass3.default)(SvgImage, [{
        key: 'render',
        value: function render() {
            var style = {
                display: 'inline-block',
                width: this.props.width,
                height: this.props.height
            };
            var image = require('assets/images/' + this.props.name + '.svg');
            var cn = 'SvgImage' + (this.props.className ? ' ' + this.props.className : '');
            return _react2.default.createElement('span', {
                className: cn,
                style: style,
                dangerouslySetInnerHTML: { __html: image }
            });
        }
    }]);
    return SvgImage;
}(_react2.default.Component), _class.propTypes = {
    name: _propTypes2.default.string.isRequired,
    width: _propTypes2.default.string.isRequired,
    height: _propTypes2.default.string.isRequired,
    className: _propTypes2.default.string
}, _temp);
exports.default = SvgImage;