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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Comment = require('app/components/cards/Comment');

var _Comment2 = _interopRequireDefault(_Comment);

var _PostFull = require('app/components/cards/PostFull');

var _PostFull2 = _interopRequireDefault(_PostFull);

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

var _StateFunctions = require('app/utils/StateFunctions');

var _DropdownMenu = require('app/components/elements/DropdownMenu');

var _DropdownMenu2 = _interopRequireDefault(_DropdownMenu);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _ServerApiClient = require('app/utils/ServerApiClient');

var _constants = require('shared/constants');

var _UserUtil = require('app/utils/UserUtil');

var _SteemMarket = require('app/components/elements/SteemMarket');

var _SteemMarket2 = _interopRequireDefault(_SteemMarket);

var _SidebarLinks = require('app/components/elements/SidebarLinks');

var _SidebarLinks2 = _interopRequireDefault(_SidebarLinks);

var _SidebarNewUsers = require('app/components/elements/SidebarNewUsers');

var _SidebarNewUsers2 = _interopRequireDefault(_SidebarNewUsers);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _AdSwipe = require('app/components/elements/AdSwipe');

var _AdSwipe2 = _interopRequireDefault(_AdSwipe);

var _TronAd = require('app/components/elements/TronAd');

var _TronAd2 = _interopRequireDefault(_TronAd);

var _PrimaryNavigation = require('app/components/cards/PrimaryNavigation');

var _PrimaryNavigation2 = _interopRequireDefault(_PrimaryNavigation);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _Announcement = require('./Announcement');

var _Announcement2 = _interopRequireDefault(_Announcement);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isEmptyPost(post) {
    // check if the post doesn't exist
    // !dis may be enough but keep 'created' & 'body' test for potential compat
    return !post || post.get('created') === '1970-01-01T00:00:00' && post.get('body') === '';
}

