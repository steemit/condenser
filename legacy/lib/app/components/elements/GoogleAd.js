'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GoogleAd = function (_React$Component) {
    (0, _inherits3.default)(GoogleAd, _React$Component);

    function GoogleAd() {
        (0, _classCallCheck3.default)(this, GoogleAd);
        return (0, _possibleConstructorReturn3.default)(this, (GoogleAd.__proto__ || (0, _getPrototypeOf2.default)(GoogleAd)).apply(this, arguments));
    }

    (0, _createClass3.default)(GoogleAd, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!this.props.shouldSeeAds) {
                return;
            }

            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.props.shouldSeeAds) {
                return null;
            }

            var style = (0, _assign2.default)({
                display: 'inline-block',
                width: '100%'
            }, this.props.style || {});

            var className = ['adsbygoogle'].concat(this.props.env === 'development' ? ['ad-dev'] : []).concat(this.props.name ? [this.props.name] : []).join(' ');

            return _react2.default.createElement('ins', {
                className: className,
                style: style,
                'data-adtest': this.props.test,
                'data-ad-client': this.props.client,
                'data-ad-slot': this.props.slot,
                'data-ad-format': this.props.format || 'auto',
                'data-ad-layout-key': this.props.layoutKey,
                'data-full-width-responsive': this.props.fullWidthResponsive
            });
        }
    }]);
    return GoogleAd;
}(_react2.default.Component);

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var env = state.app.get('env');
    var shouldSeeAds = state.app.getIn(['googleAds', 'enabled']);
    var test = state.app.getIn(['googleAds', 'test']);
    var client = state.app.getIn(['googleAds', 'client']);
    return (0, _extends3.default)({ env: env, shouldSeeAds: shouldSeeAds, test: test, client: client }, ownProps);
})(GoogleAd);