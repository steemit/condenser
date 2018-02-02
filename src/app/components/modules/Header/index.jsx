import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Icon from 'app/components/elements/Icon';
import resolveRoute from 'app/ResolveRoute';
import tt from 'counterpart';
import { APP_NAME } from 'app/client_config';
import SortOrder from 'app/components/elements/SortOrder';
import SearchInput from 'app/components/elements/SearchInput';
import getPageTitle from 'app/utils/getPageTitle';
import IconButton from 'app/components/elements/IconButton';
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import Userpic from 'app/components/elements/Userpic';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import { SIGNUP_URL } from 'shared/constants';
import SteemLogo from 'app/components/elements/SteemLogo';

class Header extends React.Component {
    static propTypes = {
        current_account_name: React.PropTypes.string,
        account_meta: React.PropTypes.object,
        category: React.PropTypes.string,
        order: React.PropTypes.string,
        pathname: React.PropTypes.string,
    };

    constructor() {
        super();
    }

    // TODO: This should happen at a higher level as the header component is not ubiquitous.
    setPageTitle = () => {
        const route = resolveRoute(this.props.pathname);
        // HACK: We ought to have a better way of doing this rather than accessing global document.
        // e.g. https://github.com/gaearon/react-document-title
        const page_title = getPageTitle(route, this.props.account_meta);
        document.title = page_title + ' — ' + APP_NAME;
    };

    componentDidMount() {
        this.setPageTitle();
    }

    componentDidUpdate() {
        this.setPageTitle();
    }

    // Conside refactor.
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
            probablyLoggedIn,
            nightmodeEnabled,
            toggleNightmode,
            userPath,
            showSidePanel,
            navigate,
        } = this.props;

        const logo_link =
            resolveRoute(pathname).params &&
            resolveRoute(pathname).params.length > 1 &&
            this.last_sort_order
                ? '/' + this.last_sort_order
                : current_account_name ? `/@${current_account_name}/feed` : '/';

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

        const feed_link = `/@${username}/feed`;
        const replies_link = `/@${username}/recent-replies`;
        const wallet_link = `/@${username}/transfers`;
        const account_link = `/@${username}`;
        const comments_link = `/@${username}/comments`;
        const reset_password_link = `/@${username}/password`;
        const settings_link = `/@${username}/settings`;
        const pathCheck = userPath === '/submit.html' ? true : null;

        const user_menu = [
            {
                link: feed_link,
                icon: 'home',
                value: tt('g.feed'),
                addon: <NotifiCounter fields="feed" />,
            },
            { link: account_link, icon: 'profile', value: tt('g.blog') },
            { link: comments_link, icon: 'replies', value: tt('g.comments') },
            {
                link: replies_link,
                icon: 'reply',
                value: tt('g.replies'),
                addon: <NotifiCounter fields="comment_reply" />,
            },
            {
                link: wallet_link,
                icon: 'wallet',
                value: tt('g.wallet'),
                addon: (
                    <NotifiCounter fields="follow,send,receive,account_update" />
                ),
            },
            {
                link: '#',
                icon: 'eye',
                onClick: toggleNightmode,
                value: tt('g.toggle_nightmode'),
            },
            {
                link: reset_password_link,
                icon: 'key',
                value: tt('g.change_password'),
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
        return (
            <header className="Header">
                <nav className="row Header__nav">
                    <div className="small-5 large-4 columns Header__logotype">
                        {/*LOGO*/}
                        <Link to={logo_link}>
                            <SteemLogo />
                        </Link>
                    </div>

                    <div className="large-4 columns show-for-large large-centered Header__sort">
                        {/*SORT*/}
                        <SortOrder
                            sortOrder={order}
                            topic={category === 'feed' ? '' : category}
                            horizontal={true}
                        />
                    </div>
                    <div className="small-7 large-4 columns Header__buttons">
                        {/*NOT LOGGED IN SIGN IN AND SIGN UP LINKS*/}
                        {!loggedIn &&
                            !probablyLoggedIn && (
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
                            <SearchInput />
                        </span>
                        <span className="Header__search">
                            <a href="/static/search.html">
                                <IconButton icon="magnifyingGlass" />
                            </a>
                        </span>

                        {/*SUBMIT STORY*/}
                        {submit_story}

                        {/*USER AVATAR*/}
                        {loggedIn && (
                            <LinkWithDropdown
                                closeOnClickOutside
                                dropdownPosition="bottom"
                                dropdownAlignment="right"
                                dropdownContent={
                                    <VerticalMenu
                                        items={user_menu}
                                        title={username}
                                    />
                                }
                            >
                                {!vertical && (
                                    <li className={'Header__userpic '}>
                                        <a
                                            href={account_link}
                                            title={username}
                                            onClick={e => e.preventDefault()}
                                        >
                                            <Userpic account={username} />
                                        </a>
                                        <div className="TopRightMenu__notificounter">
                                            <NotifiCounter fields="total" />
                                        </div>
                                    </li>
                                )}
                            </LinkWithDropdown>
                        )}

                        {/*LOGGED IN LOADING INDICATOR*/}
                        {probablyLoggedIn && <LoadingIndicator type="circle" />}

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
            probablyLoggedIn: !!state.offchain.get('account'),
        };
    }

    const userPath = state.routing.locationBeforeTransitions.pathname;
    const username = state.user.getIn(['current', 'username']);
    const loggedIn = !!username;
    const account_user = state.global.get('accounts');
    const current_account_name = username
        ? username
        : state.offchain.get('account');

    return {
        username,
        loggedIn,
        userPath,
        probablyLoggedIn: false,
        nightmodeEnabled: state.user.getIn(['user_preferences', 'nightmode']),
        account_meta: account_user,
        current_account_name,
        ...ownProps,
    };
};

const mapDispatchToProps = dispatch => ({
    showLogin: e => {
        if (e) e.preventDefault();
        dispatch(userActions.showLogin());
    },
    logout: e => {
        if (e) e.preventDefault();
        dispatch(userActions.logout());
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
});

const connectedHeader = connect(mapStateToProps, mapDispatchToProps)(Header);

export default connectedHeader;
