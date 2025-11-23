'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _Settings = require('app/components/modules/Settings');

var _Settings2 = _interopRequireDefault(_Settings);

var _UserList = require('app/components/elements/UserList');

var _UserList2 = _interopRequireDefault(_UserList);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _NotificationsList = require('app/components/cards/NotificationsList');

var _NotificationsList2 = _interopRequireDefault(_NotificationsList);

var _PostsList = require('app/components/cards/PostsList');

var _PostsList2 = _interopRequireDefault(_PostsList);

var _StateFunctions = require('app/utils/StateFunctions');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _Callout = require('app/components/elements/Callout');

var _Callout2 = _interopRequireDefault(_Callout);

var _userIllegalContent = require('app/utils/userIllegalContent');

var _userIllegalContent2 = _interopRequireDefault(_userIllegalContent);

var _UserProfilesSaga = require('app/redux/UserProfilesSaga');

var _UserProfileHeader = require('app/components/cards/UserProfileHeader');

var _UserProfileHeader2 = _interopRequireDefault(_UserProfileHeader);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _PrimaryNavigation = require('app/components/cards/PrimaryNavigation');

var _PrimaryNavigation2 = _interopRequireDefault(_PrimaryNavigation);

var _SubscriptionsList = require('../cards/SubscriptionsList');

var _SubscriptionsList2 = _interopRequireDefault(_SubscriptionsList);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint react/prop-types: 0 */
var emptyPostsText = function emptyPostsText(section, account, isMyAccount) {
    var name = '@' + account;

    if (section == 'posts') {
        return (0, _counterpart2.default)('user_profile.user_hasnt_made_any_posts_yet', { name: name });
    } else if (section == 'comments') {
        return (0, _counterpart2.default)('user_profile.user_hasnt_made_any_posts_yet', { name: name });
    } else if (section == 'replies') {
        return (0, _counterpart2.default)('user_profile.user_hasnt_had_any_replies_yet', { name: name }) + '.';
    } else if (section == 'payout') {
        return 'No pending payouts.';
    } else if (section == 'blog' && !isMyAccount) {
        return (0, _counterpart2.default)('user_profile.user_hasnt_started_bloggin_yet', { name: name });
    } else if (section == 'blog') {
        return _react2.default.createElement(
            'div',
            null,
            (0, _counterpart2.default)('user_profile.looks_like_you_havent_posted_anything_yet'),
            _react2.default.createElement('br', null),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
                _reactRouter.Link,
                { to: '/communities' },
                _react2.default.createElement(
                    'strong',
                    null,
                    'Explore Communities'
                )
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
                _reactRouter.Link,
                { to: '/submit.html' },
                (0, _counterpart2.default)('user_profile.create_a_post')
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
                _reactRouter.Link,
                { to: '/trending' },
                'Trending Articles'
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
                _reactRouter.Link,
                { to: '/welcome' },
                'Welcome Guide'
            ),
            _react2.default.createElement('br', null)
        );
    } else {
        console.error('unhandled emptytext case', section, name, isMyAccount);
    }
};

