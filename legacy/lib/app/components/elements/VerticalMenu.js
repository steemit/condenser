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

var _class, _temp2; /* eslint-disable react/no-danger */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require('react-router');

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VerticalMenu = (_temp2 = _class = function (_React$Component) {
    (0, _inherits3.default)(VerticalMenu, _React$Component);

    function VerticalMenu() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, VerticalMenu);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = VerticalMenu.__proto__ || (0, _getPrototypeOf2.default)(VerticalMenu)).call.apply(_ref, [this].concat(args))), _this), _this.closeMenu = function (e) {
            // If this was not a left click, or if CTRL or CMD were held, do not close the menu.
            if (e.button !== 0 || e.ctrlKey || e.metaKey) return;

            // Simulate clicking of document body which will close any open menus
            document.body.click();
        }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    (0, _createClass3.default)(VerticalMenu, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                items = _props.items,
                title = _props.title,
                hideValue = _props.hideValue;

            return _react2.default.createElement(
                'ul',
                { className: 'VerticalMenu menu vertical' },
                title && _react2.default.createElement(
                    'li',
                    { className: 'title' },
                    title
                ),
                items.map(function (i, idx) {
                    if (i.value === hideValue) return null;
                    return _react2.default.createElement(
                        'li',
                        { key: idx, onClick: _this2.closeMenu },
                        i.link ? i.link.match(/^http(s?)/) ? _react2.default.createElement(
                            'a',
                            { href: i.link, target: '_blank' },
                            i.icon && _react2.default.createElement(_Icon2.default, { name: i.icon }),
                            i.label ? i.label : i.value
                        ) : _react2.default.createElement(
                            _reactRouter.Link,
                            { to: i.link, onClick: i.onClick },
                            i.icon && _react2.default.createElement(_Icon2.default, { name: i.icon }),
                            i.label ? i.label : i.value
                        ) : _react2.default.createElement(
                            'span',
                            null,
                            i.icon && _react2.default.createElement(_Icon2.default, { name: i.icon }),
                            i.label ? i.label : i.raw ? _react2.default.createElement('span', {
                                dangerouslySetInnerHTML: {
                                    __html: i.value
                                }
                            }) : i.value
                        )
                    );
                })
            );
        }
    }]);
    return VerticalMenu;
}(_react2.default.Component), _class.propTypes = {
    items: _propTypes2.default.arrayOf(_propTypes2.default.object).isRequired,
    title: _propTypes2.default.string,
    hideValue: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.element])
}, _temp2);
exports.default = VerticalMenu;