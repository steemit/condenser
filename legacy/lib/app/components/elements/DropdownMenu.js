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

var _VerticalMenu = require('./VerticalMenu');

var _VerticalMenu2 = _interopRequireDefault(_VerticalMenu);

var _DomUtils = require('app/utils/DomUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DropdownMenu = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(DropdownMenu, _React$Component);

    function DropdownMenu(props) {
        (0, _classCallCheck3.default)(this, DropdownMenu);

        var _this = (0, _possibleConstructorReturn3.default)(this, (DropdownMenu.__proto__ || (0, _getPrototypeOf2.default)(DropdownMenu)).call(this, props));

        _this.toggle = function (e) {
            var shown = _this.state.shown;

            if (shown) _this.hide(e);else _this.show(e);
        };

        _this.show = function (e) {
            e.preventDefault();
            _this.setState({ shown: true });
            document.addEventListener('click', _this.hide);
        };

        _this.hide = function (e) {
            // Do not hide the dropdown if there was a click within it.
            var inside_dropdown = !!(0, _DomUtils.findParent)(e.target, 'VerticalMenu');
            if (inside_dropdown) return;

            e.preventDefault();
            _this.setState({ shown: false });
            document.removeEventListener('click', _this.hide);
        };

        _this.navigate = function (e) {
            var a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
            _this.setState({ show: false });
            if (a.host !== window.location.host) return;
            e.preventDefault();
            _reactRouter.browserHistory.push(a.pathname + a.search);
        };

        _this.getSelectedLabel = function (items, selected) {
            var selectedEntry = items.find(function (i) {
                return i.value === selected;
            });
            var selectedLabel = selectedEntry && selectedEntry.label ? selectedEntry.label : selected;
            return selectedLabel;
        };

        _this.state = {
            shown: false,
            selected: props.selected
        };
        return _this;
    }

    (0, _createClass3.default)(DropdownMenu, [{
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            document.removeEventListener('click', this.hide);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                el = _props.el,
                items = _props.items,
                selected = _props.selected,
                children = _props.children,
                className = _props.className,
                title = _props.title,
                href = _props.href,
                position = _props.position;

            var hasDropdown = items.length > 0;

            var entry = children || _react2.default.createElement(
                'span',
                null,
                this.getSelectedLabel(items, selected),
                hasDropdown && _react2.default.createElement(_Icon2.default, { name: 'dropdown-arrow' })
            );

            if (hasDropdown) entry = _react2.default.createElement(
                'a',
                { key: 'entry', href: href || '#', onClick: this.toggle },
                entry
            );

            var menu = _react2.default.createElement(_VerticalMenu2.default, {
                key: 'menu',
                title: title,
                items: items,
                hideValue: selected
            });
            var cls = 'DropdownMenu' + (this.state.shown ? ' show' : '') + (className ? ' ' + className : '') + (position ? ' ' + position : '');
            return _react2.default.createElement(el, { className: cls }, [entry, menu]);
        }
    }]);
    return DropdownMenu;
}(_react2.default.Component), _class.propTypes = {
    items: _propTypes2.default.arrayOf(_propTypes2.default.object).isRequired,
    selected: _propTypes2.default.string,
    children: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array, _propTypes2.default.element]),
    className: _propTypes2.default.string,
    title: _propTypes2.default.string,
    href: _propTypes2.default.string,
    el: _propTypes2.default.string.isRequired
}, _temp);
exports.default = DropdownMenu;