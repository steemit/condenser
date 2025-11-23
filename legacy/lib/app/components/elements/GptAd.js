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

var GptAd = function (_Component) {
    (0, _inherits3.default)(GptAd, _Component);

    function GptAd(props) {
        (0, _classCallCheck3.default)(this, GptAd);

        var _this = (0, _possibleConstructorReturn3.default)(this, (GptAd.__proto__ || (0, _getPrototypeOf2.default)(GptAd)).call(this, props));

        var ad_identifier = props.ad_identifier,
            enabled = props.enabled,
            type = props.type,
            tags = props.tags,
            bannedTags = props.bannedTags;


        _this.ad_identifier = '';
        _this.type = type;
        _this.enabled = false;
        _this.tags = tags;
        _this.bannedTags = bannedTags;

        if (ad_identifier != '') {
            // console.info(
            //     `ad_identifier of '${ad_identifier}' will render.`,
            //     ad_identifier
            // );
            _this.enabled = enabled;
            _this.ad_identifier = ad_identifier;
        } else {
            // console.info(
            //     `Slot named '${
            //         props.slotName
            //     }' will be disabled because we were unable to find the ad details.`
            // );
        }
        _this.unique_slot_id = _this.ad_identifier + '_' + Date.now();
        return _this;
    }

    (0, _createClass3.default)(GptAd, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!this.ad_identifier || !this.enabled) return;
            var ad_identifier = this.ad_identifier;
            var unique_slot_id = this.unique_slot_id;

            window.optimize.queue.push(function () {
                window.optimize.push(unique_slot_id);

                googletag.pubads().addEventListener('impressionViewable', function (e) {
                    window.dispatchEvent(new Event('gptadshown', e));
                });

                googletag.pubads().addEventListener('slotRenderEnded', function (e) {
                    window.dispatchEvent(new Event('gptadshown', e));
                });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.ad_identifier || !this.enabled) {
                return _react2.default.createElement('div', { id: 'disabled_ad', style: { display: 'none' } });
            }

            return _react2.default.createElement('div', {
                className: 'gpt-ad',
                style: { width: '100%' },
                id: this.unique_slot_id
            });
        }
    }]);
    return GptAd;
}(_react.Component);

GptAd.propTypes = {
    ad_identifier: _react.PropTypes.string.isRequired,
    enabled: _react.PropTypes.bool.isRequired,
    type: _react.PropTypes.oneOf(['Bidding', 'Category', 'Basic', 'Freestar']),
    tags: _react.PropTypes.arrayOf(_react.PropTypes.string),
    bannedTags: _react.PropTypes.arrayOf(_react.PropTypes.string)
};

GptAd.defaultProps = {
    type: 'Freestar',
    tags: [],
    bannedTags: []
};

exports.default = (0, _reactRedux.connect)(function (state, props) {
    var enabled = !!state.app.getIn(['googleAds', 'gptEnabled']) && !!process.env.BROWSER;
    var postCategory = state.global.get('postCategory');
    var basicSlots = state.app.getIn(['googleAds', 'gptBasicSlots']);
    var biddingSlots = state.app.getIn(['googleAds', 'gptBiddingSlots']);
    var categorySlots = state.app.getIn(['googleAds', 'gptCategorySlots']);
    var bannedTags = state.app.getIn(['googleAds', 'gptBannedTags']);
    var bannedTagsJS = bannedTags ? bannedTags.toJS() : [];

    var slotName = props.slotName;
    if (!slotName) {
        slotName = props.id;
    }
    var type = props.type;
    var slot = slotName; // in case it's Freestar
    if (type != 'Freestar') {
        slot = state.app.getIn(['googleAds', 'gpt' + type + 'Slots', slotName]);
    }

    return (0, _extends3.default)({
        enabled: enabled,
        ad: slot, //TODO: Clean this up. This is from old GPT/Coinzilla stuffs
        ad_identifier: slotName,
        bannedTagsJS: bannedTagsJS
    }, props);
}, function (dispatch) {
    return {};
})(GptAd);