import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import TopRightMenu from 'app/components/modules/TopRightMenu';
import Icon from 'app/components/elements/Icon';
import resolveRoute from 'app/ResolveRoute';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import HorizontalMenu from 'app/components/elements/HorizontalMenu';
import normalizeProfile from 'app/utils/NormalizeProfile';
import tt from 'counterpart';
import { APP_NAME } from 'app/client_config';

function sortOrderToLink(so, topic, account) {
    if (so === 'home') return '/@' + account + '/feed';
    if (topic) return `/${so}/${topic}`;
    return `/${so}`;
}

class Header extends React.Component {
    static propTypes = {
        location: React.PropTypes.object.isRequired,
        current_account_name: React.PropTypes.string,
        account_meta: React.PropTypes.object,
    };

    constructor() {
        super();
        this.state = { subheader_hidden: false };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Header');
        this.hideSubheader = this.hideSubheader.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.hideSubheader, {
            capture: false,
            passive: true,
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            const route = resolveRoute(nextProps.location.pathname);
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

    componentWillUnmount() {
        window.removeEventListener('scroll', this.hideSubheader);
    }

    hideSubheader() {
        const subheader_hidden = this.state.subheader_hidden;
        const y =
            window.scrollY >= 0
                ? window.scrollY
                : document.documentElement.scrollTop;
        if (y === this.prevScrollY) return;

        if (y < 5) {
            this.setState({ subheader_hidden: false });
        } else if (y > this.prevScrollY) {
            if (!subheader_hidden) this.setState({ subheader_hidden: true });
        } else {
            if (subheader_hidden) this.setState({ subheader_hidden: false });
        }
        this.prevScrollY = y;
    }

    render() {
        const route = resolveRoute(this.props.location.pathname);
        const current_account_name = this.props.current_account_name;
        let home_account = false;
        let page_title = route.page;

        let sort_order = '';
        let topic = '';
        let user_name = null;
        let page_name = null;
        this.state.subheader_hidden = false;
        if (route.page === 'PostsIndex') {
            sort_order = route.params[0];
            if (sort_order === 'home') {
                page_title = tt('header_jsx.home');
                const account_name = route.params[1];
                if (
                    current_account_name &&
                    account_name.indexOf(current_account_name) === 1
                )
                    home_account = true;
            } else {
                topic = route.params.length > 1 ? route.params[1] : '';
                const type =
                    route.params[0] == 'payout_comments' ? 'comments' : 'posts';
                let prefix = route.params[0];
                if (prefix == 'created') prefix = 'New';
                if (prefix == 'payout') prefix = 'Pending payout';
                if (prefix == 'payout_comments') prefix = 'Pending payout';
                if (topic !== '') prefix += ` ${topic}`;
                page_title = `${prefix} ${type}`;
            }
        } else if (route.page === 'Post') {
            sort_order = '';
            topic = route.params[0];
        } else if (route.page == 'SubmitPost') {
            page_title = tt('header_jsx.create_a_post');
        } else if (route.page == 'Privacy') {
            page_title = tt('navigation.privacy_policy');
        } else if (route.page == 'Tos') {
            page_title = tt('navigation.terms_of_service');
        } else if (route.page == 'ChangePassword') {
            page_title = tt('header_jsx.change_account_password');
        } else if (route.page == 'CreateAccount') {
            page_title = tt('header_jsx.create_account');
        } else if (route.page == 'PickAccount') {
            page_title = `Pick Your New Steemit Account`;
            this.state.subheader_hidden = true;
        } else if (route.page == 'Approval') {
            page_title = `Account Confirmation`;
            this.state.subheader_hidden = true;
        } else if (
            route.page == 'RecoverAccountStep1' ||
            route.page == 'RecoverAccountStep2'
        ) {
            page_title = tt('header_jsx.stolen_account_recovery');
        } else if (route.page === 'UserProfile') {
            user_name = route.params[0].slice(1);
            const acct_meta = this.props.account_meta.getIn([user_name]);
            const name = acct_meta
                ? normalizeProfile(acct_meta.toJS()).name
                : null;
            const user_title = name ? `${name} (@${user_name})` : user_name;
            page_title = user_title;
            if (route.params[1] === 'followers') {
                page_title =
                    tt('header_jsx.people_following') + ' ' + user_title;
            }
            if (route.params[1] === 'followed') {
                page_title =
                    tt('header_jsx.people_followed_by') + ' ' + user_title;
            }
            if (route.params[1] === 'curation-rewards') {
                page_title =
                    tt('header_jsx.curation_rewards_by') + ' ' + user_title;
            }
            if (route.params[1] === 'author-rewards') {
                page_title =
                    tt('header_jsx.author_rewards_by') + ' ' + user_title;
            }
            if (route.params[1] === 'recent-replies') {
                page_title = tt('header_jsx.replies_to') + ' ' + user_title;
            }
            // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
            if (route.params[1] === 'posts' || route.params[1] === 'comments') {
                page_title = tt('header_jsx.comments_by') + ' ' + user_title;
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

        const logo_link =
            route.params && route.params.length > 1 && this.last_sort_order
                ? '/' + this.last_sort_order
                : current_account_name ? `/@${current_account_name}/feed` : '/';
        const topic_link = topic ? (
            <Link to={`/${this.last_sort_order || 'trending'}/${topic}`}>
                {topic}
            </Link>
        ) : null;

        const sort_orders = [
            ['trending', tt('main_menu.trending')],
            ['created', tt('g.new')],
            ['hot', tt('main_menu.hot')],
            ['promoted', tt('g.promoted')],
        ];
        if (current_account_name)
            sort_orders.unshift(['home', tt('header_jsx.home')]);
        const sort_order_menu = sort_orders
            .filter(so => so[0] !== sort_order)
            .map(so => ({
                link: sortOrderToLink(so[0], topic, current_account_name),
                value: so[1],
            }));
        const selected_sort_order = sort_orders.find(
            so => so[0] === sort_order
        );

        const sort_orders_horizontal = [
            ['trending', tt('main_menu.trending')],
            ['created', tt('g.new')],
            ['hot', tt('main_menu.hot')],
            ['promoted', tt('g.promoted')],
        ];
        // if (current_account_name) sort_orders_horizontal.unshift(['home', tt('header_jsx.home')]);
        const sort_order_menu_horizontal = sort_orders_horizontal.map(so => {
            let active = so[0] === sort_order;
            if (so[0] === 'home' && sort_order === 'home' && !home_account)
                active = false;
            return {
                link: sortOrderToLink(so[0], topic, current_account_name),
                value: so[1],
                active,
            };
        });

        return (
            <header className="Header noPrint">
                <div className="Header__top header">
                    <div className="expanded row">
                        <div className="columns">
                            <ul className="menu Header__menu">
                                <li className="Header__logo">
                                    <Link to={logo_link}>
                                        {/*
                                        <Icon name="logo" className="logo-for-mobile" />
                                        <Icon name="logotype" className="logo-for-large" />  */}

                                        <svg
                                            className="logo-new logo-new--mobile"
                                            viewBox="0 0 38 38"
                                            version="1.1"
                                        >
                                            <title>Steemit Logo</title>
                                            <g
                                                stroke="none"
                                                fill="none"
                                                fillRule="evenodd"
                                            >
                                                <g
                                                    className="icon-svg"
                                                    fillRule="nonzero"
                                                >
                                                    <path
                                                        d="M32.7004951,11.3807248 C31.1310771,9.81140963 29.3043776,8.66313021 27.3619013,7.92312792 C28.4939405,4.59311764 32.5075339,3.38104493 32.5075339,3.38104493 C32.5075339,3.38104493 23.1424826,-1.48000457 12.7997611,0.459311764 C9.35218721,1.00793415 6.0461183,3.12587173 3.62767097,5.92001831 C-1.62087426,11.9803819 -0.926213868,21.1028239 5.18422484,26.3083572 C6.1233028,27.1121528 8.22014805,28.3625014 8.2587403,28.4262947 C6.8822836,31.9221676 2.48276772,32.8790671 2.48276772,32.8790671 C2.48276772,32.8790671 8.29733255,36.5152853 16.10583,37.4594261 C18.1769471,37.7145993 20.3767051,37.7783926 22.6536475,37.5359781 C26.2684544,37.2425289 29.8703972,35.3287299 32.6104465,32.6366526 C38.5407881,26.7931863 38.5922444,17.2752258 32.7004951,11.3807248 Z M30.0247661,30.3145765 C27.8121441,32.4835487 24.5060752,33.861484 21.9589871,34.0528639 C20.1580157,34.2314851 18.2284034,34.2570024 16.3759757,34.0273465 C13.6487905,33.6956214 11.680586,32.9428604 9.75097374,32.2156168 C10.7286439,31.271476 11.7063141,29.9700926 12.1051006,28.8473305 C12.3623823,28.1838802 12.3366541,27.4438779 12.0279162,26.7931863 C9.95679906,22.5317938 10.8572848,17.4283297 14.2662664,14.1110781 C16.73617,11.6996913 20.1322875,10.5641706 23.5798614,10.9852064 C26.1140854,11.2914142 28.416756,12.4014176 30.2177274,14.2003887 C34.5915151,18.5893678 34.4371461,26.014908 30.0247661,30.3145765 Z"
                                                        className="icon-svg__shape"
                                                    />
                                                </g>
                                            </g>
                                        </svg>
                                        <svg
                                            className="logo-new logo-new--desktop"
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
                                {selected_sort_order && (
                                    <DropdownMenu
                                        className="Header__sort-order-menu menu-hide-for-large"
                                        items={sort_order_menu}
                                        selected={selected_sort_order[1]}
                                        el="li"
                                    />
                                )}
                                <HorizontalMenu
                                    className="show-for-medium Header__sort"
                                    items={sort_order_menu_horizontal}
                                />
                                <li className={'hide-for-large Header__search'}>
                                    <a
                                        href="/static/search.html"
                                        title={tt('g.search')}
                                    >
                                        <Icon name="search" size="1x" />
                                    </a>
                                </li>
                                <li className={'show-for-large Header__search'}>
                                    <form
                                        className="input-group"
                                        action="/static/search.html"
                                        method="GET"
                                    >
                                        <button
                                            className="input-group-button"
                                            href="/static/search.html"
                                            type="submit"
                                            title={tt('g.search')}
                                        >
                                            <Icon name="search" size="1_5x" />
                                        </button>
                                        <input
                                            className="input-group-field"
                                            type="text"
                                            placeholder="search"
                                            name="q"
                                            autoComplete="off"
                                        />
                                    </form>
                                </li>
                            </ul>
                        </div>
                        <div className="columns shrink">
                            <TopRightMenu {...this.props} />
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

export { Header as _Header_ };

export default connect(state => {
    const current_user = state.user.get('current');
    const account_user = state.global.get('accounts');
    const current_account_name = current_user
        ? current_user.get('username')
        : state.offchain.get('account');
    return {
        location: state.app.get('location'),
        current_account_name,
        account_meta: account_user,
    };
})(Header);
