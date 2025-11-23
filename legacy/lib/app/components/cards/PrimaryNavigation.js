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

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _Topics = require('app/components/pages/Topics');

var _Topics2 = _interopRequireDefault(_Topics);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// For more information about this component, please visit this post - https://steemit.com/hive-151113/@the-gorilla/proposal-86-change-log-primarynavigation-jsx-and-scss
var PrimaryNavigation = function (_React$PureComponent) {
    (0, _inherits3.default)(PrimaryNavigation, _React$PureComponent);

    function PrimaryNavigation(props) {
        (0, _classCallCheck3.default)(this, PrimaryNavigation);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PrimaryNavigation.__proto__ || (0, _getPrototypeOf2.default)(PrimaryNavigation)).call(this, props));

        _this.handleScroll = function () {
            var _this$state = _this.state,
                navStartPos = _this$state.navStartPos,
                isScrollDown = _this$state.isScrollDown,
                screenWidth = _this$state.screenWidth,
                snapWidth = _this$state.snapWidth,
                prevScrollPos = _this$state.prevScrollPos;
            var _this$state2 = _this.state,
                isFeedsNavigationVisible = _this$state2.isFeedsNavigationVisible,
                isProfileNavigationVisible = _this$state2.isProfileNavigationVisible,
                isMoreNavigationVisible = _this$state2.isMoreNavigationVisible;


            var isSnapWidth = screenWidth >= snapWidth;

            var currentScrollPos = window.scrollY;
            var windowHeight = window.innerHeight;
            var navHeight = document.getElementById('appNavigation').offsetHeight;

            if (isSnapWidth) {
                // Always show the "More" Navigation items on wider screens
                var navigationElement = document.getElementById('appNavigation');
                if (!isMoreNavigationVisible) {
                    _this.setNavigationVisibility('MoreNavigation', true);
                    _this.setState({ isMoreNavigationVisible: true });
                }

                // Pin the navigation to the top / bottom of the screen as the user scrolls up and down
                var emPadding = parseFloat(window.getComputedStyle(navigationElement).fontSize);
                var mastHeadHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('Header__nav')[0]).height);
                var contentHeight = document.body.clientHeight - 30; // The 30px is the padding-bottom set on the .App__content class in App.scss

                if (currentScrollPos + mastHeadHeight <= navStartPos - emPadding) {
                    // User is near to the top of the screen
                    navigationElement.classList.remove('pin-top', 'pin-top-padded', 'pin-bottom');
                    _this.setState({ isScrollDown: false });
                } else if (prevScrollPos <= currentScrollPos && currentScrollPos > navStartPos - emPadding && navHeight <= windowHeight && !isScrollDown) {
                    // User is scrolling down, navigation height is less than the screen height and navigation is not pinned yet
                    navigationElement.classList.remove('pin-top-padded');
                    navigationElement.classList.add('pin-top');
                    _this.setState({ isScrollDown: true });
                } else if (prevScrollPos > currentScrollPos && currentScrollPos > navStartPos - emPadding && navHeight <= windowHeight && isScrollDown) {
                    // User is scrolling up, navigation all fits on the screen and navigation is pinned to the top
                    navigationElement.classList.remove('pin-top');
                    navigationElement.classList.add('pin-top-padded');
                    _this.setState({ isScrollDown: false });
                } else if (prevScrollPos <= currentScrollPos && currentScrollPos > navStartPos + navHeight + emPadding - windowHeight && navHeight > windowHeight && !isScrollDown && navStartPos + navHeight < contentHeight) {
                    // User is scrolling down and off screen, navigation height is greater than the screen height and navigation is not pinned yet
                    // We don't need to add the pin-bottom class if the navigation is longer than the body content
                    navigationElement.classList.remove('pin-top-padded');
                    navigationElement.classList.add('pin-bottom');
                    navigationElement.style.setProperty('--top', '-' + ((navHeight - windowHeight) / emPadding + 1) + 'em');
                    _this.setState({ isScrollDown: true });
                } else if (prevScrollPos > currentScrollPos && currentScrollPos > navStartPos + navHeight + emPadding - windowHeight && navHeight > windowHeight && isScrollDown) {
                    // User is scrolling up, navigation height is greater than the screen height and navigation is pinned to the bottom
                    navigationElement.classList.remove('pin-bottom');
                    navigationElement.classList.add('pin-top-padded');
                    _this.setState({ isScrollDown: false });
                }
            } else {
                // Hide the "More" Navigation Menu for small devices
                if (isMoreNavigationVisible) {
                    _this.setNavigationVisibility('MoreNavigation', false);
                    _this.setState({ isMoreNavigationVisible: false });
                }

                if (prevScrollPos > currentScrollPos || currentScrollPos < 100) {
                    // Show the secondary navigation when scrolling up
                    if (isFeedsNavigationVisible) {
                        _this.setNavigationVisibility('FeedsNavigation', true);
                    } else if (isProfileNavigationVisible) {
                        _this.setNavigationVisibility('ProfileNavigation', true);
                    }
                } else {
                    // Hide the secondary navigation when scrolling down
                    _this.setNavigationVisibility('FeedsNavigation', false);
                    _this.setNavigationVisibility('ProfileNavigation', false);
                }
            }
            _this.setState({ prevScrollPos: currentScrollPos });
        };

        _this.handleResize = function () {
            _this.setState({ screenWidth: window.innerWidth });
            _this.clearMoreNavigation();
            _this.renderVisible();
        };

        _this.setNavigationVisibility = function (navigationId, isVisible) {
            var navigationElement = document.getElementById(navigationId);
            if (navigationElement) {
                if (isVisible) {
                    navigationElement.classList.add('visible');
                } else {
                    navigationElement.classList.remove('visible');
                }
            }
        };

        _this.toggleMoreNavigation = function () {
            var _this$state3 = _this.state,
                screenWidth = _this$state3.screenWidth,
                snapWidth = _this$state3.snapWidth;

            var isSnapWidth = screenWidth >= snapWidth;

            if (!isSnapWidth) {
                if (_this.state.isMoreNavigationVisible) {
                    _this.setNavigationVisibility('MoreNavigation', false);
                    _this.setState({ isMoreNavigationVisible: false });
                } else {
                    _this.setNavigationVisibility('MoreNavigation', true);
                    _this.setState({ isMoreNavigationVisible: true });
                }
            }
        };

        _this.clearMoreNavigation = function () {
            var _this$state4 = _this.state,
                screenWidth = _this$state4.screenWidth,
                snapWidth = _this$state4.snapWidth;

            var isSnapWidth = screenWidth >= snapWidth;

            if (!isSnapWidth) {
                _this.setNavigationVisibility('MoreNavigation', false);
                _this.setState({ isMoreNavigationVisible: false });
            }
        };

        _this.renderVisible = function () {
            var _this$state5 = _this.state,
                screenWidth = _this$state5.screenWidth,
                snapWidth = _this$state5.snapWidth;
            var _this$state6 = _this.state,
                section = _this$state6.section,
                isFeedsNavigationVisible = _this$state6.isFeedsNavigationVisible,
                isProfileNavigationVisible = _this$state6.isProfileNavigationVisible,
                isOtherProfileVisible = _this$state6.isOtherProfileVisible;
            var _this$props = _this.props,
                username = _this$props.username,
                routeTag = _this$props.routeTag,
                pathname = _this$props.pathname;

            var accountname = void 0,
                navUrl = void 0;

            var isSnapWidth = screenWidth >= snapWidth;

            isFeedsNavigationVisible = false;
            isProfileNavigationVisible = false;
            isOtherProfileVisible = false;

            var localPreviousUrl = void 0;
            if (process.env.BROWSER) {
                localPreviousUrl = localStorage.getItem('previousUrl', pathname);
            }

            if (routeTag === 'post' && localPreviousUrl) {
                // 'post' routeTag doesn't have any context as to current location whereas localPreviousUrl stores the referral path
                navUrl = localPreviousUrl;
            } else {
                navUrl = pathname;
                if (process.env.BROWSER && localPreviousUrl !== pathname) {
                    localStorage.setItem('previousUrl', pathname);
                }
            }

            var navUrlComponents = navUrl.split('/');

            if (navUrlComponents[1] === '@' + username && navUrlComponents[2] === 'feed') {
                // Logged In User's Friends Feed (Explore > My Friends)
                isFeedsNavigationVisible = true;
                section = '/@' + username + '/' + navUrlComponents[2];
                accountname = username;
            } else if (navUrlComponents[1] === '@' + username) {
                // Logged In User's Profile (My Profile > navUrlComponents[2])
                isProfileNavigationVisible = true;
                section = '/@' + username + '/' + navUrlComponents[2];
                if (navUrlComponents[2]) {
                    section = '/' + navUrlComponents[1] + '/' + navUrlComponents[2];
                } else {
                    section = '/' + navUrlComponents[1] + '/blog';
                }
                accountname = username;
            } else if (navUrlComponents[1] !== '@' + username && navUrlComponents[1].startsWith('@') && navUrlComponents[2] === 'feed') {
                // Another User's Friends Feed (Explore > @{accountname} > Friends Feed)
                if (isSnapWidth) {
                    isFeedsNavigationVisible = true;
                }
                isProfileNavigationVisible = true;
                isOtherProfileVisible = true;
                section = '/' + navUrlComponents[1] + '/' + navUrlComponents[2];
                accountname = navUrlComponents[1].substring(1);
            } else if (navUrlComponents[1] !== '@' + username && navUrlComponents[1].startsWith('@')) {
                // Another User's Profile (Explore > @{accountname} > navUrlComponents[2])
                if (isSnapWidth) {
                    isFeedsNavigationVisible = true;
                }
                isProfileNavigationVisible = true;
                isOtherProfileVisible = true;
                if (navUrlComponents[2]) {
                    section = '/' + navUrlComponents[1] + '/' + navUrlComponents[2];
                } else {
                    section = '/' + navUrlComponents[1] + '/blog';
                }
                accountname = navUrlComponents[1].substring(1);
            } else if (navUrlComponents[1] !== '@' + username && navUrlComponents[2] === 'my') {
                // Logged In User's Subscriptions (Explore > My Subscriptions)
                isFeedsNavigationVisible = true;
                section = '/trending/my';
            } else if (navUrlComponents[2] && navUrlComponents[2].startsWith('hive-')) {
                // Logged In User's Community (Explore > My Subscriptions > Community)
                isFeedsNavigationVisible = true;
                section = '/trending/my';
            } else {
                // Default State
                isFeedsNavigationVisible = true;
                section = '/trending';
            }

            if (isSnapWidth) {
                _this.setNavigationVisibility('MoreNavigation', true);
            }

            _this.setNavigationVisibility('FeedsNavigation', isFeedsNavigationVisible);
            _this.setNavigationVisibility('ProfileNavigation', isProfileNavigationVisible);

            _this.setState({
                navaccountname: accountname,
                navSection: section,
                isMoreNavigationVisible: isSnapWidth,
                isFeedsNavigationVisible: isFeedsNavigationVisible,
                isProfileNavigationVisible: isProfileNavigationVisible,
                isOtherProfileVisible: isOtherProfileVisible
            });
        };

        _this.state = {
            section: '/trending',
            isFeedsNavigationVisible: true,
            isProfileNavigationVisible: true,
            isMoreNavigationVisible: false,
            isOtherProfileVisible: false,
            prevScrollPos: 0,
            screenWidth: 0,
            navStartPos: 0,
            isScrollDown: false
        };
        return _this;
    }

    (0, _createClass3.default)(PrimaryNavigation, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                subscriptions = _props.subscriptions,
                getSubscriptions = _props.getSubscriptions,
                username = _props.username;

            if (!subscriptions && username) getSubscriptions(username);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.state = {
                prevScrollPos: window.scrollY,
                screenWidth: window.innerWidth,
                snapWidth: 760,
                navStartPos: document.getElementById('appNavigation').offsetTop
            };
            window.addEventListener('scroll', this.handleScroll);
            window.addEventListener('resize', this.handleResize);
            this.renderVisible();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            var pathname = this.props.pathname;

            if (prevProps.pathname !== pathname) {
                this.renderVisible();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('scroll', this.handleScroll);
            window.removeEventListener('resize', this.handleResize);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props2 = this.props,
                username = _props2.username,
                routeTag = _props2.routeTag,
                category = _props2.category,
                topics = _props2.topics,
                subscriptions = _props2.subscriptions,
                showLogin = _props2.showLogin,
                walletUrlProp = _props2.walletUrl;
            var _state = this.state,
                navSection = _state.navSection,
                isFeedsNavigationVisible = _state.isFeedsNavigationVisible,
                isProfileNavigationVisible = _state.isProfileNavigationVisible,
                isMoreNavigationVisible = _state.isMoreNavigationVisible,
                isOtherProfileVisible = _state.isOtherProfileVisible;
            var navaccountname = this.state.navaccountname;


            var walletUrlOther = walletUrlProp + '/@' + navaccountname + '/transfers';
            var walletUrl = walletUrlProp + '/@' + username + '/transfers';
            var settingsURL = '/@' + username + '/settings';

            var tabLink = function tabLink(tab, label) {
                var logo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

                var cls = tab === navSection ? 'active' : null;
                return _react2.default.createElement(
                    _reactRouter.Link,
                    {
                        to: tab,
                        className: cls,
                        onClick: _this2.clearMoreNavigation
                    },
                    logo && _react2.default.createElement(
                        'span',
                        { className: 'LogoWrapper' },
                        _react2.default.createElement(_Icon2.default, { name: logo })
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'Label' },
                        label
                    )
                );
            };

            var primary_navigation = _react2.default.createElement(
                'ul',
                { className: 'PrimaryNavTabs' },
                _react2.default.createElement(
                    'li',
                    {
                        className: '' + (isFeedsNavigationVisible || isOtherProfileVisible ? 'active' : '')
                    },
                    tabLink('/trending', (0, _counterpart2.default)('g.explore'), 'compass-outline'),
                    _react2.default.createElement(
                        'ul',
                        {
                            id: 'FeedsNavigation',
                            className: 'navigation-list ' + (isFeedsNavigationVisible ? 'visible' : '')
                        },
                        username && _react2.default.createElement(
                            'li',
                            null,
                            tabLink('/trending', (0, _counterpart2.default)('g.posts_all'), 'library-books')
                        ),
                        username && _react2.default.createElement(
                            'li',
                            null,
                            tabLink('/@' + username + '/feed', (0, _counterpart2.default)('g.my_friends'), 'account-heart')
                        ),
                        username && _react2.default.createElement(
                            'li',
                            null,
                            tabLink('/trending/my', (0, _counterpart2.default)('g.my_subscriptions'), 'account-group'),
                            (navSection === '/trending/my' || routeTag === 'community_index' || routeTag === 'more_communities') && _react2.default.createElement(_Topics2.default, {
                                username: username,
                                current: category,
                                topics: topics,
                                subscriptions: subscriptions,
                                compact: false
                            })
                        ),
                        navaccountname && navaccountname !== username && _react2.default.createElement(
                            'li',
                            { className: 'active' },
                            tabLink('/@' + navaccountname + '/posts', '@' + navaccountname, 'person'),
                            _react2.default.createElement(
                                'ul',
                                {
                                    id: 'ProfileNavigation',
                                    className: 'navigation-list ' + (isProfileNavigationVisible ? 'visible' : '')
                                },
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink('/@' + navaccountname + '/posts', (0, _counterpart2.default)('g.posts'))
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink('/@' + navaccountname + '/blog', (0, _counterpart2.default)('g.blog'))
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink('/@' + navaccountname + '/comments', (0, _counterpart2.default)('g.comments'))
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink('/@' + navaccountname + '/replies', (0, _counterpart2.default)('g.replies'))
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    _react2.default.createElement(
                                        'a',
                                        {
                                            href: '#',
                                            onClick: function onClick(event) {
                                                event.preventDefault();
                                                _this2.toggleMoreNavigation();
                                            },
                                            className: 'More'
                                        },
                                        _react2.default.createElement(
                                            'span',
                                            { className: 'LogoWrapper' },
                                            _react2.default.createElement(_Icon2.default, { name: 'menu' })
                                        ),
                                        _react2.default.createElement(
                                            'span',
                                            { className: 'Label' },
                                            'More...'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'ul',
                                        {
                                            id: 'MoreNavigation',
                                            className: 'navigation-list ' + (isMoreNavigationVisible ? 'visible' : '')
                                        },
                                        _react2.default.createElement(
                                            'li',
                                            null,
                                            tabLink('/@' + navaccountname + '/notifications', (0, _counterpart2.default)('g.notifications'))
                                        ),
                                        false && _react2.default.createElement(
                                            'li',
                                            null,
                                            tabLink('/@' + navaccountname + '/bookmarks', (0, _counterpart2.default)('g.bookmarks'), 'bookmark')
                                        ),
                                        _react2.default.createElement(
                                            'li',
                                            null,
                                            tabLink('/@' + navaccountname + '/communities', (0, _counterpart2.default)('g.subscriptions'))
                                        ),
                                        _react2.default.createElement(
                                            'li',
                                            null,
                                            tabLink('/@' + navaccountname + '/feed', (0, _counterpart2.default)('g.friends_feed'))
                                        ),
                                        _react2.default.createElement(
                                            'li',
                                            null,
                                            tabLink('/@' + navaccountname + '/payout', (0, _counterpart2.default)('g.payouts'))
                                        ),
                                        _react2.default.createElement(
                                            'li',
                                            null,
                                            _react2.default.createElement(
                                                'a',
                                                {
                                                    href: walletUrlOther,
                                                    target: '_blank'
                                                },
                                                _react2.default.createElement(
                                                    'span',
                                                    { className: 'Label' },
                                                    (0, _counterpart2.default)('g.wallet')
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),
                username && _react2.default.createElement(
                    'li',
                    {
                        className: '' + (isProfileNavigationVisible && !isOtherProfileVisible ? 'active' : '')
                    },
                    tabLink('/@' + username + '/posts', (0, _counterpart2.default)('g.my_profile'), 'person'),
                    username === navaccountname && _react2.default.createElement(
                        'ul',
                        {
                            id: 'ProfileNavigation',
                            className: 'navigation-list ' + (isProfileNavigationVisible ? 'visible' : '')
                        },
                        _react2.default.createElement(
                            'li',
                            null,
                            tabLink('/@' + username + '/posts', (0, _counterpart2.default)('g.posts'), 'library-books')
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            tabLink('/@' + username + '/blog', (0, _counterpart2.default)('g.blog'), 'profile')
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            tabLink('/@' + username + '/comments', (0, _counterpart2.default)('g.comments'), 'chatbox')
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            tabLink('/@' + username + '/replies', (0, _counterpart2.default)('g.replies'), 'reply')
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                'a',
                                {
                                    href: '#',
                                    onClick: function onClick(event) {
                                        event.preventDefault();
                                        _this2.toggleMoreNavigation();
                                    },
                                    className: 'More'
                                },
                                _react2.default.createElement(
                                    'span',
                                    { className: 'LogoWrapper' },
                                    _react2.default.createElement(_Icon2.default, { name: 'menu' })
                                ),
                                _react2.default.createElement(
                                    'span',
                                    { className: 'Label' },
                                    'More...'
                                )
                            ),
                            _react2.default.createElement(
                                'ul',
                                {
                                    id: 'MoreNavigation',
                                    className: 'navigation-list ' + (isMoreNavigationVisible ? 'visible' : '')
                                },
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink('/@' + username + '/notifications', (0, _counterpart2.default)('g.notifications'), 'clock')
                                ),
                                false && _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink('/@' + username + '/bookmarks', (0, _counterpart2.default)('g.bookmarks'), 'bookmark')
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink('/@' + username + '/communities', (0, _counterpart2.default)('g.subscriptions'), 'account-group')
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink('/@' + username + '/payout', (0, _counterpart2.default)('g.payouts'), 'currency-usd')
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    tabLink(settingsURL, (0, _counterpart2.default)('g.settings'), 'account-settings-variant')
                                )
                            )
                        )
                    )
                ),
                username && _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'a',
                        { href: walletUrl, target: '_blank' },
                        _react2.default.createElement(
                            'span',
                            { className: 'LogoWrapper' },
                            _react2.default.createElement(_Icon2.default, { name: 'wallet_2' })
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'Label' },
                            (0, _counterpart2.default)('g.my_wallet')
                        )
                    )
                ),
                !username && _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'a',
                        { href: '/login.html', onClick: showLogin },
                        _react2.default.createElement(_Icon2.default, { name: 'person' }),
                        _react2.default.createElement(
                            'span',
                            { className: 'Label' },
                            (0, _counterpart2.default)('g.my_profile')
                        )
                    )
                ),
                !username && _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'a',
                        { href: '/login.html', onClick: showLogin },
                        _react2.default.createElement(_Icon2.default, { name: 'wallet_2' }),
                        _react2.default.createElement(
                            'span',
                            { className: 'Label' },
                            (0, _counterpart2.default)('g.my_wallet')
                        )
                    )
                )
            );

            return _react2.default.createElement(
                'div',
                { id: 'appNavigation', className: 'App__navigation' },
                _react2.default.createElement(
                    'nav',
                    null,
                    _react2.default.createElement(
                        'div',
                        { className: 'PrimaryNavigation' },
                        primary_navigation
                    )
                )
            );
        }
    }]);
    return PrimaryNavigation;
}(_react2.default.PureComponent);

var mapStateToProps = function mapStateToProps(state) {
    var walletUrl = state.app.get('walletUrl');
    var username = state.user.getIn(['current', 'username']) || state.offchain.get('account');
    var pathname = state.global.get('pathname');
    var topics = state.global.getIn(['topics'], (0, _immutable.List)());
    var subscriptions = state.global.getIn(['subscriptions', username]);

    return {
        walletUrl: walletUrl,
        username: username,
        pathname: pathname,
        topics: topics,
        subscriptions: subscriptions
    };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        getSubscriptions: function getSubscriptions(account) {
            return dispatch(_FetchDataSaga.actions.getSubscriptions(account));
        },
        showLogin: function showLogin(e) {
            if (e) e.preventDefault();
            dispatch(userActions.showLogin({ type: 'basic' }));
        }
    };
};

var connectedNavigation = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(PrimaryNavigation);

exports.default = connectedNavigation;