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

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BiddingAd = function (_Component) {
    (0, _inherits3.default)(BiddingAd, _Component);
    (0, _createClass3.default)(BiddingAd, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (!this.ad.path || !this.enabled) return;

            googletag.cmd.push(function () {
                var slot = googletag.defineSlot(_this2.ad.path, _this2.ad.dimensions, _this2.ad.path);

                if (slot) {
                    slot.addService(googletag.pubads());
                    googletag.pubads().enableSingleRequest();
                    googletag.enableServices();

                    googletag.cmd.push(function () {
                        googletag.display(_this2.ad.path);
                        _this2.refreshBid(_this2.ad.path, slot);

                        googletag.pubads().addEventListener('impressionViewable', function (e) {
                            window.dispatchEvent(new Event('gptadshown', e));
                        });

                        googletag.pubads().addEventListener('slotRenderEnded', function (e) {
                            window.dispatchEvent(new Event('gptadshown', e));
                        });
                    });
                }
            });
        }
    }, {
        key: 'refreshBid',
        value: function refreshBid(path, slot) {
            pbjs.que.push(function () {
                pbjs.requestBids({
                    timeout: 2000,
                    adUnitCodes: [path],
                    bidsBackHandler: function bidsBackHandler() {
                        pbjs.setTargetingForGPTAsync([path]);
                        googletag.pubads().refresh([slot]);
                    }
                });
            });
        }
    }]);

    function BiddingAd(props) {
        (0, _classCallCheck3.default)(this, BiddingAd);

        var _this = (0, _possibleConstructorReturn3.default)(this, (BiddingAd.__proto__ || (0, _getPrototypeOf2.default)(BiddingAd)).call(this, props));

        var ad = props.ad,
            enabled = props.enabled,
            type = props.type;


        _this.ad = {};
        _this.type = type;
        _this.enabled = false;

        if (ad) {
            // console.info(
            //     `Slot named '${props.slotName}' will render with given data:`,
            //     ad
            // );
            _this.enabled = enabled;
            _this.ad = ad.toJS();
        } else {
            // console.info(
            //     `Slot named '${
            //         props.slotName
            //     }' will be disabled because we were unable to find the ad details.`
            // );
        }
        return _this;
    }

    (0, _createClass3.default)(BiddingAd, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement('div', {
                className: 'bidding-ad gpt-ad',
                style: { width: '100%' },
                id: this.ad.path
            });
        }
    }]);
    return BiddingAd;
}(_react.Component);

BiddingAd.propTypes = {
    ad: _react.PropTypes.shape({
        path: _react.PropTypes.string,
        dimensions: _react.PropTypes.array
    }).isRequired,
    enabled: _react.PropTypes.bool.isRequired,
    type: _react.PropTypes.oneOf(['Bidding', 'Category', 'Basic'])
};

exports.default = (0, _reactRedux.connect)(function (state, props) {
    var enabled = !!state.app.getIn(['googleAds', 'gptEnabled']) && !!process.env.BROWSER && !!window.googletag;
    var postCategory = state.global.get('postCategory');
    var basicSlots = state.app.getIn(['googleAds', 'gptBasicSlots']);
    var biddingSlots = state.app.getIn(['googleAds', 'gptBiddingSlots']);
    var categorySlots = state.app.getIn(['googleAds', 'gptCategorySlots']);

    var slotName = props.slotName;
    var type = props.type;
    var slot = state.app.getIn(['googleAds', 'gpt' + type + 'Slots', slotName]);

    return (0, _extends3.default)({
        enabled: enabled,
        ad: slot
    }, props);
}, function (dispatch) {
    return {};
})(BiddingAd);