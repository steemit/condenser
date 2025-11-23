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

var _client_config = require('app/client_config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Support = function (_React$Component) {
    (0, _inherits3.default)(Support, _React$Component);

    function Support() {
        (0, _classCallCheck3.default)(this, Support);
        return (0, _possibleConstructorReturn3.default)(this, (Support.__proto__ || (0, _getPrototypeOf2.default)(Support)).apply(this, arguments));
    }

    (0, _createClass3.default)(Support, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'row' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h2',
                        null,
                        (0, _counterpart2.default)('g.APP_NAME_support', { APP_NAME: _client_config.APP_NAME })
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        (0, _counterpart2.default)('g.please_email_questions_to'),
                        ' ',
                        _react2.default.createElement(
                            'a',
                            { href: 'mailto:contact@steemit.com' },
                            'contact@steemit.com'
                        ),
                        '.'
                    )
                )
            );
        }
    }]);
    return Support;
}(_react2.default.Component);

module.exports = {
    path: 'support.html',
    component: Support
};