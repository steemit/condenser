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

var _reactRouter = require('react-router');

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ShareMenu = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(ShareMenu, _React$Component);

    function ShareMenu() {
        (0, _classCallCheck3.default)(this, ShareMenu);
        return (0, _possibleConstructorReturn3.default)(this, (ShareMenu.__proto__ || (0, _getPrototypeOf2.default)(ShareMenu)).apply(this, arguments));
    }

    (0, _createClass3.default)(ShareMenu, [{
        key: 'render',
        value: function render() {
            var menu = this.props.menu;

            return _react2.default.createElement(
                'span',
                { className: 'shareMenu' },
                _react2.default.createElement(
                    'ul',
                    null,
                    menu.map(function (i) {
                        return _react2.default.createElement(
                            'li',
                            { key: i.title },
                            _react2.default.createElement(
                                _reactRouter.Link,
                                { to: '#', onClick: i.onClick, title: i.title },
                                _react2.default.createElement(_Icon2.default, { name: i.icon })
                            )
                        );
                    })
                )
            );
        }
    }]);
    return ShareMenu;
}(_react2.default.Component), _class.propTypes = {
    menu: _propTypes2.default.arrayOf(_propTypes2.default.object).isRequired
}, _temp);
exports.default = ShareMenu;