var UserProfile = function (_React$Component) {
    (0, _inherits3.default)(UserProfile, _React$Component);

    function UserProfile() {
        (0, _classCallCheck3.default)(this, UserProfile);

        var _this = (0, _possibleConstructorReturn3.default)(this, (UserProfile.__proto__ || (0, _getPrototypeOf2.default)(UserProfile)).call(this));

        _this.loadMore = _this.loadMore.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(UserProfile, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                profile = _props.profile,
                accountname = _props.accountname,
                fetchProfile = _props.fetchProfile,
                username = _props.username,
                section = _props.section;

            this.props.setRouteTag(accountname, section);
            if (!profile) fetchProfile(accountname, username);
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps) {
            var accountname = nextProps.accountname,
                section = nextProps.section;

            if (this.props.accountname !== accountname || this.props.section !== section) {
                this.props.setRouteTag(accountname, section);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _props2 = this.props,
                profile = _props2.profile,
                accountname = _props2.accountname,
                fetchProfile = _props2.fetchProfile,
                username = _props2.username;

            if (prevProps.accountname != accountname || prevProps.username != username) {
                if (!profile) fetchProfile(accountname, username);
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(np, ns) {
            return np.username !== this.props.username || np.status !== this.props.status || np.followers !== this.props.followers || np.following !== this.props.following || np.loading !== this.props.loading || np.location.pathname !== this.props.location.pathname || np.blogmode !== this.props.blogmode || np.posts !== this.props.posts || np.profile !== this.props.profile || np.notifications !== this.props.notifications;
        }
    }, {
        key: 'loadMore',
        value: function loadMore() {
            var last_post = this.props.posts ? this.props.posts.last() : null;
            if (!last_post) return;
            //if (last_post == this.props.pending) return; // if last post is 'pending', its an invalid start token
            var _props3 = this.props,
                username = _props3.username,
                status = _props3.status,
                order = _props3.order,
                category = _props3.category;


            if ((0, _StateFunctions.isFetchingOrRecentlyUpdated)(status, order, category)) return;

            var _last_post$split = last_post.split('/'),
                _last_post$split2 = (0, _slicedToArray3.default)(_last_post$split, 2),
                author = _last_post$split2[0],
                permlink = _last_post$split2[1];

            this.props.requestData({
                author: author,
                permlink: permlink,
                order: order,
                category: category,
                observer: username
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props4 = this.props,
                username = _props4.username,
                status = _props4.status,
                following = _props4.following,
                followers = _props4.followers,
                accountname = _props4.accountname,
                category = _props4.category,
                section = _props4.section,
                order = _props4.order,
                posts = _props4.posts,
                profile = _props4.profile,
                notifications = _props4.notifications,
                subscriptions = _props4.subscriptions;
            // Loading status

            var _state = status ? status.getIn([category, order]) : null;
            var fetching = _state && _state.fetching || this.props.loading;

            if (profile) {} else if (fetching) {
                return _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' })
                );
            } else {
                return _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'center',
                        null,
                        (0, _counterpart2.default)('user_profile.unknown_account')
                    )
                );
            }

            var isMyAccount = username === accountname;
            var tab_content = null;
            if (_userIllegalContent2.default.includes(accountname)) {
                // invalid users
                tab_content = _react2.default.createElement(
                    'div',
                    null,
                    'Unavailable For Legal Reasons.'
                );
            } else if (section === 'followers') {
                // users following this user
                tab_content = _react2.default.createElement(_UserList2.default, {
                    title: 'Followers',
                    users: followers,
                    accountname: accountname,
                    profile: profile
                });
            } else if (section === 'followed') {
                // users followed by this user
                tab_content = _react2.default.createElement(_UserList2.default, {
                    title: 'Following',
                    users: following,
                    accountname: accountname,
                    profile: profile
                });
            } else if (section === 'notifications') {
                // notifications
                tab_content = _react2.default.createElement(_NotificationsList2.default, {
                    username: accountname,
                    notifications: notifications && notifications.toJS()
                });
            } else if (section === 'communities') {
                tab_content = _react2.default.createElement(_SubscriptionsList2.default, {
                    username: accountname,
                    subscriptions: subscriptions
                });
            } else if (section === 'settings') {
                // account display settings
                tab_content = _react2.default.createElement(_Settings2.default, { routeParams: this.props.routeParams });
            } else if (!posts) {
                // post lists -- not loaded
                tab_content = _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' })
                );
            } else if (!fetching && !posts.size) {
                // post lists -- empty
                var emptyText = emptyPostsText(section, accountname, isMyAccount);
                tab_content = _react2.default.createElement(
                    _Callout2.default,
                    null,
                    emptyText
                );
            } else {
                // post lists -- loaded
                tab_content = _react2.default.createElement(_PostsList2.default, {
                    post_refs: posts,
                    loading: fetching,
                    loadMore: this.loadMore
                });
            }

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_UserProfileHeader2.default, {
                    current_user: username,
                    accountname: accountname,
                    profile: profile
                }),
                _react2.default.createElement(
                    'div',
                    {
                        className: (0, _classnames2.default)('PostsIndex', 'row',
                        //'UserProfile__tab_content',
                        //'column',
                        'layout-list')
                    },
                    _react2.default.createElement('aside', { className: 'c-sidebar c-sidebar--right' }),
                    _react2.default.createElement(
                        'aside',
                        { className: 'c-sidebar c-sidebar--left' },
                        _react2.default.createElement(_PrimaryNavigation2.default, {
                            routeTag: 'user_index',
                            category: category
                        })
                    ),
                    _react2.default.createElement(
                        'article',
                        { className: 'articles' },
                        tab_content
                    )
                )
            );
        }
    }]);
    return UserProfile;
}(_react2.default.Component);

exports.default = UserProfile;


module.exports = {
    path: '@:accountname(/:section)',
    component: (0, _reactRedux.connect)(function (state, ownProps) {
        var username = state.user.getIn(['current', 'username']);
        var accountname = ownProps.routeParams.accountname.toLowerCase();

        var section = ownProps.routeParams.section;

        if (!section) section = 'blog';
        var order = ['blog', 'posts', 'comments', 'replies', 'payout'].includes(section) ? section : null;

        return {
            posts: state.global.getIn(['discussion_idx', '@' + accountname, order]),
            username: username,
            loading: state.app.get('loading'),
            status: state.global.get('status'),
            accountname: accountname,
            followers: state.global.getIn(['follow', 'getFollowersAsync', accountname, 'blog_result']),
            following: state.global.getIn(['follow', 'getFollowingAsync', accountname, 'blog_result']),
            notifications: state.global.getIn(['notifications', accountname, 'notifications'], null),
            blogmode: state.app.getIn(['user_preferences', 'blogmode']),
            profile: state.userProfiles.getIn(['profiles', accountname]),
            section: section,
            order: order,
            category: '@' + accountname,
            subscriptions: state.global.getIn(['subscriptions', accountname]) ? state.global.getIn(['subscriptions', accountname]).toJS() : []
        };
    }, function (dispatch) {
        return {
            login: function login() {
                dispatch(userActions.showLogin());
            },
            requestData: function requestData(args) {
                return dispatch(_FetchDataSaga.actions.requestData(args));
            },
            fetchProfile: function fetchProfile(account, observer) {
                return dispatch(_UserProfilesSaga.actions.fetchProfile({ account: account, observer: observer }));
            },
            setRouteTag: function setRouteTag(accountname, section) {
                return dispatch(appActions.setRouteTag({
                    routeTag: 'user_index',
                    params: { username: accountname, section: section }
                }));
            }
        };
    })(UserProfile)
};