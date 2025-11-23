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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Links = require('app/utils/Links');

var _Links2 = _interopRequireDefault(_Links);

var _reactRouter = require('react-router');

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Link = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Link, _React$Component);

    function Link(props) {
        (0, _classCallCheck3.default)(this, Link);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Link.__proto__ || (0, _getPrototypeOf2.default)(Link)).call(this));

        var href = props.href;

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'Link');
        _this.localLink = href && _Links2.default.local.test(href);
        _this.onLocalClick = function (e) {
            e.preventDefault();
            _reactRouter.browserHistory.push(_this.props.href);
        };
        return _this;
    }

    (0, _createClass3.default)(Link, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                href = _props.href,
                children = _props.children,
                onLocalClick = this.onLocalClick;

            if (this.localLink) return _react2.default.createElement(
                'a',
                { onClick: onLocalClick },
                children
            );
            return _react2.default.createElement(
                'a',
                { target: '_blank', rel: 'noopener', href: href },
                children
            );
        }
    }]);
    return Link;
}(_react2.default.Component), _class.propTypes = {
    // HTML properties
    href: _propTypes2.default.string
}, _temp);
exports.default = Link;