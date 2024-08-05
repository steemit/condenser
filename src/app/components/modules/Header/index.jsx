/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable prefer-const */
/* eslint-disable no-multi-assign */
/* eslint-disable react/sort-comp */
/* eslint-disable consistent-return */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-undef */
/* eslint-disable import/first */
import React from 'react';
import PropTypes from 'prop-types';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { parseJsonTags } from 'app/utils/StateFunctions';
import Headroom from 'react-headroom';
import resolveRoute from 'app/ResolveRoute';
import tt from 'counterpart';
import { APP_NAME } from 'app/client_config';
import ElasticSearchInput from 'app/components/elements/ElasticSearchInput';
import IconButton from 'app/components/elements/IconButton';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import { startPolling } from 'app/redux/PollingSaga';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import Userpic from 'app/components/elements/Userpic';
import { SIGNUP_URL } from 'shared/constants';
import SteemLogo from 'app/components/elements/SteemLogo';
import Announcement from 'app/components/elements/Announcement';
import { Map } from 'immutable';
import ReactMutationObserver from '../../utils/ReactMutationObserver';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

class Header extends React.Component {
    static propTypes = {
        current_account_name: PropTypes.string,
        display_name: PropTypes.string,
        category: PropTypes.string,
        order: PropTypes.string,
        pathname: PropTypes.string,
        getUnreadAccountNotifications: PropTypes.func,
        startNotificationsPolling: PropTypes.func,
        loggedIn: PropTypes.bool,
        unreadNotificationCount: PropTypes.number,
    };

    constructor(props) {
        super(props);

        this.state = {
            showAd: false,
            showAnnouncement: this.props.showAnnouncement,
        };
        this.handleSignup = this.handleSignup.bind(this);
    }

    componentWillMount() {
        const {
            loggedIn,
            current_account_name,
            startNotificationsPolling,
        } = this.props;
        if (loggedIn) {
            startNotificationsPolling(current_account_name);
        }
    }

    componentDidMount() {
        if (
            !process.env.BROWSER ||
            !window.googletag ||
            !window.googletag.pubads
        ) {
            return null;
        }
    }

    componentWillUnmount() {
        if (
            !process.env.BROWSER ||
            !window.googletag ||
            !window.googletag.pubads
        ) {
            return null;
        }
    }

    // Consider refactor.
    // I think 'last sort order' is something available through react-router-redux history.
    // Therefore no need to store it in the window global like this.
    componentWillReceiveProps(nextProps) {
        if (nextProps.pathname !== this.props.pathname) {
            const route = resolveRoute(nextProps.pathname);
            if (
                route &&
                route.page === 'PostsIndex' &&
                route.params &&
                route.params.length > 0
            ) {
                const sort_order =
                    route.params[0] !== 'home' ? route.params[0] : null;
                if (sort_order)
                    window.last_sort_order = this.last_sort_order = sort_order;
            }
        }
    }

    handleSignup() {
        const { routeTag } = this.props;
        if (!routeTag) return;
        const signupUrl = routeTag
            ? `${SIGNUP_URL}/#source=condenser|${routeTag.routeTag}`
            : SIGNUP_URL;
        const new_window = window.open();
        new_window.opener = null;
        new_window.location = signupUrl;
    }

    headroomOnUnpin() {
        this.setState({ showAd: false });
    }

    headroomOnUnfix() {
        this.setState({ showAd: true });
    }

    hideAnnouncement() {
        this.setState({ showAnnouncement: false });
        this.props.hideAnnouncement();
    }

