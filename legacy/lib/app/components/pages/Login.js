'use strict';

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

var _LoginForm = require('app/components/modules/LoginForm');

var _LoginForm2 = _interopRequireDefault(_LoginForm);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Login = function (_React$Component) {
    (0, _inherits3.default)(Login, _React$Component);

    function Login() {
        (0, _classCallCheck3.default)(this, Login);
        return (0, _possibleConstructorReturn3.default)(this, (Login.__proto__ || (0, _getPrototypeOf2.default)(Login)).apply(this, arguments));
    }

    (0, _createClass3.default)(Login, [{
        key: 'render',
        value: function render() {
            if (!process.env.BROWSER) {
                // don't render this page on the server
                return _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        (0, _counterpart2.default)('g.loading'),
                        '..'
                    )
                );
            }
            return _react2.default.createElement(
                'div',
                { className: 'Login row' },
                _react2.default.createElement(
                    'div',
                    { className: 'column' },
                    _react2.default.createElement(_LoginForm2.default, null)
                )
            );
        }
    }]);
    return Login;
}(_react2.default.Component);

module.exports = {
    path: 'login.html',
    component: Login
};