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

var _reactRouter = require('react-router');

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _DomUtils = require('app/utils/DomUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Dropdown = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Dropdown, _React$Component);

    function Dropdown(props) {
        (0, _classCallCheck3.default)(this, Dropdown);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Dropdown.__proto__ || (0, _getPrototypeOf2.default)(Dropdown)).call(this, props));

        _this.toggle = function (e) {
            var shown = _this.state.shown;

            if (shown) {
                _this.hide(e);
            } else _this.show(e);
        };

        _this.show = function (e) {
            e.preventDefault();
            _this.setState({ shown: true });
            _this.props.onShow();
            document.addEventListener('click', _this.hide);
        };

        _this.hide = function (e) {
            // Do not hide the dropdown if there was a click within it.
            var inside_dropdown = !!(0, _DomUtils.findParent)(e.target, 'dropdown__content');
            if (inside_dropdown) return;
            e.preventDefault();
            _this.setState({ shown: false });
            _this.props.onHide();
            document.removeEventListener('click', _this.hide);
        };

        _this.state = {
            shown: false
        };
        return _this;
    }

    (0, _createClass3.default)(Dropdown, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.show !== this.state.shown) {
                this.setState({ shown: nextProps.show });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            document.removeEventListener('click', this.hide);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                children = _props.children,
                className = _props.className,
                title = _props.title,
                href = _props.href,
                position = _props.position;


            var entry = _react2.default.createElement(
                'a',
                { key: 'entry', href: href || '#', onClick: this.toggle },
                title
            );

            var content = _react2.default.createElement(
                'div',
                { key: 'dropdown-content', className: 'dropdown__content' },
                children
            );
            var cls = 'dropdown' + (this.state.shown ? ' show' : '') + (className ? ' ' + className : '') + (position ? ' ' + position : '');
            return _react2.default.createElement('div', { className: cls, key: 'dropdown' }, [entry, content]);
        }
    }]);
    return Dropdown;
}(_react2.default.Component), _class.propTypes = {
    children: _react2.default.PropTypes.object,
    className: _react2.default.PropTypes.string,
    title: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.object]).isRequired,
    href: _react2.default.PropTypes.string,
    onHide: _react2.default.PropTypes.func,
    onShow: _react2.default.PropTypes.func,
    show: _react2.default.PropTypes.bool
}, _class.defaultProps = {
    onHide: function onHide() {
        return null;
    },
    onShow: function onShow() {
        return null;
    },
    show: false,
    className: 'dropdown-comp',
    href: null
}, _temp);
exports.default = Dropdown;