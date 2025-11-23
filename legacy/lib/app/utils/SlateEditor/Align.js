'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Align = function (_React$Component) {
    (0, _inherits3.default)(Align, _React$Component);

    function Align() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, Align);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Align.__proto__ || (0, _getPrototypeOf2.default)(Align)).call.apply(_ref, [this].concat(args))), _this), _this.getAlignClass = function () {
            var node = _this.props.node;

            switch (node.data.get('align')) {
                case 'text-right':
                    return 'text-right';
                case 'text-left':
                    return 'text-left';
                case 'text-center':
                    return 'text-center';
                case 'pull-right':
                    return 'pull-right';
                case 'pull-left':
                    return 'pull-left';
            }
        }, _this.render = function () {
            var _this$props = _this.props,
                node = _this$props.node,
                attributes = _this$props.attributes,
                children = _this$props.children;

            var className = _this.getAlignClass();

            return _react2.default.createElement(
                'div',
                (0, _extends3.default)({}, attributes, { className: className }),
                children
            );
        }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    return Align;
}(_react2.default.Component);

exports.default = Align;