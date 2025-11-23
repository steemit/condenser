'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._Header_ = undefined;

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

var _class, _temp; /* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable prefer-const */
/* eslint-disable no-multi-assign */
/* eslint-disable react/sort-comp */
/* eslint-disable consistent-return */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-undef */
/* eslint-disable import/first */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _StateFunctions = require('app/utils/StateFunctions');

var _reactHeadroom = require('react-headroom');

var _reactHeadroom2 = _interopRequireDefault(_reactHeadroom);

var _ResolveRoute = require('app/ResolveRoute');

var _ResolveRoute2 = _interopRequireDefault(_ResolveRoute);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _client_config = require('app/client_config');

var _ElasticSearchInput = require('app/components/elements/ElasticSearchInput');

var _ElasticSearchInput2 = _interopRequireDefault(_ElasticSearchInput);

var _IconButton = require('app/components/elements/IconButton');

var _IconButton2 = _interopRequireDefault(_IconButton);

var _DropdownMenu = require('app/components/elements/DropdownMenu');

var _DropdownMenu2 = _interopRequireDefault(_DropdownMenu);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _PollingSaga = require('app/redux/PollingSaga');

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _constants = require('shared/constants');

var _SteemLogo = require('app/components/elements/SteemLogo');

var _SteemLogo2 = _interopRequireDefault(_SteemLogo);

var _Announcement = require('app/components/elements/Announcement');

var _Announcement2 = _interopRequireDefault(_Announcement);

var _immutable = require('immutable');

var _ReactMutationObserver = require('../../utils/ReactMutationObserver');

