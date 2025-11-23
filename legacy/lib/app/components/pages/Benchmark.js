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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    textAlign: 'center',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'minmax(80px, auto)'
};

var Grid = function Grid(_ref) {
    var children = _ref.children;
    return _react2.default.createElement(
        'div',
        { style: styles },
        children
    );
};

var Benchmark = function (_React$Component) {
    (0, _inherits3.default)(Benchmark, _React$Component);

    function Benchmark() {
        (0, _classCallCheck3.default)(this, Benchmark);
        return (0, _possibleConstructorReturn3.default)(this, (Benchmark.__proto__ || (0, _getPrototypeOf2.default)(Benchmark)).apply(this, arguments));
    }

    (0, _createClass3.default)(Benchmark, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                Grid,
                null,
                _Icon.icons.map(function (icon) {
                    return _react2.default.createElement(
                        'div',
                        { key: 'icon_' + icon },
                        _react2.default.createElement(_Icon2.default, { name: icon, size: '2x' }),
                        _react2.default.createElement(
                            'p',
                            null,
                            ' ',
                            icon,
                            ' '
                        )
                    );
                })
            );
        }
    }]);
    return Benchmark;
}(_react2.default.Component);

module.exports = {
    path: '/benchmark',
    component: Benchmark
};