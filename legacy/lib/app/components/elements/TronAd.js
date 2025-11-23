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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _ServerApiClient = require('app/utils/ServerApiClient');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TronAd = function (_Component) {
    (0, _inherits3.default)(TronAd, _Component);

    function TronAd() {
        (0, _classCallCheck3.default)(this, TronAd);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TronAd.__proto__ || (0, _getPrototypeOf2.default)(TronAd)).call(this));

        _this.setRecordAdsView = _this.setRecordAdsView.bind(_this);
        _this.caculateHeight = _this.caculateHeight.bind(_this);
        _this.handleResize = _this.handleResize.bind(_this);
        _this.getLang = _this.getLang.bind(_this);
        _this.isInit = _this.isInit.bind(_this);
        _this.hasInit = false;
        _this.state = {
            heightState: 0
        };
        return _this;
    }

    (0, _createClass3.default)(TronAd, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.isInit()) {
                this.initAd();
            }
            window.addEventListener('resize', this.handleResize);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.handleResize);
        }
    }, {
        key: 'initAd',
        value: function initAd() {
            var _this2 = this;

            if (this.hasInit) return;
            var _props = this.props,
                wrapperName = _props.wrapperName,
                pid = _props.pid,
                isMock = _props.isMock,
                lang = _props.lang,
                ratioClass = _props.ratioClass,
                trackingId = _props.trackingId,
                env = _props.env;


            new initAds({
                env: env,
                wrapper: wrapperName,
                pid: pid,
                is_mock: isMock,
                lang: this.getLang(lang),
                expand: {
                    uuid: trackingId
                },
                loadSuccessCallback: function loadSuccessCallback() {
                    _this2.hasInit = true;
                    _this2.setState({
                        heightState: _this2.caculateHeight(_this2.refs[pid].clientWidth, ratioClass)
                    });
                    console.log('load tron ad success cb.', pid);
                },
                loadFailCallback: function loadFailCallback(err) {
                    console.error('load tron ad fail cb:', err);
                },
                clickEventCallback: function clickEventCallback() {
                    _this2.setRecordAdsView(_this2.props.adTag);
                }
            });
        }
    }, {
        key: 'setRecordAdsView',
        value: function setRecordAdsView(tag) {
            (0, _ServerApiClient.recordAdsView)({
                trackingId: this.props.trackingId,
                adTag: tag
            });
        }
    }, {
        key: 'caculateHeight',
        value: function caculateHeight(width, ratioClass) {
            var ratio = 1;
            switch (ratioClass) {
                case 'ratio-1-1':
                    ratio = 1;
                    break;
                case 'ratio-10-1':
                    ratio = 10;
                    break;
                case 'ratio-375-80':
                    ratio = 375 / 80;
                    break;
            }
            return Math.floor(width / ratio);
        }

        /**
         * This method is to charge whether to init ad position.
         * Each ad position only inits once.
         * And we will control the box visiable in Ad.scss by media query.
         * @returns bool
         */

    }, {
        key: 'isInit',
        value: function isInit() {
            var ratioClass = this.props.ratioClass;
            // refer to Ad.scss

            var TRON_AD_DEVICE_WIDTH_THRESHOLD = 760;
            var isInit = true;
            switch (ratioClass) {
                case 'ratio-10-1':
                case 'ratio-1-1':
                    isInit = window.innerWidth >= TRON_AD_DEVICE_WIDTH_THRESHOLD;
                    break;
                case 'ratio-375-80':
                    isInit = window.innerWidth < TRON_AD_DEVICE_WIDTH_THRESHOLD;
                    break;
            }
            return isInit;
        }
    }, {
        key: 'handleResize',
        value: function handleResize() {
            if (this.hasInit == false) {
                return this.initAd();
            }
            var _props2 = this.props,
                pid = _props2.pid,
                ratioClass = _props2.ratioClass;

            if (this.refs[pid]) {
                this.setState({
                    heightState: this.caculateHeight(this.refs[pid].clientWidth, ratioClass)
                });
            }
        }
    }, {
        key: 'getLang',
        value: function getLang(lang) {
            var finalLang = void 0;
            // const supportLang = [
            //     'en','zh_Hant','cn','ja','ko','ar','ru','es','tr',
            // ];
            switch (lang) {
                case undefined:
                case '':
                case 'fr':
                case 'it':
                case 'pl':
                    finalLang = 'en';
                    break;
                case 'zh':
                    finalLang = 'cn';
                    break;
                default:
                    finalLang = lang;
            }
            return finalLang;
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                wrapperName = _props3.wrapperName,
                ratioClass = _props3.ratioClass,
                pid = _props3.pid;
            var heightState = this.state.heightState;

            var classSetting = 'ad-ratio-wrapper ' + ratioClass;

            return _react2.default.createElement(
                'div',
                { className: 'tron-ad-box' },
                _react2.default.createElement('div', {
                    ref: pid,
                    id: wrapperName,
                    className: classSetting,
                    style: {
                        height: heightState + 'px'
                    }
                })
            );
        }
    }]);
    return TronAd;
}(_react.Component);

TronAd.propTypes = {
    env: _propTypes2.default.number.isRequired,
    trackingId: _propTypes2.default.string.isRequired,
    wrapperName: _propTypes2.default.string.isRequired,
    pid: _propTypes2.default.string.isRequired,
    isMock: _propTypes2.default.number.isRequired,
    adTag: _propTypes2.default.string.isRequired,
    ratioClass: _propTypes2.default.string.isRequired,
    lang: _propTypes2.default.string
};

exports.default = (0, _reactRedux.connect)(function (state, props) {
    return {};
}, function (dispatch) {
    return {};
})(TronAd);