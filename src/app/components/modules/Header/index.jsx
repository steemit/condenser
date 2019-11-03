import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { immutableAccessor } from 'app/utils/Accessors';
import { parseJsonTags } from 'app/utils/StateFunctions';
import Headroom from 'react-headroom';
import Icon from 'app/components/elements/Icon';
import resolveRoute from 'app/ResolveRoute';
import tt from 'counterpart';
import { APP_NAME } from 'app/client_config';
import SortOrder from 'app/components/elements/SortOrder';
import ElasticSearchInput from 'app/components/elements/ElasticSearchInput';
import IconButton from 'app/components/elements/IconButton';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import Userpic from 'app/components/elements/Userpic';
import { SIGNUP_URL } from 'shared/constants';
import SteemLogo from 'app/components/elements/SteemLogo';
import Announcement from 'app/components/elements/Announcement';
import GptAd from 'app/components/elements/GptAd';
import { Map } from 'immutable';

class Header extends React.Component {
    static propTypes = {
        current_account_name: PropTypes.string,
        display_name: PropTypes.string,
        category: PropTypes.string,
        order: PropTypes.string,
        pathname: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.state = {
            gptAdRendered: false,
            showAd: false,
            showAnnouncement: this.props.showAnnouncement,
        };
    }

    componentDidMount() {
        if (
            !this.props.gptEnabled ||
            !process.env.BROWSER ||
            !window.googletag ||
            !window.googletag.pubads
        ) {
            return null;
        }

        window.addEventListener('gptadshown', e => this.gptAdRendered(e));
    }

    componentWillUnmount() {
        if (
            !this.props.gptEnabled ||
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

    headroomOnUnpin() {
        this.setState({ showAd: false });
    }

    headroomOnUnfix() {
        this.setState({ showAd: true });
    }

    gptAdRendered() {
        this.setState({ showAd: true, gptAdRendered: true });
    }

    hideAnnouncement() {
        this.setState({ showAnnouncement: false });
        this.props.hideAnnouncement();
    }

    render() {
        const {
            category,
            order,
            pathname,
            current_account_name,
            username,
            showLogin,
            logout,
            loggedIn,
            vertical,
            nightmodeEnabled,
            toggleNightmode,
            showSidePanel,
            navigate,
            display_name,
            content,
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
                page_title = 'My Friends'; //tt('header_jsx.home');
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
            if (route.params[1] === 'recent-replies') {
                page_title = tt('header_jsx.replies_to', {
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

        const submit_story = $STM_Config.read_only_mode ? null : (
            <Link to="/submit.html">
                <IconButton />
            </Link>
        );

        const replies_link = `/@${username}/recent-replies`;
        const account_link = `/@${username}`;
        const comments_link = `/@${username}/comments`;
        const settings_link = `/@${username}/settings`;
        const notifs_link = `/@${username}/notifications`;

        const user_menu = [
            { link: account_link, icon: 'profile', value: tt('g.blog') },
            { link: comments_link, icon: 'replies', value: tt('g.posts') },
            { link: replies_link, icon: 'reply', value: tt('g.replies') },
            { link: notifs_link, icon: 'clock', value: tt('g.notifications') },
            {
                link: '#',
                icon: 'eye',
                onClick: toggleNightmode,
                value: tt('g.toggle_nightmode'),
            },
            { link: settings_link, icon: 'cog', value: tt('g.settings') },
            loggedIn
                ? {
                      link: '#',
                      icon: 'enter',
                      onClick: logout,
                      value: tt('g.logout'),
                  }
                : { link: '#', onClick: showLogin, value: tt('g.login') },
        ];
        showAd = true;
        return (
            <Headroom
                onUnpin={e => this.headroomOnUnpin(e)}
                onUnfix={e => this.headroomOnUnfix(e)}
            >
                <header className="Header">
                    {showAnnouncement && (
                        <Announcement onClose={e => this.hideAnnouncement(e)} />
                    )}
                    {/* If announcement is shown, ad will not render unless it's in a parent div! */}
                    <div style={showAd ? {} : { display: 'none' }}>
                        <GptAd
                            tags={gptTags}
                            type="Freestar"
                            id="bsa-zone_1566493796250-1_123456"
                        />
                    </div>

                    <nav className="row Header__nav">
                        <div className="small-6 medium-4 large-4 columns Header__logotype">
                            <Link to={logo_link}>
                                <SteemLogo />
                            </Link>
                        </div>

                        <div className="large-4 columns show-for-large large-centered Header__sort">
                            {/*
                            <SortOrder
                                sortOrder={order}
                                topic={category === 'feed' ? '' : category}
                                horizontal
                                pathname={pathname}
                            />
                            */}
                        </div>

                        <div className="small-6 medium-8 large-4 columns Header__buttons">
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
                                        href={SIGNUP_URL}
                                    >
                                        {tt('g.sign_up')}
                                    </a>
                                </span>
                            )}

                            {/*CUSTOM SEARCH*/}
                            <span className="Header__search--desktop">
                                <ElasticSearchInput />
                            </span>
                            <span className="Header__search">
                                <a href="/static/search.html">
                                    <IconButton icon="magnifyingGlass" />
                                </a>
                            </span>

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
                                </DropdownMenu>
                            )}
                            {/*HAMBURGER*/}
                            <span
                                onClick={showSidePanel}
                                className="toggle-menu Header__hamburger"
                            >
                                <span className="hamburger" />
                            </span>
                        </div>
                    </nav>
                </header>
            </Headroom>
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

    return {
        username,
        loggedIn,
        community: state.global.get('community', Map({})),
        nightmodeEnabled: state.user.getIn(['user_preferences', 'nightmode']),
        display_name,
        current_account_name,
        showAnnouncement: state.user.get('showAnnouncement'),
        gptEnabled,
        content,
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
    hideAnnouncement: () => dispatch(userActions.hideAnnouncement()),
});

const connectedHeader = connect(mapStateToProps, mapDispatchToProps)(Header);

export default connectedHeader;