var Post = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Post, _React$Component);

    function Post() {
        (0, _classCallCheck3.default)(this, Post);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (Post.__proto__ || (0, _getPrototypeOf2.default)(Post)).call(this));

        _this2.toggleNegativeReplies = function (e) {
            _this2.setState({
                showNegativeComments: !_this2.state.showNegativeComments
            });
            e.preventDefault();
        };

        _this2.onHideComment = function () {
            _this2.setState({ commentHidden: true });
        };

        _this2.showAnywayClick = function () {
            _this2.setState({ showAnyway: true });
        };

        _this2.showPostCommentClick = function () {
            _this2.setState({ showPostComments: false });
        };

        _this2.state = {
            showNegativeComments: false,
            timeOut: false,
            showPostComments: true
        };
        _this2.showSignUp = function () {
            (0, _ServerApiClient.serverApiRecordEvent)('SignUp', 'Post Promo');
            window.location = _constants.SIGNUP_URL;
        };
        return _this2;
    }

    (0, _createClass3.default)(Post, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var dis = this.props.dis;

            this.props.setRouteTag(dis.get('url'));
            this.setState({
                showPostComments: true
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;
            setTimeout(function () {
                if (_this.props.dis === undefined) {
                    _this.setState({
                        timeOut: true,
                        showPostComments: true
                    });
                }
            }, 2000);
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps) {
            var dis = nextProps.dis;

            if (dis.get('url') !== this.props.dis.get('url')) {
                this.props.setRouteTag(dis.get('url'));
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.setState({
                timeOut: false
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var showSignUp = this.showSignUp;
            var _props = this.props,
                content = _props.content,
                sortOrder = _props.sortOrder,
                post = _props.post,
                dis = _props.dis,
                steemMarketData = _props.steemMarketData,
                isBrowser = _props.isBrowser,
                uname = _props.uname,
                topics = _props.topics,
                trackingId = _props.trackingId,
                postLeftSideAdList = _props.postLeftSideAdList,
                bottomAdList = _props.bottomAdList,
                adSwipeConf = _props.adSwipeConf,
                tronAdsConf = _props.tronAdsConf,
                locale = _props.locale;
            var _state = this.state,
                showNegativeComments = _state.showNegativeComments,
                commentHidden = _state.commentHidden,
                showPostComments = _state.showPostComments,
                showAnyway = _state.showAnyway,
                timeOut = _state.timeOut;


            var adSwipeEnabled = adSwipeConf.getIn(['enabled']);
            var tronAdsEnabled = tronAdsConf.getIn(['enabled']);
            var tronAdSidebyPid = tronAdsConf.getIn(['sidebar_ad_pid']);
            var tronAdPcPid = tronAdsConf.getIn(['content_pc_ad_pid']);
            var tronAdMobilePid = tronAdsConf.getIn(['content_mobile_ad_pid']);
            var tronAdsEnv = tronAdsConf.getIn(['env']);
            var tronAdsMock = tronAdsConf.getIn(['is_mock']);

            if (dis === undefined && !timeOut) {
                return null;
            }

            if (isEmptyPost(dis) || timeOut) return _react2.default.createElement(
                'div',
                { className: 'NotFound float-center' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_Icon2.default, { name: 'steem', size: '4x' }),
                    _react2.default.createElement(
                        'h4',
                        { className: 'NotFound__header' },
                        'Sorry! This page doesnt exist.'
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        'Not to worry. You can head back to',
                        ' ',
                        _react2.default.createElement(
                            'a',
                            { style: { fontWeight: 800 }, href: '/' },
                            'our homepage'
                        ),
                        ', or check out some great posts.'
                    ),
                    _react2.default.createElement(
                        'ul',
                        { className: 'NotFound__menu' },
                        _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                'a',
                                { href: '/trending' },
                                'trending posts'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                'a',
                                { href: '/hot' },
                                'hot posts'
                            )
                        )
                    )
                )
            );

            var gptTags = (0, _StateFunctions.parseJsonTags)(dis);

            // A post should be hidden if it is not special, is not told to "show
            // anyway", and is designated "gray".
            var postBody = void 0;
            var special = dis.get('special');
            if (!special && !showAnyway && dis.getIn(['stats', 'gray'], false)) {
                postBody = _react2.default.createElement(
                    'div',
                    { className: 'Post' },
                    _react2.default.createElement(
                        'div',
                        { className: 'row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'column' },
                            _react2.default.createElement(
                                'div',
                                { className: 'PostFull' },
                                _react2.default.createElement(
                                    'p',
                                    { onClick: this.showAnywayClick },
                                    (0, _counterpart2.default)('promote_post_jsx.this_post_was_hidden_due_to_low_ratings'),
                                    '.',
                                    ' ',
                                    _react2.default.createElement(
                                        'button',
                                        {
                                            style: { marginBottom: 0 },
                                            className: 'button hollow tiny float-right',
                                            onClick: this.showAnywayClick
                                        },
                                        (0, _counterpart2.default)('g.show')
                                    )
                                )
                            )
                        )
                    )
                );
            } else {
                postBody = _react2.default.createElement(_PostFull2.default, { post: post, cont: content });
            }

            var replies = dis.get('replies').toJS();

            (0, _Comment.sortComments)(content, replies, sortOrder);

            // Don't render too many comments on server-side
            var commentLimit = 100;
            var commentDefault = 10;

            // if (global.process !== undefined && replies.length > commentLimit) {
            //     replies = replies.slice(0, commentLimit);
            // }

            if (replies.length > 0 && showPostComments) {
                replies = replies.slice(0, commentDefault);
            }

            var commentCount = 0;
            var positiveComments = replies.map(function (reply) {
                commentCount++;

                var showAd = commentCount % 5 === 0 && commentCount !== replies.length && commentCount !== commentLimit;
                var author = reply && reply.split('/')[0];
                return _react2.default.createElement(
                    'div',
                    { key: post + reply },
                    _react2.default.createElement(_Comment2.default, {
                        postref: reply,
                        cont: content,
                        sort_order: sortOrder,
                        showNegativeComments: showNegativeComments,
                        onHide: _this3.onHideComment
                    })
                );
            });

            var negativeGroup = commentHidden && _react2.default.createElement(
                'div',
                { className: 'hentry Comment root Comment__negative_group' },
                _react2.default.createElement(
                    'p',
                    null,
                    showNegativeComments ? (0, _counterpart2.default)('post_jsx.now_showing_comments_with_low_ratings') : (0, _counterpart2.default)('post_jsx.comments_were_hidden_due_to_low_ratings'),
                    '.',
                    ' ',
                    _react2.default.createElement(
                        'button',
                        {
                            className: 'button hollow tiny float-right',
                            onClick: function onClick(e) {
                                return _this3.toggleNegativeReplies(e);
                            }
                        },
                        showNegativeComments ? (0, _counterpart2.default)('g.hide') : (0, _counterpart2.default)('g.show')
                    )
                )
            );

            var sort_orders = ['trending', 'votes', 'new'];
            var sort_labels = [(0, _counterpart2.default)('post_jsx.comment_sort_order.trending'), (0, _counterpart2.default)('post_jsx.comment_sort_order.votes'), (0, _counterpart2.default)('post_jsx.comment_sort_order.age')];
            var sort_menu = [];
            var sort_label = void 0;
            var selflink = '/' + dis.get('category') + '/@' + post;
            for (var o = 0; o < sort_orders.length; ++o) {
                if (sort_orders[o] == sortOrder) sort_label = sort_labels[o];
                sort_menu.push({
                    value: sort_orders[o],
                    label: sort_labels[o],
                    link: selflink + '?sort=' + sort_orders[o] + '#comments'
                });
            }

            return _react2.default.createElement(
                'div',
                { className: 'Post' },
                _react2.default.createElement(
                    'div',
                    { className: 'post-content' },
                    _react2.default.createElement(
                        'div',
                        { className: 'c-sidebr-ads' },
                        _react2.default.createElement(_PrimaryNavigation2.default, {
                            routeTag: 'post',
                            category: selflink
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'post-main' },
                        _react2.default.createElement(
                            'div',
                            { className: 'row' },
                            _react2.default.createElement(
                                'div',
                                { className: 'column' },
                                postBody
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'row' },
                            adSwipeEnabled && _react2.default.createElement(
                                'div',
                                { className: 'column' },
                                _react2.default.createElement(
                                    'div',
                                    {
                                        style: {
                                            margin: '0.5rem auto 0',
                                            maxWidth: '54rem'
                                        }
                                    },
                                    _react2.default.createElement(_AdSwipe2.default, {
                                        adList: bottomAdList,
                                        trackingId: trackingId,
                                        timer: 5000,
                                        direction: 'vertical'
                                    })
                                )
                            ),
                            tronAdsEnabled && _react2.default.createElement(
                                'div',
                                { className: 'column' },
                                _react2.default.createElement(
                                    'div',
                                    {
                                        style: {
                                            margin: '0.5rem auto 0',
                                            maxWidth: '54rem'
                                        }
                                    },
                                    _react2.default.createElement(_TronAd2.default, {
                                        env: tronAdsEnv,
                                        trackingId: trackingId,
                                        wrapperName: 'tron_ad_pc',
                                        pid: tronAdPcPid,
                                        isMock: tronAdsMock,
                                        lang: locale,
                                        adTag: 'tron_ad_pc',
                                        ratioClass: 'ratio-10-1'
                                    }),
                                    _react2.default.createElement(_TronAd2.default, {
                                        env: tronAdsEnv,
                                        trackingId: trackingId,
                                        wrapperName: 'tron_ad_mobile',
                                        pid: tronAdMobilePid,
                                        isMock: tronAdsMock,
                                        lang: locale,
                                        adTag: 'tron_ad_mobile',
                                        ratioClass: 'ratio-375-80'
                                    })
                                )
                            )
                        ),
                        false && !(0, _UserUtil.isLoggedIn)() && _react2.default.createElement(
                            'div',
                            { className: 'row' },
                            _react2.default.createElement(
                                'div',
                                { className: 'column' },
                                _react2.default.createElement(
                                    'div',
                                    { className: 'Post__promo' },
                                    (0, _counterpart2.default)('g.next_7_strings_single_block.authors_get_paid_when_people_like_you_upvote_their_post'),
                                    '.',
                                    _react2.default.createElement('br', null),
                                    (0, _counterpart2.default)('g.next_7_strings_single_block.if_you_enjoyed_what_you_read_earn_amount'),
                                    _react2.default.createElement('br', null),
                                    _react2.default.createElement(
                                        'button',
                                        {
                                            type: 'button',
                                            className: 'button e-btn',
                                            onClick: showSignUp
                                        },
                                        (0, _counterpart2.default)('loginform_jsx.sign_up_get_steem')
                                    )
                                )
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { id: '#comments', className: 'Post_comments row hfeed' },
                            _react2.default.createElement(
                                'div',
                                { className: 'column large-12' },
                                _react2.default.createElement(
                                    'div',
                                    { className: 'Post_comments__content' },
                                    positiveComments.length > 0 ? _react2.default.createElement(
                                        'div',
                                        { className: 'Post__comments_sort_order float-right' },
                                        (0, _counterpart2.default)('post_jsx.sort_order'),
                                        ': \xA0',
                                        _react2.default.createElement(_DropdownMenu2.default, {
                                            items: sort_menu,
                                            el: 'li',
                                            selected: sort_label,
                                            position: 'left'
                                        })
                                    ) : null,
                                    positiveComments.length > 0 ? positiveComments : null,
                                    positiveComments.length > 0 && positiveComments.length === commentDefault && commentDefault < dis.get('children') && showPostComments ? _react2.default.createElement(
                                        'div',
                                        { className: 'hentry Comment root Post_comments__count' },
                                        _react2.default.createElement(
                                            'button',
                                            {
                                                className: 'comment-button',
                                                onClick: this.showPostCommentClick
                                            },
                                            'LOAD MORE COMMENTS'
                                        )
                                    ) : null,
                                    negativeGroup
                                )
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'c-sidebr-market' },
                        isBrowser && !uname && _react2.default.createElement(_SidebarNewUsers2.default, null),
                        isBrowser && _react2.default.createElement(_Announcement2.default, null),
                        isBrowser && uname && _react2.default.createElement(_SidebarLinks2.default, {
                            username: uname,
                            topics: topics
                        }),
                        !steemMarketData.isEmpty() && _react2.default.createElement(_SteemMarket2.default, { page: 'CoinMarketPlacePost' }),
                        adSwipeEnabled && _react2.default.createElement(_AdSwipe2.default, {
                            adList: postLeftSideAdList,
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
                    )
                )
            );
        }
    }]);
    return Post;
}(_react2.default.Component), _class.propTypes = {
    post: _propTypes2.default.string,
    content: _propTypes2.default.object.isRequired,
    dis: _propTypes2.default.object,
    sortOrder: _propTypes2.default.string
}, _temp);


var emptySet = (0, _immutable.Set)();
exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var currLocation = ownProps.router.getCurrentLocation();
    var _ownProps$routeParams = ownProps.routeParams,
        username = _ownProps$routeParams.username,
        slug = _ownProps$routeParams.slug;

    var post = username + '/' + slug;
    var content = state.global.get('content');
    var dis = content.get(post);
    var adSwipeConf = state.app.getIn(['adSwipe']);
    var tronAdsConf = state.app.getIn(['tronAds']);
    var locale = state.app.getIn(['user_preferences', 'locale']);
    var trackingId = state.app.getIn(['trackingId'], null);
    var steemMarketData = state.app.get('steemMarket');
    var uname = state.user.getIn(['current', 'username']) || state.offchain.get('account');
    var postLeftSideAdList = state.ad.getIn(['postLeftSideAdList'], (0, _immutable.List)());
    var bottomAdList = state.ad.getIn(['bottomAdList'], (0, _immutable.List)());
    return {
        post: post,
        content: content,
        dis: dis,
        sortOrder: currLocation.query.sort || 'trending',
        gptEnabled: false, //state.app.getIn(['googleAds', 'gptEnabled']),
        adSwipeConf: adSwipeConf,
        tronAdsConf: tronAdsConf,
        locale: locale,
        trackingId: trackingId,
        steemMarketData: steemMarketData,
        isBrowser: process.env.BROWSER,
        uname: uname,
        topics: state.global.getIn(['topics'], (0, _immutable.List)()),
        postLeftSideAdList: postLeftSideAdList,
        bottomAdList: bottomAdList
    };
}, function (dispatch) {
    return {
        setRouteTag: function setRouteTag(permlink) {
            return dispatch(appActions.setRouteTag({
                routeTag: 'post',
                params: { permlink: permlink }
            }));
        }
    };
})(Post);