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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SubmitPostServerRender = function (_React$Component) {
    (0, _inherits3.default)(SubmitPostServerRender, _React$Component);

    function SubmitPostServerRender() {
        (0, _classCallCheck3.default)(this, SubmitPostServerRender);
        return (0, _possibleConstructorReturn3.default)(this, (SubmitPostServerRender.__proto__ || (0, _getPrototypeOf2.default)(SubmitPostServerRender)).apply(this, arguments));
    }

    (0, _createClass3.default)(SubmitPostServerRender, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'text-center' },
                (0, _counterpart2.default)('g.loading'),
                '...'
            );
        }
    }]);
    return SubmitPostServerRender;
}(_react2.default.Component);

module.exports = {
    path: 'submit.html',
    component: SubmitPostServerRender
};