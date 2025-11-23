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

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _SteemLogo = require('app/components/elements/SteemLogo');

var _SteemLogo2 = _interopRequireDefault(_SteemLogo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NotFound = function (_React$Component) {
    (0, _inherits3.default)(NotFound, _React$Component);

    function NotFound() {
        (0, _classCallCheck3.default)(this, NotFound);
        return (0, _possibleConstructorReturn3.default)(this, (NotFound.__proto__ || (0, _getPrototypeOf2.default)(NotFound)).apply(this, arguments));
    }

    (0, _createClass3.default)(NotFound, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    { className: 'row Header__nav' },
                    _react2.default.createElement(
                        'div',
                        { className: 'small-5 large-4 columns Header__logotype' },
                        _react2.default.createElement(
                            'a',
                            { href: '/' },
                            _react2.default.createElement(_SteemLogo2.default, null)
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'NotFound float-center' },
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(_Icon2.default, { name: 'steem', size: '4x' }),
                        _react2.default.createElement(
                            'h4',
                            { className: 'NotFound__header' },
                            'Sorry! This page doesn\'t exist.'
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            'Not to worry. You can head back to',
                            ' ',
                            _react2.default.createElement(
                                'a',
                                { style: { fontWeight: 800 }, href: '/' },
                                'our homepage'
                            ),
                            ', or check out some great posts.'
                        ),
                        _react2.default.createElement(
                            'ul',
                            { className: 'NotFound__menu' },
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: '/created' },
                                    'new posts'
                                )
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: '/hot' },
                                    'hot posts'
                                )
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: '/trending' },
                                    'trending posts'
                                )
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: '/promoted' },
                                    'promoted posts'
                                )
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: '/active' },
                                    'active posts'
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);
    return NotFound;
}(_react2.default.Component);

module.exports = {
    path: '*',
    component: NotFound
};