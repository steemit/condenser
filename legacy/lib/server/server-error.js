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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ServerError = function (_Component) {
    (0, _inherits3.default)(ServerError, _Component);

    function ServerError() {
        (0, _classCallCheck3.default)(this, ServerError);
        return (0, _possibleConstructorReturn3.default)(this, (ServerError.__proto__ || (0, _getPrototypeOf2.default)(ServerError)).apply(this, arguments));
    }

    (0, _createClass3.default)(ServerError, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                {
                    className: 'float-center',
                    style: { width: '640px', textAlign: 'center' }
                },
                _react2.default.createElement('img', { width: '640px', height: '480px', src: '/images/500.jpg' }),
                _react2.default.createElement(
                    'div',
                    {
                        style: {
                            width: '300px',
                            position: 'relative',
                            left: '400px',
                            top: '-400px',
                            textAlign: 'left'
                        }
                    },
                    _react2.default.createElement(
                        'h4',
                        null,
                        'Sorry.'
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        'Looks like something went wrong on our end.'
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        'Head back to ',
                        _react2.default.createElement(
                            'a',
                            { href: '/' },
                            'Steemit'
                        ),
                        ' homepage.'
                    )
                )
            );
        }
    }]);
    return ServerError;
}(_react.Component);

exports.default = ServerError;