    render() {
        const {
            pathname,
            username,
            showLogin,
            logout,
            loggedIn,
            toggleNightmode,
            showSidePanel,
            navigate,
            display_name,
            content,
            walletUrl,
            unreadNotificationCount,
            notificationActionPending,
        } = this.props;

        let { showAd, showAnnouncement } = this.state;

        /*Set the document.title on each header render.*/
        const route = resolveRoute(pathname);
        let gptTags = [];
        let page_title = route.page;
        let sort_order = '';
        let topic = '';
        let page_name = null;
        if (route.page === 'PostsIndex') {
            sort_order = route.params[0];
            if (sort_order === 'home') {
                const user = `${route.params[1]}`.replace('@', '');
                if (user === username) {
                    page_title = tt('g.my_friends');
                } else if (user) {
                    page_title = user + "'s " + tt('g.friends');
                } else {
                    page_title = tt('g.my_friends');
                }
            } else {
                topic = route.params.length > 1 ? route.params[1] || '' : '';
                gptTags = [topic];

                let prefix = route.params[0];
                if (prefix == 'created') prefix = 'New';
                if (prefix == 'payout') prefix = 'Pending';
                if (prefix == 'payout_comments') prefix = 'Pending';
                if (prefix == 'muted') prefix = 'Muted';
                page_title = prefix;
                if (topic !== '') {
                    let name = this.props.community.getIn(
                        [topic, 'title'],
                        '#' + topic
                    );
                    if (name == '#my') name = 'My Communities';
                    page_title = `${name} / ${page_title}`;
                } else {
                    page_title += ' posts';
                }
            }
        } else if (route.page === 'Post') {
            if (content) {
                const user = `${route.params[1]}`.replace('@', '');
                const slug = `${route.params[2]}`;
                const post = content.get(`${user}/${slug}`);
                gptTags = post ? parseJsonTags(post) : [];
            }
            sort_order = '';
            topic = route.params[0];
        } else if (route.page == 'SubmitPost') {
            page_title = tt('header_jsx.create_a_post');
        } else if (route.page == 'Privacy') {
            page_title = tt('navigation.privacy_policy');
        } else if (route.page == 'Tos') {
            page_title = tt('navigation.terms_of_service');
        } else if (route.page == 'CommunityRoles') {
            page_title = 'Community Roles';
        } else if (route.page === 'UserProfile') {
            const user_name = route.params[0].slice(1);
            const user_title = display_name
                ? `${display_name} (@${user_name})`
                : user_name;
            page_title = user_title;
            if (route.params[1] === 'followers') {
                page_title = tt('header_jsx.people_following', {
                    username: user_title,
                });
            }
            if (route.params[1] === 'followed') {
                page_title = tt('header_jsx.people_followed_by', {
                    username: user_title,
                });
            }
            if (route.params[1] === 'replies') {
                page_title = tt('header_jsx.replies_to', {
                    username: user_title,
                });
            }
            if (route.params[1] === 'posts') {
                page_title = tt('header_jsx.posts_by', {
                    username: user_title,
                });
            }
            if (route.params[1] === 'comments') {
                page_title = tt('header_jsx.comments_by', {
                    username: user_title,
                });
            }
        } else {
            page_name = ''; //page_title = route.page.replace( /([a-z])([A-Z])/g, '$1 $2' ).toLowerCase();
        }

        // Format first letter of all titles and lowercase user name
        if (route.page !== 'UserProfile') {
            page_title =
                page_title.charAt(0).toUpperCase() + page_title.slice(1);
        }

        if (
            process.env.BROWSER &&
            (route.page !== 'Post' && route.page !== 'PostNoCategory')
        )
            document.title = page_title + ' — ' + APP_NAME;

        //const _feed = current_account_name && `/@${current_account_name}/feed`;
        //const logo_link = _feed && pathname != _feed ? _feed : '/';
        const logo_link = '/';

        //TopRightHeader Stuff
        const defaultNavigate = e => {
            if (e.metaKey || e.ctrlKey) {
                // prevent breaking anchor tags
            } else {
                e.preventDefault();
            }
            const a =
                e.target.nodeName.toLowerCase() === 'a'
                    ? e.target
                    : e.target.parentNode;
            browserHistory.push(a.pathname + a.search + a.hash);
        };

        // Since navigate isn't set, defaultNavigate will always be used.
        const nav = navigate || defaultNavigate;

        const checkIfLogin = () => {
            if (!loggedIn) {
                return showLogin();
            }
            return browserHistory.replace('/submit.html');
        };

        const submit_story = $STM_Config.read_only_mode ? null : (
            <Link onClick={checkIfLogin}>
                <IconButton />
            </Link>
        );

        const replies_link = `/@${username}/replies`;
        const account_link = `/@${username}/posts`;
        const comments_link = `/@${username}/comments`;
        const notifs_link = `/@${username}/notifications`;
        const wallet_link = `${walletUrl}/@${username}`;
        const notif_label =
            tt('g.notifications') +
            (unreadNotificationCount > 0
                ? ` (${unreadNotificationCount})`
                : '');

        const user_menu = [
            { link: account_link, icon: 'person', value: tt('g.profile') },
            { link: notifs_link, icon: 'clock', value: notif_label },
            { link: comments_link, icon: 'chatbox', value: tt('g.comments') },
            { link: replies_link, icon: 'reply', value: tt('g.replies') },
            //{ link: settings_link, icon: 'cog', value: tt('g.settings') },
            {
                link: '#',
                icon: 'eye',
                onClick: toggleNightmode,
                value: tt('g.toggle_nightmode'),
            },
            { link: wallet_link, icon: 'wallet', value: tt('g.wallet') },
            {
                link: '#',
                icon: 'enter',
                onClick: logout,
                value: tt('g.logout'),
            },
        ];
        const headerMutated = (mutation, discconnectObserver) => {
            if (mutation.target.id.indexOf('google_ads_iframe_') !== -1) {
                if (typeof discconnectObserver === 'function') {
                    discconnectObserver();
                }
            }
        };
        return (
            <ReactMutationObserver onChildListChanged={headerMutated}>
                <Headroom
                    onUnpin={e => this.headroomOnUnpin(e)}
                    onUnfix={e => this.headroomOnUnfix(e)}
                >
                    <header className="Header">
                        {showAnnouncement && (
                            <Announcement
                                onClose={e => this.hideAnnouncement(e)}
                            />
                        )}
                        {/*<div className="beta-disclaimer">
                            Viewing <strong>Steemit.com beta</strong>. Note that
                            availability of features or service may change at
                            any time.
                        </div>*/}
                        {/* If announcement is shown, ad will not render unless it's in a parent div! */}
                        <nav className="row Header__nav">
                            <div className="small-6 medium-4 large-4 columns Header__logotype">
                                <Link to={logo_link}>
                                    <SteemLogo />
                                </Link>
                            </div>

                            <div className="large-1 columns show-for-large large-centered Header__sort">
                                {/*
                                <SortOrder
                                    sortOrder={order}
                                    topic={category === 'feed' ? '' : category}
                                    horizontal
                                    pathname={pathname}
                                />
                                */}
                            </div>

                            <div className="small-6 medium-8 large-7 columns Header__buttons">
                                {/*CUSTOM SEARCH*/}
                                <span
                                    className="Header__search--desktop--new"
                                    style={{ marginRight: 20 }}
                                >
                                    <ElasticSearchInput
                                        addHistory={true}
                                        redirect
                                    />
                                </span>
                                <span className="Header__search">
                                    <Link to="/search">
                                        <IconButton icon="magnifyingGlass" />
                                    </Link>
                                </span>

                                {/*NOT LOGGED IN SIGN IN AND SIGN UP LINKS*/}
                                {!loggedIn && (
                                    <span className="Header__user-signup show-for-medium">
                                        <a
                                            className="Header__login-link"
                                            href="/login.html"
                                            onClick={showLogin}
                                        >
                                            {tt('g.login')}
                                        </a>
                                        <a
                                            className="Header__signup-link"
                                            onClick={this.handleSignup}
                                        >
                                            {tt('g.sign_up')}
                                        </a>
                                    </span>
                                )}

                                {/*SUBMIT STORY*/}
                                {submit_story}
                                {/*USER AVATAR */}
                                {loggedIn && (
                                    <DropdownMenu
                                        className={'Header__usermenu'}
                                        items={user_menu}
                                        title={username}
                                        el="span"
                                        position="left"
                                    >
                                        <li className={'Header__userpic '}>
                                            <Userpic account={username} />
                                        </li>
                                        {!notificationActionPending &&
                                            unreadNotificationCount > 0 && (
                                                <div
                                                    className={
                                                        'Header__notification'
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            unreadNotificationCount
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                    </DropdownMenu>
                                )}
                                {/*HAMBURGER*/}
                                <span
                                    onClick={e => {
                                        showSidePanel();
                                        e.nativeEvent.stopImmediatePropagation();
                                    }}
                                    className="toggle-menu Header__hamburger"
                                >
                                    <span className="hamburger" />
                                </span>
                            </div>
                        </nav>
                    </header>
                </Headroom>
            </ReactMutationObserver>
        );
    }
}

export { Header as _Header_ };

const mapStateToProps = (state, ownProps) => {
    // SSR code split.
    if (!process.env.BROWSER) {
        return {
            username: null,
            loggedIn: false,
            community: state.global.get('community', Map({})),
        };
    }

    // display name used in page title
    let display_name;
    const route = resolveRoute(ownProps.pathname);
    if (route.page === 'UserProfile') {
        display_name = state.userProfiles.getIn(
            [
                'profiles',
                route.params[0].slice(1),
                'metadata',
                'profile',
                'name',
            ],
            null
        );
    }

    const username = state.user.getIn(['current', 'username']);
    const loggedIn = !!username;
    const current_account_name = username
        ? username
        : state.offchain.get('account');

    const gptEnabled = state.app.getIn(['googleAds', 'gptEnabled']);
    const content = state.global.get('content'); // TODO: needed for SSR?
    let unreadNotificationCount = 0;
    if (
        loggedIn &&
        state.global.getIn([
            'notifications',
            current_account_name,
            'unreadNotifications',
        ])
    ) {
        unreadNotificationCount = state.global.getIn([
            'notifications',
            current_account_name,
            'unreadNotifications',
            'unread',
        ]);
    }

    return {
        username,
        loggedIn,
        community: state.global.get('community', Map({})),
        nightmodeEnabled: state.app.getIn(['user_preferences', 'nightmode']),
        display_name,
        current_account_name,
        showAnnouncement: state.user.get('showAnnouncement'),
        walletUrl: state.app.get('walletUrl'),
        gptEnabled,
        content,
        unreadNotificationCount,
        notificationActionPending: state.global.getIn([
            'notifications',
            'loading',
        ]),
        routeTag: state.app.has('routeTag') ? state.app.get('routeTag') : null,
        ...ownProps,
    };
};

const mapDispatchToProps = dispatch => ({
    showLogin: e => {
        if (e) e.preventDefault();
        dispatch(userActions.showLogin({ type: 'basic' }));
    },
    logout: e => {
        if (e) e.preventDefault();
        dispatch(userActions.logout({ type: 'default' }));
    },
    toggleNightmode: e => {
        if (e) e.preventDefault();
        dispatch(appActions.toggleNightmode());
    },
    showSidePanel: () => {
        dispatch(userActions.showSidePanel());
    },
    hideSidePanel: () => {
        dispatch(userActions.hideSidePanel());
    },
    getUnreadAccountNotifications: username => {
        const query = {
            account: username,
        };
        return dispatch(
            fetchDataSagaActions.getUnreadAccountNotifications(query)
        );
    },
    hideAnnouncement: () => dispatch(userActions.hideAnnouncement()),
    startNotificationsPolling: username => {
        const query = {
            account: username,
        };
        const params = {
            pollAction: fetchDataSagaActions.getUnreadAccountNotifications,
            pollPayload: query,
            delay: 600000, // The delay between successive polls
        };
        return dispatch(startPolling(params));
    },
});

const connectedHeader = connect(mapStateToProps, mapDispatchToProps)(Header);

export default connectedHeader;
