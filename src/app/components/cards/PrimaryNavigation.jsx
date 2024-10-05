import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { List } from 'immutable';
import tt from 'counterpart';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as userActions from 'app/redux/UserReducer';
import Icon from 'app/components/elements/Icon';
import Topics from 'app/components/pages/Topics';

// For more information about this component, please visit this post - https://steemit.com/hive-151113/@the-gorilla/proposal-86-change-log-primarynavigation-jsx-and-scss
class PrimaryNavigation extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            section: '/trending',
            isFeedsNavigationVisible: true,
            isProfileNavigationVisible: true,
            isMoreNavigationVisible: false,
            isOtherProfileVisible: false,
            prevScrollPos: 0,
            screenWidth: 0,
            navStartPos: 0,
            isScrollDown: false,
        };
    }

    componentWillMount() {
        const { subscriptions, getSubscriptions, username } = this.props;
        if (!subscriptions && username) getSubscriptions(username);
    }

    componentDidMount() {
        this.state = {
            prevScrollPos: window.scrollY,
            screenWidth: window.innerWidth,
            snapWidth: 760,
            navStartPos: document.getElementById('appNavigation').offsetTop,
        };
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
        this.renderVisible();
    }
    componentDidUpdate(prevProps, prevState) {
        const { pathname } = this.props;
        if (prevProps.pathname !== pathname) {
            this.renderVisible();
        }
        const { subscriptions, getSubscriptions, username } = this.props;
        if (!subscriptions && username) getSubscriptions(username);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }

    handleScroll = () => {
        const {
            navStartPos,
            isScrollDown,
            screenWidth,
            snapWidth,
            prevScrollPos,
        } = this.state;
        const {
            isFeedsNavigationVisible,
            isProfileNavigationVisible,
            isMoreNavigationVisible,
        } = this.state;

        const isSnapWidth = screenWidth >= snapWidth;

        const currentScrollPos = window.scrollY;

        if (isSnapWidth) {
            // Always show the "More" Navigation items on wider screens
            const navigationElement = document.getElementById('appNavigation');
            if (!isMoreNavigationVisible) {
                this.setNavigationVisibility('MoreNavigation', true);
                this.setState({ isMoreNavigationVisible: true });
            }

            // Pin the navigation to the top / bottom of the screen as the user scrolls up and down
            const emPadding = parseFloat(
                window.getComputedStyle(navigationElement).fontSize
            );
            const windowHeight = window.innerHeight;
            const navHeight =
                document.getElementById('appNavigation').offsetHeight +
                2 * emPadding;
            const mastHeadHeight = parseFloat(
                window.getComputedStyle(
                    document.getElementsByClassName('Header__nav')[0]
                ).height
            );
            const contentHeight = document.body.clientHeight - 30; // The 30px is the padding-bottom set on the .App__content class in App.scss

            if (currentScrollPos + mastHeadHeight <= navStartPos - emPadding) {
                // User is near to the top of the screen
                navigationElement.classList.remove(
                    'pin-top',
                    'pin-top-padded',
                    'pin-bottom'
                );
                this.setState({ isScrollDown: false });
            } else if (
                prevScrollPos <= currentScrollPos &&
                currentScrollPos > navStartPos - emPadding &&
                navHeight <= windowHeight &&
                !isScrollDown
            ) {
                // User is scrolling down, navigation height is less than the screen height and navigation is not pinned yet
                navigationElement.classList.remove('pin-top-padded');
                navigationElement.classList.add('pin-top');
                this.setState({ isScrollDown: true });
            } else if (
                prevScrollPos > currentScrollPos &&
                currentScrollPos > navStartPos - emPadding &&
                navHeight <= windowHeight &&
                isScrollDown
            ) {
                // User is scrolling up, navigation all fits on the screen and navigation is pinned to the top
                navigationElement.classList.remove('pin-top');
                navigationElement.classList.add('pin-top-padded');
                this.setState({ isScrollDown: false });
            } else if (
                prevScrollPos <= currentScrollPos &&
                currentScrollPos >
                    navStartPos + navHeight + emPadding - windowHeight &&
                navHeight > windowHeight &&
                !isScrollDown &&
                navStartPos + navHeight < contentHeight
            ) {
                // User is scrolling down and off screen, navigation height is greater than the screen height and navigation is not pinned yet
                // We don't need to add the pin-bottom class if the navigation is longer than the body content
                navigationElement.classList.remove('pin-top-padded');
                navigationElement.classList.add('pin-bottom');
                navigationElement.style.setProperty(
                    `--top`,
                    `-${(navHeight - windowHeight) / emPadding - 1}em`
                );
                this.setState({ isScrollDown: true });
            } else if (
                prevScrollPos > currentScrollPos &&
                currentScrollPos >
                    navStartPos + navHeight + emPadding - windowHeight &&
                navHeight > windowHeight &&
                isScrollDown
            ) {
                // User is scrolling up, navigation height is greater than the screen height and navigation is pinned to the bottom
                navigationElement.classList.remove('pin-bottom');
                navigationElement.classList.add('pin-top-padded');
                this.setState({ isScrollDown: false });
            }
        } else {
            // Hide the "More" Navigation Menu for small devices
            if (isMoreNavigationVisible) {
                this.setNavigationVisibility('MoreNavigation', false);
                this.setState({ isMoreNavigationVisible: false });
            }

            if (prevScrollPos > currentScrollPos || currentScrollPos < 100) {
                // Show the secondary navigation when scrolling up
                if (isFeedsNavigationVisible) {
                    this.setNavigationVisibility('FeedsNavigation', true);
                } else if (isProfileNavigationVisible) {
                    this.setNavigationVisibility('ProfileNavigation', true);
                }
            } else {
                // Hide the secondary navigation when scrolling down
                this.setNavigationVisibility('FeedsNavigation', false);
                this.setNavigationVisibility('ProfileNavigation', false);
            }
        }
        this.setState({ prevScrollPos: currentScrollPos });
    };

    handleResize = () => {
        this.setState({ screenWidth: window.innerWidth });
        this.clearMoreNavigation();
        this.renderVisible();
    };

    setNavigationVisibility = (navigationId, isVisible) => {
        const navigationElement = document.getElementById(navigationId);
        if (navigationElement) {
            if (isVisible) {
                navigationElement.classList.add('visible');
            } else {
                navigationElement.classList.remove('visible');
            }
        }
    };

    toggleMoreNavigation = () => {
        const { screenWidth, snapWidth } = this.state;
        const isSnapWidth = screenWidth >= snapWidth;

        if (!isSnapWidth) {
            if (this.state.isMoreNavigationVisible) {
                this.setNavigationVisibility('MoreNavigation', false);
                this.setState({ isMoreNavigationVisible: false });
            } else {
                this.setNavigationVisibility('MoreNavigation', true);
                this.setState({ isMoreNavigationVisible: true });
            }
        }
    };

    clearMoreNavigation = () => {
        const { screenWidth, snapWidth } = this.state;
        const isSnapWidth = screenWidth >= snapWidth;

        if (!isSnapWidth) {
            this.setNavigationVisibility('MoreNavigation', false);
            this.setState({ isMoreNavigationVisible: false });
        }
    };

    renderVisible = () => {
        const { screenWidth, snapWidth } = this.state;
        let {
            section,
            isFeedsNavigationVisible,
            isProfileNavigationVisible,
            isOtherProfileVisible,
        } = this.state;
        const { username, routeTag, pathname } = this.props;
        let accountname, navUrl;

        const isSnapWidth = screenWidth >= snapWidth;

        isFeedsNavigationVisible = false;
        isProfileNavigationVisible = false;
        isOtherProfileVisible = false;

        let localPreviousUrl;
        if (process.env.BROWSER) {
            localPreviousUrl = localStorage.getItem('previousUrl');
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

        const navUrlComponents = navUrl.split('/');

        if (
            navUrlComponents[1] === `@${username}` &&
            navUrlComponents[2] === 'feed'
        ) {
            // Logged In User's Friends Feed (Explore > My Friends)
            isFeedsNavigationVisible = true;
            section = `/@${username}/${navUrlComponents[2]}`;
            accountname = username;
        } else if (navUrlComponents[1] === `@${username}`) {
            // Logged In User's Profile (My Profile > navUrlComponents[2])
            isProfileNavigationVisible = true;
            section = `/@${username}/${navUrlComponents[2]}`;
            if (navUrlComponents[2]) {
                section = `/${navUrlComponents[1]}/${navUrlComponents[2]}`;
            } else {
                section = `/${navUrlComponents[1]}/blog`;
            }
            accountname = username;
        } else if (
            navUrlComponents[1] !== `@${username}` &&
            navUrlComponents[1].startsWith('@') &&
            navUrlComponents[2] === 'feed'
        ) {
            // Another User's Friends Feed (Explore > @{accountname} > Friends Feed)
            if (isSnapWidth) {
                isFeedsNavigationVisible = true;
            }
            isProfileNavigationVisible = true;
            isOtherProfileVisible = true;
            section = `/${navUrlComponents[1]}/${navUrlComponents[2]}`;
            accountname = navUrlComponents[1].substring(1);
        } else if (
            navUrlComponents[1] !== `@${username}` &&
            navUrlComponents[1].startsWith('@')
        ) {
            // Another User's Profile (Explore > @{accountname} > navUrlComponents[2])
            if (isSnapWidth) {
                isFeedsNavigationVisible = true;
            }
            isProfileNavigationVisible = true;
            isOtherProfileVisible = true;
            if (navUrlComponents[2]) {
                section = `/${navUrlComponents[1]}/${navUrlComponents[2]}`;
            } else {
                section = `/${navUrlComponents[1]}/blog`;
            }
            accountname = navUrlComponents[1].substring(1);
        } else if (
            navUrlComponents[1] !== `@${username}` &&
            navUrlComponents[2] === 'my'
        ) {
            // Logged In User's Subscriptions (Explore > My Subscriptions)
            isFeedsNavigationVisible = true;
            section = '/trending/my';
        } else if (
            navUrlComponents[2] &&
            navUrlComponents[2].startsWith('hive-')
        ) {
            // Logged In User's Community (Explore > My Subscriptions > Community)
            isFeedsNavigationVisible = true;
            section = '/trending/my';
        } else {
            // Default State
            isFeedsNavigationVisible = true;
            section = '/trending';
        }

        if (isSnapWidth) {
            this.setNavigationVisibility('MoreNavigation', true);
        }

        this.setNavigationVisibility(
            'FeedsNavigation',
            isFeedsNavigationVisible
        );
        this.setNavigationVisibility(
            'ProfileNavigation',
            isProfileNavigationVisible
        );

        this.setState({
            navaccountname: accountname,
            navSection: section,
            isMoreNavigationVisible: isSnapWidth,
            isFeedsNavigationVisible,
            isProfileNavigationVisible,
            isOtherProfileVisible,
        });
    };

    render() {
        const {
            username,
            routeTag,
            category,
            topics,
            subscriptions,
            showLogin,
            walletUrl: walletUrlProp,
        } = this.props;

        const {
            navSection,
            isFeedsNavigationVisible,
            isProfileNavigationVisible,
            isMoreNavigationVisible,
            isOtherProfileVisible,
        } = this.state;
        const { navaccountname } = this.state;

        const walletUrlOther = `${walletUrlProp}/@${navaccountname}/transfers`;
        const walletUrl = `${walletUrlProp}/@${username}/transfers`;
        const settingsURL = `/@${username}/settings`;

        const tabLink = (tab, label, logo = null) => {
            const cls = tab === navSection ? 'active' : null;
            return (
                <Link
                    to={tab}
                    className={cls}
                    onClick={this.clearMoreNavigation}
                >
                    {logo && (
                        <span className="LogoWrapper">
                            <Icon name={logo} />
                        </span>
                    )}
                    <span className="Label">{label}</span>
                </Link>
            );
        };

        const primary_navigation = (
            <ul className="PrimaryNavTabs">
                <li
                    className={`${
                        isFeedsNavigationVisible || isOtherProfileVisible
                            ? 'active'
                            : ''
                    }`}
                >
                    {tabLink('/trending', tt('g.explore'), 'compass-outline')}
                    <ul
                        id="FeedsNavigation"
                        className={`navigation-list ${
                            isFeedsNavigationVisible ? 'visible' : ''
                        }`}
                    >
                        {username && (
                            <li>
                                {tabLink(
                                    '/trending',
                                    tt('g.posts_all'),
                                    'library-books'
                                )}
                            </li>
                        )}
                        {username && (
                            <li>
                                {tabLink(
                                    '/@' + username + '/feed',
                                    tt('g.my_friends'),
                                    'account-heart'
                                )}
                            </li>
                        )}
                        {username && (
                            <li>
                                {tabLink(
                                    '/trending/my',
                                    tt('g.my_subscriptions'),
                                    'account-group'
                                )}
                                {(navSection === '/trending/my' ||
                                    routeTag === 'community_index' ||
                                    routeTag === 'more_communities') && (
                                    <Topics
                                        username={username}
                                        current={category}
                                        topics={topics}
                                        subscriptions={subscriptions}
                                        compact={false}
                                    />
                                )}
                            </li>
                        )}
                        {navaccountname &&
                            navaccountname !== username && (
                                <li className="active">
                                    {tabLink(
                                        '/@' + navaccountname + '/posts',
                                        '@' + navaccountname,
                                        'person'
                                    )}
                                    <ul
                                        id="ProfileNavigation"
                                        className={`navigation-list ${
                                            isProfileNavigationVisible
                                                ? 'visible'
                                                : ''
                                        }`}
                                    >
                                        <li>
                                            {tabLink(
                                                '/@' + navaccountname + '/blog',
                                                tt('g.blog')
                                            )}
                                        </li>
                                        <li>
                                            {tabLink(
                                                '/@' +
                                                    navaccountname +
                                                    '/posts',
                                                tt('g.posts')
                                            )}
                                        </li>
                                        <li>
                                            {tabLink(
                                                '/@' +
                                                    navaccountname +
                                                    '/comments',
                                                tt('g.comments')
                                            )}
                                        </li>
                                        <li>
                                            {tabLink(
                                                '/@' +
                                                    navaccountname +
                                                    '/replies',
                                                tt('g.replies')
                                            )}
                                        </li>

                                        <li>
                                            <a
                                                href="#"
                                                onClick={event => {
                                                    event.preventDefault();
                                                    this.toggleMoreNavigation();
                                                }}
                                                className="More"
                                            >
                                                <span className="LogoWrapper">
                                                    <Icon name="menu" />
                                                </span>
                                                <span className="Label">
                                                    More...
                                                </span>
                                            </a>
                                            <ul
                                                id="MoreNavigation"
                                                className={`navigation-list ${
                                                    isMoreNavigationVisible
                                                        ? 'visible'
                                                        : ''
                                                }`}
                                            >
                                                <li>
                                                    {tabLink(
                                                        '/@' +
                                                            navaccountname +
                                                            '/notifications',
                                                        tt('g.notifications')
                                                    )}
                                                </li>
                                                {false && (
                                                    <li>
                                                        {tabLink(
                                                            '/@' +
                                                                navaccountname +
                                                                '/bookmarks',
                                                            tt('g.bookmarks'),
                                                            'bookmark'
                                                        )}
                                                    </li>
                                                )}
                                                <li>
                                                    {tabLink(
                                                        '/@' +
                                                            navaccountname +
                                                            '/communities',
                                                        tt('g.subscriptions')
                                                    )}
                                                </li>
                                                <li>
                                                    {tabLink(
                                                        '/@' +
                                                            navaccountname +
                                                            '/feed',
                                                        tt('g.friends_feed')
                                                    )}
                                                </li>
                                                <li>
                                                    {tabLink(
                                                        '/@' +
                                                            navaccountname +
                                                            '/payout',
                                                        tt('g.payouts')
                                                    )}
                                                </li>
                                                <li>
                                                    <a
                                                        href={walletUrlOther}
                                                        target="_blank"
                                                    >
                                                        <span className="Label">
                                                            {tt('g.wallet')}
                                                        </span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            )}
                    </ul>
                </li>
                {username && (
                    <li
                        className={`${
                            isProfileNavigationVisible && !isOtherProfileVisible
                                ? 'active'
                                : ''
                        }`}
                    >
                        {tabLink(
                            '/@' + username + '/posts',
                            tt('g.my_profile'),
                            'person'
                        )}
                        {username === navaccountname && (
                            <ul
                                id="ProfileNavigation"
                                className={`navigation-list ${
                                    isProfileNavigationVisible ? 'visible' : ''
                                }`}
                            >
                                <li>
                                    {tabLink(
                                        '/@' + username + '/blog',
                                        tt('g.blog'),
                                        'profile'
                                    )}
                                </li>
                                <li>
                                    {tabLink(
                                        '/@' + username + '/posts',
                                        tt('g.posts'),
                                        'library-books'
                                    )}
                                </li>
                                <li>
                                    {tabLink(
                                        '/@' + username + '/comments',
                                        tt('g.comments'),
                                        'chatbox'
                                    )}
                                </li>
                                <li>
                                    {tabLink(
                                        '/@' + username + '/replies',
                                        tt('g.replies'),
                                        'reply'
                                    )}
                                </li>

                                <li>
                                    <a
                                        href="#"
                                        onClick={event => {
                                            event.preventDefault();
                                            this.toggleMoreNavigation();
                                        }}
                                        className="More"
                                    >
                                        <span className="LogoWrapper">
                                            <Icon name="menu" />
                                        </span>
                                        <span className="Label">More...</span>
                                    </a>
                                    <ul
                                        id="MoreNavigation"
                                        className={`navigation-list ${
                                            isMoreNavigationVisible
                                                ? 'visible'
                                                : ''
                                        }`}
                                    >
                                        <li>
                                            {tabLink(
                                                '/@' +
                                                    username +
                                                    '/notifications',
                                                tt('g.notifications'),
                                                'clock'
                                            )}
                                        </li>
                                        {false && (
                                            <li>
                                                {tabLink(
                                                    '/@' +
                                                        username +
                                                        '/bookmarks',
                                                    tt('g.bookmarks'),
                                                    'bookmark'
                                                )}
                                            </li>
                                        )}
                                        <li>
                                            {tabLink(
                                                '/@' +
                                                    username +
                                                    '/communities',
                                                tt('g.subscriptions'),
                                                'account-group'
                                            )}
                                        </li>
                                        <li>
                                            {tabLink(
                                                '/@' + username + '/payout',
                                                tt('g.payouts'),
                                                'currency-usd'
                                            )}
                                        </li>
                                        <li>
                                            {tabLink(
                                                settingsURL,
                                                tt('g.settings'),
                                                'account-settings-variant'
                                            )}
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        )}
                    </li>
                )}
                {username && (
                    <li>
                        <a href={walletUrl} target="_blank">
                            <span className="LogoWrapper">
                                <Icon name="wallet_2" />
                            </span>
                            <span className="Label">{tt('g.my_wallet')}</span>
                        </a>
                    </li>
                )}
                {!username && (
                    <li>
                        <a href="/login.html" onClick={showLogin}>
                            <Icon name="person" />
                            <span className="Label">{tt('g.my_profile')}</span>
                        </a>
                    </li>
                )}
                {!username && (
                    <li>
                        <a href="/login.html" onClick={showLogin}>
                            <Icon name="wallet_2" />
                            <span className="Label">{tt('g.my_wallet')}</span>
                        </a>
                    </li>
                )}
            </ul>
        );

        return (
            <div id="appNavigation" className="App__navigation">
                <nav>
                    <div className="PrimaryNavigation">
                        {primary_navigation}
                    </div>
                </nav>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const walletUrl = state.app.get('walletUrl');
    const username =
        state.user.getIn(['current', 'username']) ||
        state.offchain.get('account');
    const pathname = state.global.get('pathname');
    const topics = state.global.getIn(['topics'], List());
    const subscriptions = state.global.getIn(['subscriptions', username]);

    return {
        walletUrl,
        username,
        pathname,
        topics,
        subscriptions,
    };
};

const mapDispatchToProps = dispatch => ({
    getSubscriptions: account =>
        dispatch(fetchDataSagaActions.getSubscriptions(account)),
    showLogin: e => {
        if (e) e.preventDefault();
        dispatch(userActions.showLogin({ type: 'basic' }));
    },
});

const connectedNavigation = connect(mapStateToProps, mapDispatchToProps)(
    PrimaryNavigation
);

export default connectedNavigation;
