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

var _class, _temp; /* eslint react/prop-types: 0 */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

var _SidebarLinks = require('app/components/elements/SidebarLinks');

var _SidebarLinks2 = _interopRequireDefault(_SidebarLinks);

var _SidebarNewUsers = require('app/components/elements/SidebarNewUsers');

var _SidebarNewUsers2 = _interopRequireDefault(_SidebarNewUsers);

var _Notices = require('app/components/elements/Notices');

var _Notices2 = _interopRequireDefault(_Notices);

var _SteemMarket = require('app/components/elements/SteemMarket');

var _SteemMarket2 = _interopRequireDefault(_SteemMarket);

var _CommunityPane = require('app/components/elements/CommunityPane');

var _CommunityPane2 = _interopRequireDefault(_CommunityPane);

var _CommunityPaneMobile = require('app/components/elements/CommunityPaneMobile');

var _CommunityPaneMobile2 = _interopRequireDefault(_CommunityPaneMobile);

var _AdSwipe = require('app/components/elements/AdSwipe');

var _AdSwipe2 = _interopRequireDefault(_AdSwipe);

var _TronAd = require('app/components/elements/TronAd');

var _TronAd2 = _interopRequireDefault(_TronAd);

var _PrimaryNavigation = require('app/components/cards/PrimaryNavigation');

var _PrimaryNavigation2 = _interopRequireDefault(_PrimaryNavigation);

var _Announcement = require('./Announcement');

var _Announcement2 = _interopRequireDefault(_Announcement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PostsIndexLayout = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(PostsIndexLayout, _React$Component);

    function PostsIndexLayout() {
        (0, _classCallCheck3.default)(this, PostsIndexLayout);
        return (0, _possibleConstructorReturn3.default)(this, (PostsIndexLayout.__proto__ || (0, _getPrototypeOf2.default)(PostsIndexLayout)).apply(this, arguments));
    }

    (0, _createClass3.default)(PostsIndexLayout, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                topics = _props.topics,
                enableAds = _props.enableAds,
                community = _props.community,
                username = _props.username,
                blogmode = _props.blogmode,
                isBrowser = _props.isBrowser,
                children = _props.children,
                category = _props.category,
                indexLeftSideAdList = _props.indexLeftSideAdList,
                trackingId = _props.trackingId,
                adSwipeConf = _props.adSwipeConf,
                tronAdsConf = _props.tronAdsConf,
                locale = _props.locale,
                routeTag = _props.routeTag;

            var adSwipeEnabled = adSwipeConf.getIn(['enabled']);
            var tronAdsEnabled = tronAdsConf.getIn(['enabled']);
            var tronAdSidebyPid = tronAdsConf.getIn(['sidebar_ad_pid']);
            var tronAdsEnv = tronAdsConf.getIn(['env']);
            var tronAdsMock = tronAdsConf.getIn(['is_mock']);

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    {
                        className: 'PostsIndex row ' + (blogmode ? 'layout-block' : 'layout-list')
                    },
                    _react2.default.createElement(
                        'article',
                        { className: 'articles' },
                        community && _react2.default.createElement(
                            'span',
                            { className: 'hide-for-mq-large articles__header-select' },
                            _react2.default.createElement(_CommunityPaneMobile2.default, {
                                community: community,
                                username: username
                            })
                        ),
                        children
                    ),
                    _react2.default.createElement(
                        'aside',
                        { className: 'c-sidebar c-sidebar--right' },
                        community && _react2.default.createElement(_CommunityPane2.default, {
                            community: community,
                            username: username
                        }),
                        isBrowser && !community && !username && _react2.default.createElement(_SidebarNewUsers2.default, null),
                        isBrowser && !community && username && _react2.default.createElement(_Announcement2.default, null),
                        isBrowser && !community && username && _react2.default.createElement(_SidebarLinks2.default, {
                            username: username,
                            topics: topics
                        }),
                        false && !community && _react2.default.createElement(_Notices2.default, null),
                        _react2.default.createElement(_SteemMarket2.default, {
                            page: '' + (category ? 'CoinMarketPlaceCommunity' : 'CoinMarketPlaceIndex')
                        }),
                        adSwipeEnabled && _react2.default.createElement(_AdSwipe2.default, {
                            adList: indexLeftSideAdList,
                            trackingId: trackingId,
                            timer: 5000,
                            direction: 'horizontal'
                        }),
                        tronAdsEnabled && _react2.default.createElement(_TronAd2.default, {
                            env: tronAdsEnv,
                            trackingId: trackingId,
                            wrapperName: 'tron_ad_sideby',
                            pid: tronAdSidebyPid,
                            isMock: tronAdsMock,
                            lang: locale,
                            adTag: 'tron_ad_sideby',
                            ratioClass: 'ratio-1-1'
                        })
                    ),
                    _react2.default.createElement(
                        'aside',
                        { className: 'c-sidebar c-sidebar--left' },
                        _react2.default.createElement(_PrimaryNavigation2.default, {
                            routeTag: routeTag.routeTag,
                            category: category
                        })
                    )
                )
            );
        }
    }]);
    return PostsIndexLayout;
}(_react2.default.Component), _class.propTypes = {
    username: _propTypes2.default.string,
    blogmode: _propTypes2.default.bool,
    topics: _propTypes2.default.object
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    var username = state.user.getIn(['current', 'username']) || state.offchain.get('account');
    var adSwipeConf = state.app.getIn(['adSwipe']);
    var tronAdsConf = state.app.getIn(['tronAds']);
    var locale = state.app.getIn(['user_preferences', 'locale']);
    var trackingId = state.app.getIn(['trackingId'], null);
    var indexLeftSideAdList = state.ad.getIn(['indexLeftSideAdList'], (0, _immutable.List)());
    var routeTag = state.app.has('routeTag') ? state.app.get('routeTag') : null;
    return {
        blogmode: props.blogmode,
        enableAds: props.enableAds,
        community: state.global.getIn(['community', props.category], null),
        topics: state.global.getIn(['topics'], (0, _immutable.List)()),
        isBrowser: process.env.BROWSER,
        username: username,
        adSwipeConf: adSwipeConf,
        tronAdsConf: tronAdsConf,
        locale: locale,
        trackingId: trackingId,
        indexLeftSideAdList: indexLeftSideAdList,
        routeTag: routeTag
    };
})(PostsIndexLayout);