var _ReactMutationObserver2 = _interopRequireDefault(_ReactMutationObserver);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Header = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Header, _React$Component);

    function Header(props) {
        (0, _classCallCheck3.default)(this, Header);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Header.__proto__ || (0, _getPrototypeOf2.default)(Header)).call(this, props));

        _this.state = {
            showAd: false,
            showAnnouncement: _this.props.showAnnouncement
        };
        _this.handleSignup = _this.handleSignup.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(Header, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                loggedIn = _props.loggedIn,
                current_account_name = _props.current_account_name,
                startNotificationsPolling = _props.startNotificationsPolling;

            if (loggedIn) {
                startNotificationsPolling(current_account_name);
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!process.env.BROWSER || !window.googletag || !window.googletag.pubads) {
                return null;
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (!process.env.BROWSER || !window.googletag || !window.googletag.pubads) {
                return null;
            }
        }

        // Consider refactor.
        // I think 'last sort order' is something available through react-router-redux history.
        // Therefore no need to store it in the window global like this.

    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.pathname !== this.props.pathname) {
                var route = (0, _ResolveRoute2.default)(nextProps.pathname);
                if (route && route.page === 'PostsIndex' && route.params && route.params.length > 0) {
                    var sort_order = route.params[0] !== 'home' ? route.params[0] : null;
                    if (sort_order) window.last_sort_order = this.last_sort_order = sort_order;
                }
            }
        }
    }, {
        key: 'handleSignup',
        value: function handleSignup() {
            var routeTag = this.props.routeTag;

            if (!routeTag) return;
            var signupUrl = routeTag ? _constants.SIGNUP_URL + '/#source=condenser|' + routeTag.routeTag : _constants.SIGNUP_URL;
            var new_window = window.open();
            new_window.opener = null;
            new_window.location = signupUrl;
        }
    }, {
        key: 'headroomOnUnpin',
        value: function headroomOnUnpin() {
            this.setState({ showAd: false });
        }
    }, {
        key: 'headroomOnUnfix',
        value: function headroomOnUnfix() {
            this.setState({ showAd: true });
        }
    }, {
        key: 'hideAnnouncement',
        value: function hideAnnouncement() {
            this.setState({ showAnnouncement: false });
            this.props.hideAnnouncement();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props2 = this.props,
                pathname = _props2.pathname,
                username = _props2.username,
                showLogin = _props2.showLogin,
                logout = _props2.logout,
                loggedIn = _props2.loggedIn,
                toggleNightmode = _props2.toggleNightmode,
                showSidePanel = _props2.showSidePanel,
                navigate = _props2.navigate,
                display_name = _props2.display_name,
                content = _props2.content,
                walletUrl = _props2.walletUrl,
                unreadNotificationCount = _props2.unreadNotificationCount,
                notificationActionPending = _props2.notificationActionPending;
            var _state = this.state,
                showAd = _state.showAd,
                showAnnouncement = _state.showAnnouncement;

            /*Set the document.title on each header render.*/

            var route = (0, _ResolveRoute2.default)(pathname);
            var gptTags = [];
            var page_title = route.page;
            var sort_order = '';
            var topic = '';
            var page_name = null;
            if (route.page === 'PostsIndex') {
                sort_order = route.params[0];
                if (sort_order === 'home') {
                    var user = ('' + route.params[1]).replace('@', '');
                    if (user === username) {
                        page_title = (0, _counterpart2.default)('g.my_friends');
                    } else if (user) {
                        page_title = user + "'s " + (0, _counterpart2.default)('g.friends');
                    } else {
                        page_title = (0, _counterpart2.default)('g.my_friends');
                    }
                } else {
                    topic = route.params.length > 1 ? route.params[1] || '' : '';
                    gptTags = [topic];

                    var prefix = route.params[0];
                    if (prefix == 'created') prefix = 'New';
                    if (prefix == 'payout') prefix = 'Pending';
                    if (prefix == 'payout_comments') prefix = 'Pending';
                    if (prefix == 'muted') prefix = 'Muted';
                    page_title = prefix;
                    if (topic !== '') {
                        var name = this.props.community.getIn([topic, 'title'], '#' + topic);
                        if (name == '#my') name = 'My Communities';
                        page_title = name + ' / ' + page_title;
                    } else {
                        page_title += ' posts';
                    }
                }
            } else if (route.page === 'Post') {
                if (content) {
                    var _user = ('' + route.params[1]).replace('@', '');
                    var slug = '' + route.params[2];
                    var post = content.get(_user + '/' + slug);
                    gptTags = post ? (0, _StateFunctions.parseJsonTags)(post) : [];
                }
                sort_order = '';
                topic = route.params[0];
            } else if (route.page == 'SubmitPost') {
                page_title = (0, _counterpart2.default)('header_jsx.create_a_post');
            } else if (route.page == 'Privacy') {
                page_title = (0, _counterpart2.default)('navigation.privacy_policy');
            } else if (route.page == 'Tos') {
                page_title = (0, _counterpart2.default)('navigation.terms_of_service');
            } else if (route.page == 'CommunityRoles') {
                page_title = 'Community Roles';
            } else if (route.page === 'UserProfile') {
                var user_name = route.params[0].slice(1);
                var user_title = display_name ? display_name + ' (@' + user_name + ')' : user_name;
                page_title = user_title;
                if (route.params[1] === 'followers') {
                    page_title = (0, _counterpart2.default)('header_jsx.people_following', {
                        username: user_title
                    });
                }
                if (route.params[1] === 'followed') {
                    page_title = (0, _counterpart2.default)('header_jsx.people_followed_by', {
                        username: user_title
                    });
                }
                if (route.params[1] === 'replies') {
                    page_title = (0, _counterpart2.default)('header_jsx.replies_to', {
                        username: user_title
                    });
                }
                if (route.params[1] === 'posts') {
                    page_title = (0, _counterpart2.default)('header_jsx.posts_by', {
                        username: user_title
                    });
                }
                if (route.params[1] === 'comments') {
                    page_title = (0, _counterpart2.default)('header_jsx.comments_by', {
                        username: user_title
                    });
                }
            } else {
                page_name = ''; //page_title = route.page.replace( /([a-z])([A-Z])/g, '$1 $2' ).toLowerCase();
            }

            // Format first letter of all titles and lowercase user name
            if (route.page !== 'UserProfile') {
                page_title = page_title.charAt(0).toUpperCase() + page_title.slice(1);
            }

            if (process.env.BROWSER && route.page !== 'Post' && route.page !== 'PostNoCategory') document.title = page_title + ' — ' + _client_config.APP_NAME;

            //const _feed = current_account_name && `/@${current_account_name}/feed`;
            //const logo_link = _feed && pathname != _feed ? _feed : '/';
            var logo_link = '/';

            //TopRightHeader Stuff
            var defaultNavigate = function defaultNavigate(e) {
                if (e.metaKey || e.ctrlKey) {
                    // prevent breaking anchor tags
                } else {
                    e.preventDefault();
                }
                var a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
                _reactRouter.browserHistory.push(a.pathname + a.search + a.hash);
            };

            // Since navigate isn't set, defaultNavigate will always be used.
            var nav = navigate || defaultNavigate;

            var checkIfLogin = function checkIfLogin() {
                if (!loggedIn) {
                    return showLogin();
                }
                return _reactRouter.browserHistory.replace('/submit.html');
            };

            var submit_story = $STM_Config.read_only_mode ? null : _react2.default.createElement(
                _reactRouter.Link,
                { onClick: checkIfLogin },
                _react2.default.createElement(_IconButton2.default, null)
            );

            var replies_link = '/@' + username + '/replies';
            var account_link = '/@' + username + '/posts';
            var comments_link = '/@' + username + '/comments';
            var notifs_link = '/@' + username + '/notifications';
            var wallet_link = walletUrl + '/@' + username;
            var notif_label = (0, _counterpart2.default)('g.notifications') + (unreadNotificationCount > 0 ? ' (' + unreadNotificationCount + ')' : '');

            var user_menu = [{ link: account_link, icon: 'person', value: (0, _counterpart2.default)('g.profile') }, { link: notifs_link, icon: 'clock', value: notif_label }, { link: comments_link, icon: 'chatbox', value: (0, _counterpart2.default)('g.comments') }, { link: replies_link, icon: 'reply', value: (0, _counterpart2.default)('g.replies') },
            //{ link: settings_link, icon: 'cog', value: tt('g.settings') },
            {
                link: '#',
                icon: 'eye',
                onClick: toggleNightmode,
                value: (0, _counterpart2.default)('g.toggle_nightmode')
            }, { link: wallet_link, icon: 'wallet', value: (0, _counterpart2.default)('g.wallet') }, {
                link: '#',
                icon: 'enter',
                onClick: logout,
                value: (0, _counterpart2.default)('g.logout')
            }];
            var headerMutated = function headerMutated(mutation, discconnectObserver) {
                if (mutation.target.id.indexOf('google_ads_iframe_') !== -1) {
                    if (typeof discconnectObserver === 'function') {
                        discconnectObserver();
                    }
                }
            };
            return _react2.default.createElement(
                _ReactMutationObserver2.default,
                { onChildListChanged: headerMutated },
                _react2.default.createElement(
                    _reactHeadroom2.default,
                    {
                        onUnpin: function onUnpin(e) {
                            return _this2.headroomOnUnpin(e);
                        },
                        onUnfix: function onUnfix(e) {
                            return _this2.headroomOnUnfix(e);
                        }
                    },
                    _react2.default.createElement(
                        'header',
                        { className: 'Header' },
                        showAnnouncement && _react2.default.createElement(_Announcement2.default, {
                            onClose: function onClose(e) {
                                return _this2.hideAnnouncement(e);
                            }
                        }),
                        _react2.default.createElement(
                            'nav',
                            { className: 'row Header__nav' },
                            _react2.default.createElement(
                                'div',
                                { className: 'small-6 medium-4 large-4 columns Header__logotype' },
                                _react2.default.createElement(
                                    _reactRouter.Link,
                                    { to: logo_link },
                                    _react2.default.createElement(_SteemLogo2.default, null)
                                )
                            ),
                            _react2.default.createElement('div', { className: 'large-1 columns show-for-large large-centered Header__sort' }),
                            _react2.default.createElement(
                                'div',
                                { className: 'small-6 medium-8 large-7 columns Header__buttons' },
                                _react2.default.createElement(
                                    'span',
                                    {
                                        className: 'Header__search--desktop--new',
                                        style: { marginRight: 20 }
                                    },
                                    _react2.default.createElement(_ElasticSearchInput2.default, {
                                        addHistory: true,
                                        redirect: true
                                    })
                                ),
                                _react2.default.createElement(
                                    'span',
                                    { className: 'Header__search' },
                                    _react2.default.createElement(
                                        _reactRouter.Link,
                                        { to: '/search' },
                                        _react2.default.createElement(_IconButton2.default, { icon: 'magnifyingGlass' })
                                    )
                                ),
                                !loggedIn && _react2.default.createElement(
                                    'span',
                                    { className: 'Header__user-signup show-for-medium' },
                                    _react2.default.createElement(
                                        'a',
                                        {
                                            className: 'Header__login-link',
                                            href: '/login.html',
                                            onClick: showLogin
                                        },
                                        (0, _counterpart2.default)('g.login')
                                    ),
                                    _react2.default.createElement(
                                        'a',
                                        {
                                            className: 'Header__signup-link',
                                            onClick: this.handleSignup
                                        },
                                        (0, _counterpart2.default)('g.sign_up')
                                    )
                                ),
                                submit_story,
                                loggedIn && _react2.default.createElement(
                                    _DropdownMenu2.default,
                                    {
                                        className: 'Header__usermenu',
                                        items: user_menu,
                                        title: username,
                                        el: 'span',
                                        position: 'left'
                                    },
                                    _react2.default.createElement(
                                        'li',
                                        { className: 'Header__userpic ' },
                                        _react2.default.createElement(_Userpic2.default, { account: username })
                                    ),
                                    !notificationActionPending && unreadNotificationCount > 0 && _react2.default.createElement(
                                        'div',
                                        {
                                            className: 'Header__notification'
                                        },
                                        _react2.default.createElement(
                                            'span',
                                            null,
                                            unreadNotificationCount
                                        )
                                    )
                                ),
                                _react2.default.createElement(
                                    'span',
                                    {
                                        onClick: function onClick(e) {
                                            showSidePanel();
                                            e.nativeEvent.stopImmediatePropagation();
                                        },
                                        className: 'toggle-menu Header__hamburger'
                                    },
                                    _react2.default.createElement('span', { className: 'hamburger' })
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);
    return Header;
}(_react2.default.Component), _class.propTypes = {
    current_account_name: _propTypes2.default.string,
    display_name: _propTypes2.default.string,
    category: _propTypes2.default.string,
    order: _propTypes2.default.string,
    pathname: _propTypes2.default.string,
    getUnreadAccountNotifications: _propTypes2.default.func,
    startNotificationsPolling: _propTypes2.default.func,
    loggedIn: _propTypes2.default.bool,
    unreadNotificationCount: _propTypes2.default.number
}, _temp);
exports._Header_ = Header;


var mapStateToProps = function mapStateToProps(state, ownProps) {
    // SSR code split.
    if (!process.env.BROWSER) {
        return {
            username: null,
            loggedIn: false,
            community: state.global.get('community', (0, _immutable.Map)({}))
        };
    }

    // display name used in page title
    var display_name = void 0;
    var route = (0, _ResolveRoute2.default)(ownProps.pathname);
    if (route.page === 'UserProfile') {
        display_name = state.userProfiles.getIn(['profiles', route.params[0].slice(1), 'metadata', 'profile', 'name'], null);
    }

    var username = state.user.getIn(['current', 'username']);
    var loggedIn = !!username;
    var current_account_name = username ? username : state.offchain.get('account');

    var gptEnabled = state.app.getIn(['googleAds', 'gptEnabled']);
    var content = state.global.get('content'); // TODO: needed for SSR?
    var unreadNotificationCount = 0;
    if (loggedIn && state.global.getIn(['notifications', current_account_name, 'unreadNotifications'])) {
        unreadNotificationCount = state.global.getIn(['notifications', current_account_name, 'unreadNotifications', 'unread']);
    }

    return (0, _extends3.default)({
        username: username,
        loggedIn: loggedIn,
        community: state.global.get('community', (0, _immutable.Map)({})),
        nightmodeEnabled: state.app.getIn(['user_preferences', 'nightmode']),
        display_name: display_name,
        current_account_name: current_account_name,
        showAnnouncement: state.user.get('showAnnouncement'),
        walletUrl: state.app.get('walletUrl'),
        gptEnabled: gptEnabled,
        content: content,
        unreadNotificationCount: unreadNotificationCount,
        notificationActionPending: state.global.getIn(['notifications', 'loading']),
        routeTag: state.app.has('routeTag') ? state.app.get('routeTag') : null
    }, ownProps);
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        showLogin: function showLogin(e) {
            if (e) e.preventDefault();
            dispatch(userActions.showLogin({ type: 'basic' }));
        },
        logout: function logout(e) {
            if (e) e.preventDefault();
            dispatch(userActions.logout({ type: 'default' }));
        },
        toggleNightmode: function toggleNightmode(e) {
            if (e) e.preventDefault();
            dispatch(appActions.toggleNightmode());
        },
        showSidePanel: function showSidePanel() {
            dispatch(userActions.showSidePanel());
        },
        hideSidePanel: function hideSidePanel() {
            dispatch(userActions.hideSidePanel());
        },
        getUnreadAccountNotifications: function getUnreadAccountNotifications(username) {
            var query = {
                account: username
            };
            return dispatch(_FetchDataSaga.actions.getUnreadAccountNotifications(query));
        },
        hideAnnouncement: function hideAnnouncement() {
            return dispatch(userActions.hideAnnouncement());
        },
        startNotificationsPolling: function startNotificationsPolling(username) {
            var query = {
                account: username
            };
            var params = {
                pollAction: _FetchDataSaga.actions.getUnreadAccountNotifications,
                pollPayload: query,
                delay: 600000 // The delay between successive polls
            };
            return dispatch((0, _PollingSaga.startPolling)(params));
        }
    };
};

var connectedHeader = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Header);

exports.default = connectedHeader;