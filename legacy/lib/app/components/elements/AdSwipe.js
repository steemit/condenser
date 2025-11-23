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

var _immutable = require('immutable');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _swiper = require('swiper');

var _swiper2 = _interopRequireDefault(_swiper);

var _ServerApiClient = require('app/utils/ServerApiClient');

require('swiper/swiper.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_swiper2.default.use([_swiper.Autoplay]);

var AdSwipe = function (_Component) {
    (0, _inherits3.default)(AdSwipe, _Component);

    function AdSwipe() {
        (0, _classCallCheck3.default)(this, AdSwipe);

        var _this = (0, _possibleConstructorReturn3.default)(this, (AdSwipe.__proto__ || (0, _getPrototypeOf2.default)(AdSwipe)).call(this));

        _this.setRecordAdsView = _this.setRecordAdsView.bind(_this);
        _this.onMouseOver = _this.onMouseOver.bind(_this);
        _this.onMouseOut = _this.onMouseOut.bind(_this);
        _this.getHeight = _this.getHeight.bind(_this);
        _this.state = {
            hide: true
        };
        _this.heightState;
        _this.swiperInstance;
        return _this;
    }

    (0, _createClass3.default)(AdSwipe, [{
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.initSwiper();
            this.setState({ hide: false });
        }
    }, {
        key: 'initSwiper',
        value: function initSwiper() {
            var _this2 = this;

            var _props = this.props,
                direction = _props.direction,
                timer = _props.timer;

            this.swiperInstance = new _swiper2.default(this.refs.swiperEl, {
                direction: direction,
                speed: 1000,
                autoplay: {
                    delay: timer,
                    disableOnInteraction: false
                },
                spaceBetween: 10,
                loop: true,
                on: {
                    init: function init(e) {
                        if (direction === 'horizontal') return;
                        _this2.setState({
                            heightState: _this2.getHeight(e.$el[0].clientWidth)
                        });
                    },
                    resize: function resize(e) {
                        if (direction === 'horizontal') return;
                        _this2.setState({
                            heightState: _this2.getHeight(e.$el[0].clientWidth)
                        });
                    }
                }
            });
        }
    }, {
        key: 'getHeight',
        value: function getHeight(width) {
            var rate = 864 / 86;
            return (width / rate).toFixed(1);
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
        key: 'onMouseOver',
        value: function onMouseOver() {
            this.swiperInstance.autoplay.stop();
        }
    }, {
        key: 'onMouseOut',
        value: function onMouseOut() {
            this.swiperInstance.autoplay.start();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props,
                width = _props2.width,
                adList = _props2.adList;
            var _state = this.state,
                hide = _state.hide,
                heightState = _state.heightState;

            var swiperWrapperClass = 'swiper-wrapper ' + (hide === true ? 'hide' : '');
            return _react2.default.createElement(
                'div',
                {
                    className: 'ad-carousel swiper-container',
                    ref: 'swiperEl',
                    style: {
                        width: width,
                        height: heightState + 'px'
                    }
                },
                adList.size > 0 && _react2.default.createElement(
                    'div',
                    { className: swiperWrapperClass },
                    adList.map(function (ad, inx) {
                        return ad.get('enable') && _react2.default.createElement(
                            'div',
                            { key: inx, className: 'swiper-slide' },
                            _react2.default.createElement(
                                'a',
                                {
                                    target: '_blank',
                                    href: ad.get('url'),
                                    onClick: function onClick() {
                                        return _this3.setRecordAdsView(ad.get('tag'));
                                    }
                                },
                                _react2.default.createElement('img', {
                                    onMouseOut: _this3.onMouseOut,
                                    onMouseOver: _this3.onMouseOver,
                                    src: ad.get('img'),
                                    style: {
                                        width: width,
                                        height: heightState + 'px'
                                    }
                                })
                            )
                        );
                    })
                )
            );
        }
    }]);
    return AdSwipe;
}(_react.Component);

AdSwipe.defaultProps = {
    trackingId: '',
    width: '100%',
    height: 'auto',
    adList: (0, _immutable.List)(),
    timer: 5000,
    direction: 'horizontal' // Could be 'horizontal' or 'vertical'
};

AdSwipe.propTypes = {
    trackingId: _propTypes2.default.string.isRequired,
    adList: _propTypes2.default.instanceOf(_immutable.List).isRequired,
    width: _propTypes2.default.string,
    height: _propTypes2.default.string,
    timer: _propTypes2.default.number.isRequired,
    direction: _propTypes2.default.string.isRequired
};

exports.default = (0, _reactRedux.connect)(function (state, props) {
    return {};
}, function (dispatch) {
    return {};
})(AdSwipe);