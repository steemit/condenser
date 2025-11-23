'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var VideoAd = function (_Component) {
    (0, _inherits3.default)(VideoAd, _Component);

    function VideoAd(props) {
        (0, _classCallCheck3.default)(this, VideoAd);

        var _this = (0, _possibleConstructorReturn3.default)(this, (VideoAd.__proto__ || (0, _getPrototypeOf2.default)(VideoAd)).call(this, props));

        var ad_identifier = props.ad_identifier,
            enabled = props.enabled;


        _this.ad_identifier = '';
        _this.enabled = false;

        if (ad_identifier != '') {
            _this.enabled = enabled;
            _this.ad_identifier = ad_identifier;
        }
        return _this;
    }

    (0, _createClass3.default)(VideoAd, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!this.ad_identifier || !this.enabled) return;
            var ad_identifier = this.ad_identifier;
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.ad_identifier || !this.enabled) {
                return _react2.default.createElement('div', { id: 'disabled_video_ad', style: { display: 'none' } });
            }

            return _react2.default.createElement('div', { id: this.ad_identifier });
        }
    }]);
    return VideoAd;
}(_react.Component);

VideoAd.propTypes = {
    ad_identifier: _react.PropTypes.string.isRequired,
    enabled: _react.PropTypes.bool.isRequired
};

VideoAd.defaultProps = {};

exports.default = (0, _reactRedux.connect)(function (state, props) {
    var enabled = !!state.app.getIn(['googleAds', 'videoAdsEnabled']) && !!process.env.BROWSER;

    return (0, _extends3.default)({
        enabled: enabled,
        ad_identifier: props.id
    }, props);
}, function (dispatch) {
    return {};
})(VideoAd);