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

// From TopRightMenu
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import Userpic from 'app/components/elements/Userpic';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import { SIGNUP_URL } from 'shared/constants';

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
        // Also this only happens where the Header Component is present...
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

        // Logo should really always go to the same place.
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

        const mcn = 'menu' + (vertical ? ' vertical show-for-small-only' : '');
        const mcl = vertical ? '' : ' sub-menu';
        const lcn = vertical ? '' : 'show-for-medium';
        // Since navigate isn't set, defaultNavigate will always be used.
        const nav = navigate || defaultNavigate;

        const submit_story = $STM_Config.read_only_mode ? null : (
            <li className={lcn + ' submit-story' + (vertical ? ' last' : '')}>
                <a href="/submit.html" onClick={nav}>
                    {tt('g.submit_a_story')}
                </a>
            </li>
        );

        const submit_icon = $STM_Config.read_only_mode ? null : (
            <li className="show-for-small-only">
                <Link to="/submit.html">
                    <Icon name="pencil2" />
                </Link>
            </li>
        );

        const feed_link = `/@${username}/feed`;
        const replies_link = `/@${username}/recent-replies`;
        const wallet_link = `/@${username}/transfers`;
        const account_link = `/@${username}`;
        const comments_link = `/@${username}/comments`;
        const reset_password_link = `/@${username}/password`;
        const settings_link = `/@${username}/settings`;
        const pathCheck = userPath === '/submit.html' ? true : null;

        // change back to if(username) after bug fix:  Clicking on Login does not cause drop-down to close #TEMP!
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
            <header className="Header noPrint">
                <div className="Header__top header">
                    <div className="expanded row">
                        <div className="columns">
                            <ul className="menu Header__menu">
                                <li>
                                    <Link to={logo_link}>
                                        <svg
                                            className="Header__logotype"
                                            width="148"
                                            height="38"
                                            viewBox="0 0 148 38"
                                            version="1.1"
                                        >
                                            <title>Steemit Logo</title>
                                            <g
                                                stroke="none"
                                                strokeWidth="1"
                                                fill="none"
                                                fillRule="evenodd"
                                            >
                                                <g
                                                    className="icon-svg"
                                                    fillRule="nonzero"
                                                >
                                                    <path
                                                        d="M49,24.015935 C49.4429506,26.9151335 51.8962153,28.6681372 55.43982,28.6681372 C58.8471321,28.6681372 61.33447,26.8477103 61.33447,23.8810886 C61.33447,21.689834 60.0396914,20.2402347 57.4501341,19.6334258 L54.2472607,18.8917704 C53.1569208,18.6220775 52.6798971,18.1838265 52.6798971,17.5095944 C52.6798971,16.329688 53.9065295,15.7903022 55.0990888,15.7903022 C56.6664524,15.7903022 57.5523535,16.4645344 57.8590116,17.4421711 L61.1981775,17.4421711 C60.6870807,14.7115307 58.6767665,13.0259503 55.1331619,13.0259503 C51.8280691,13.0259503 49.4088775,15.0149352 49.4088775,17.711864 C49.4088775,20.1728115 51.0103142,21.3190062 53.1569208,21.8246804 L56.291648,22.5663358 C57.5523535,22.8697403 58.0634503,23.3079913 58.0634503,24.1170699 C58.0634503,25.2969762 57.0412567,25.9037852 55.4738931,25.9037852 C53.9746757,25.9037852 52.8502627,25.2632646 52.4754584,24.015935 L49,24.015935 Z M65.4573177,24.2856279 C65.4573177,27.2522496 67.3654125,28.6681372 70.0571891,28.6681372 C71.1134559,28.6681372 72.0334302,28.4658675 72.6126732,28.1287514 L72.6126732,25.060995 C72.1356495,25.3981111 71.3519677,25.6678039 70.6705053,25.6678039 C69.5460923,25.6678039 68.8646298,25.1284182 68.8646298,23.9148002 L68.8646298,16.16113 L72.271942,16.16113 L72.271942,13.3630664 L68.8646298,13.3630664 L68.8646298,9.35138478 L65.4573177,9.35138478 L65.4573177,11.0538211 C65.4573177,11.2294024 65.4573177,11.439697 65.4573177,11.6847049 C65.4573177,12.8974247 64.4479015,13.3630664 63.7557912,13.3630664 C63.2943843,13.3630664 63.0665204,13.3630664 63.0721992,13.3630664 L63.0721992,16.16113 L65.4573177,16.16113 L65.4573177,24.2856279 Z M140.737621,24.2856279 C140.737621,27.2522496 142.645715,28.6681372 145.337492,28.6681372 C146.393759,28.6681372 147.313733,28.4658675 147.892976,28.1287514 L147.892976,25.060995 C147.415953,25.3981111 146.632271,25.6678039 145.950808,25.6678039 C144.826395,25.6678039 144.144933,25.1284182 144.144933,23.9148002 L144.144933,16.16113 L147.552245,16.16113 L147.552245,13.3630664 L144.144933,13.3630664 L144.144933,9.35138478 L140.737621,9.35138478 L140.737621,11.0538211 C140.737621,11.2294024 140.737621,11.439697 140.737621,11.6847049 C140.737621,12.8974247 139.728205,13.3630664 139.036094,13.3630664 C138.574687,13.3630664 138.346823,13.3630664 138.352502,13.3630664 L138.352502,16.16113 L140.737621,16.16113 L140.737621,24.2856279 Z M85.2112099,23.6788189 L88.3459371,23.6788189 C87.8348403,26.6454406 85.6200874,28.6681372 81.9742634,28.6681372 C77.7491963,28.6681372 74.8189078,25.4992459 74.8189078,20.8807553 C74.8189078,16.3971113 77.7832694,13.0259503 81.9061171,13.0259503 C86.1652573,13.0259503 88.4822296,16.0262835 88.4822296,20.4087928 L88.4822296,21.6224107 L78.1580738,21.6224107 C78.2602931,24.2519163 79.7935836,25.836362 81.9742634,25.836362 C83.6097732,25.836362 84.8364056,25.1284182 85.2112099,23.6788189 Z M81.9401902,15.8577255 C80.0661685,15.8577255 78.6691706,17.0039202 78.2602931,19.1614632 L85.1089905,19.1614632 C85.0749174,17.3410363 84.0186507,15.8577255 81.9401902,15.8577255 Z M100.952992,23.6788189 L104.087719,23.6788189 C103.576622,26.6454406 101.36187,28.6681372 97.7160455,28.6681372 C93.4909785,28.6681372 90.5606901,25.4992459 90.5606901,20.8807553 C90.5606901,16.3971113 93.5250516,13.0259503 97.6478993,13.0259503 C101.907039,13.0259503 104.224012,16.0262835 104.224012,20.4087928 L104.224012,21.6224107 L93.8998558,21.6224107 C94.0020751,24.2519163 95.5353656,25.836362 97.7160455,25.836362 C99.3515552,25.836362 100.578188,25.1284182 100.952992,23.6788189 Z M97.6819724,15.8577255 C95.8079509,15.8577255 94.4109529,17.0039202 94.0020751,19.1614632 L100.850773,19.1614632 C100.816699,17.3410363 99.760433,15.8577255 97.6819724,15.8577255 Z M118.428244,15.0149352 C117.644563,13.8687405 116.145345,13.0259503 114.441689,13.0259503 C112.738033,13.0259503 111.375108,13.6664708 110.659573,14.6103959 L110.659573,13.3630664 L107.25226,13.3630664 L107.25226,28.3310211 L110.659573,28.3310211 L110.659573,18.2849614 C110.966231,16.8016506 112.124717,16.0599951 113.351349,16.0599951 C115.020932,16.0599951 115.838687,17.2736131 115.838687,19.1277516 L115.838687,28.3310211 L119.245999,28.3310211 L119.245999,18.2849614 C119.552657,16.8016506 120.711143,16.0599951 121.937776,16.0599951 C123.607359,16.0599951 124.425114,17.2736131 124.425114,19.1277516 L124.425114,28.3310211 L127.832426,28.3310211 L127.832426,18.5883659 C127.832426,15.1834933 126.02655,13.0259503 122.925896,13.0259503 C120.881509,13.0259503 119.484511,13.8013173 118.428244,15.0149352 Z M135.247589,13.3209268 L131.840277,13.3209268 L131.840277,28.2888816 L135.247589,28.2888816 L135.247589,13.3209268 Z M135.673503,9.10697561 C135.673503,7.93259576 134.677414,7 133.543933,7 C132.410452,7 131.414363,7.93259576 131.414363,9.10697561 C131.414363,10.2813555 132.410452,11.2139512 133.543933,11.2139512 C134.677414,11.2139512 135.673503,10.2813555 135.673503,9.10697561 Z"
                                                        className="icon-svg__shape"
                                                    />
                                                    <path
                                                        d="M32.7004951,11.3807248 C31.1310771,9.81140963 29.3043776,8.66313021 27.3619013,7.92312792 C28.4939405,4.59311764 32.5075339,3.38104493 32.5075339,3.38104493 C32.5075339,3.38104493 23.1424826,-1.48000457 12.7997611,0.459311764 C9.35218721,1.00793415 6.0461183,3.12587173 3.62767097,5.92001831 C-1.62087426,11.9803819 -0.926213868,21.1028239 5.18422484,26.3083572 C6.1233028,27.1121528 8.22014805,28.3625014 8.2587403,28.4262947 C6.8822836,31.9221676 2.48276772,32.8790671 2.48276772,32.8790671 C2.48276772,32.8790671 8.29733255,36.5152853 16.10583,37.4594261 C18.1769471,37.7145993 20.3767051,37.7783926 22.6536475,37.5359781 C26.2684544,37.2425289 29.8703972,35.3287299 32.6104465,32.6366526 C38.5407881,26.7931863 38.5922444,17.2752258 32.7004951,11.3807248 Z M30.0247661,30.3145765 C27.8121441,32.4835487 24.5060752,33.861484 21.9589871,34.0528639 C20.1580157,34.2314851 18.2284034,34.2570024 16.3759757,34.0273465 C13.6487905,33.6956214 11.680586,32.9428604 9.75097374,32.2156168 C10.7286439,31.271476 11.7063141,29.9700926 12.1051006,28.8473305 C12.3623823,28.1838802 12.3366541,27.4438779 12.0279162,26.7931863 C9.95679906,22.5317938 10.8572848,17.4283297 14.2662664,14.1110781 C16.73617,11.6996913 20.1322875,10.5641706 23.5798614,10.9852064 C26.1140854,11.2914142 28.416756,12.4014176 30.2177274,14.2003887 C34.5915151,18.5893678 34.4371461,26.014908 30.0247661,30.3145765 Z"
                                                        className="icon-svg__shape"
                                                    />
                                                </g>
                                            </g>
                                        </svg>
                                    </Link>
                                </li>
                                <li className="Header__top-steemit show-for-medium noPrint">
                                    <Link to={logo_link}>
                                        <span className="beta fade-in--10">
                                            beta
                                        </span>
                                    </Link>
                                </li>
                                <span className="show-for-large">
                                    {/*TODO must hide this if it is blog view... i.e @username only.
                                        or make sure that when order / category are not what we want
                                        sort order defaults.
                                    */}
                                    <SortOrder
                                        sortOrder={order}
                                        topic={category}
                                        horizontal={true}
                                    />
                                </span>
                                <SearchInput />
                            </ul>
                        </div>
                        <div className="columns shrink">
                            {loggedIn && (
                                <ul className={mcn + mcl}>
                                    {!pathCheck ? submit_story : null}
                                    {!vertical && submit_icon}
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
                                            <li
                                                className={
                                                    'TopRightMenu__userpic '
                                                }
                                            >
                                                <a
                                                    href={account_link}
                                                    title={username}
                                                    onClick={e =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    <Userpic
                                                        account={username}
                                                    />
                                                </a>
                                                <div className="TopRightMenu__notificounter">
                                                    <NotifiCounter fields="total" />
                                                </div>
                                            </li>
                                        )}
                                    </LinkWithDropdown>
                                    <li className="toggle-menu TopRightMenu__hamburger">
                                        <a href="#" onClick={showSidePanel}>
                                            <span className="hamburger" />
                                        </a>
                                    </li>
                                </ul>
                            )}
                            {probablyLoggedIn && (
                                <ul className={mcn + mcl}>
                                    <li
                                        className={lcn}
                                        style={{
                                            paddingTop: 0,
                                            paddingBottom: 0,
                                        }}
                                    >
                                        <LoadingIndicator
                                            type="circle"
                                            inline
                                        />
                                    </li>
                                    <li className="toggle-menu TopRightMenu__hamburger">
                                        <a href="#" onClick={showSidePanel}>
                                            <span className="hamburger" />
                                        </a>
                                    </li>
                                </ul>
                            )}
                            {!loggedIn &&
                                !probablyLoggedIn && (
                                    <ul className={mcn + mcl}>
                                        <li className={lcn}>
                                            <a href={SIGNUP_URL}>
                                                {tt('g.sign_up')}
                                            </a>
                                        </li>
                                        <li className={lcn}>
                                            <a
                                                href="/login.html"
                                                onClick={showLogin}
                                            >
                                                {tt('g.login')}
                                            </a>
                                        </li>
                                        {submit_story}
                                        {!vertical && submit_icon}
                                        <li className="toggle-menu TopRightMenu__hamburger">
                                            <a href="#" onClick={showSidePanel}>
                                                <span className="hamburger" />
                                            </a>
                                        </li>
                                    </ul>
                                )}
                        </div>
                    </div>
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Header);
