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

var _SvgImage = require('app/components/elements/SvgImage');

var _SvgImage2 = _interopRequireDefault(_SvgImage);

var _Translator = require('app/Translator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Index = function (_React$Component) {
    (0, _inherits3.default)(Index, _React$Component);

    function Index() {
        (0, _classCallCheck3.default)(this, Index);
        return (0, _possibleConstructorReturn3.default)(this, (Index.__proto__ || (0, _getPrototypeOf2.default)(Index)).apply(this, arguments));
    }

    (0, _createClass3.default)(Index, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'Index' },
                _react2.default.createElement(
                    'div',
                    { className: 'text-center' },
                    _react2.default.createElement(_SvgImage2.default, { name: 'steemit', width: '480px', height: '240px' })
                ),
                _react2.default.createElement(
                    'h1',
                    { className: 'center text-center' },
                    (0, _Translator.translateHtml)('APP_NAME_is_a_social_media_platform_where_everyone_gets_paid_for_creating_and_curating_content'),
                    '.'
                ),
                _react2.default.createElement('br', null),
                _react2.default.createElement('br', null)
            );
        }
    }]);
    return Index;
}(_react2.default.Component);

exports.default = Index;