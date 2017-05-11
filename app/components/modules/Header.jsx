import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import TopRightMenu from 'app/components/modules/TopRightMenu';
import Icon from 'app/components/elements/Icon.jsx';
import user from 'app/redux/User';
import resolveRoute from 'app/ResolveRoute';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import HorizontalMenu from 'app/components/elements/HorizontalMenu';
import normalizeProfile from 'app/utils/NormalizeProfile';
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import tt from 'counterpart';
import { APP_NAME, APP_ICON, DEFAULT_DOMESTIC, DOMESTIC, SEO_TITLE } from 'app/client_config';
import { detransliterate } from 'app/utils/ParsersAndFormatters';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.substring(1);
}

function sortOrderToLink(so, topic, account) {
    // to prevent probmes check if topic is not the same as account name
    if ('@' + account == topic) topic = ''
    if (so === 'home') return '/@' + account + '/feed';
    if (topic) return `/${so}/${topic}`;
    return `/${so}`;
}

class Header extends React.Component {
    static propTypes = {
        location: React.PropTypes.object.isRequired,
        current_account_name: React.PropTypes.string,
        account_meta: React.PropTypes.object
    };

    constructor() {
        super();
        this.state = {subheader_hidden: false}
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Header');
        this.hideSubheader = this.hideSubheader.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            const route = resolveRoute(nextProps.location.pathname);
            if (route && route.page === 'PostsIndex' && route.params && route.params.length > 0) {
                const sort_order = route.params[0] !== 'home' ? route.params[0] : null;
                if (sort_order) window.last_sort_order = this.last_sort_order = sort_order;
            }
        }
    }

    hideSubheader() {
        const subheader_hidden = this.state.subheader_hidden;
        const y = window.scrollY >= 0 ? window.scrollY : document.documentElement.scrollTop;
        if (y === this.prevScrollY) return;
        if (y < 5) {
            this.setState({subheader_hidden: false});
        } else if (y > this.prevScrollY) {
            if (!subheader_hidden) this.setState({subheader_hidden: true})
        } else {
            if (subheader_hidden) this.setState({subheader_hidden: false})
        }
        this.prevScrollY = y;
    }

    componentDidMount() {
        window.addEventListener('scroll', this.hideSubheader);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.hideSubheader);
    }

    render() {
        const route = resolveRoute(this.props.location.pathname);
        const current_account_name =  this.props.current_account_name;
        let home_account = false;
        let page_title = route.page;

        let sort_order = '';
        let topic = '';
        let topic_original_link = '';
        let user_name = null;
        let page_name = null;

        if (route.page === 'PostsIndex') {
            sort_order = route.params[0] || '';
            if (sort_order === 'home') {
                page_title = tt('header_jsx.home')
                const account_name = route.params[1];
                if (current_account_name && account_name.indexOf(current_account_name) === 1)
                    home_account = true;
            } else {
                const type = tt(route.params[0] == 'payout_comments' ? 'g.comments' : 'g.posts');
                const topic = (route.params.length > 1 ? detransliterate(route.params[1]) + ' ' : '')
                topic_original_link = route.params[1]
                let prefix = route.params[0];
                if(prefix == 'created') prefix = tt('g.new')
                if(prefix == 'payout') prefix = tt('voting_jsx.pending_payout')
                if(prefix == 'payout_comments') prefix = tt('voting_jsx.pending_payout')
                page_title = `${prefix} ${topic}${type}`;
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
        } else if (route.page == 'RecoverAccountStep1' || route.page == 'RecoverAccountStep2') {
            page_title = tt('header_jsx.stolen_account_recovery');
        } else if (route.page === 'UserProfile') {
            user_name = route.params[0].slice(1);
            const acct_meta = this.props.account_meta.getIn([user_name]);
            const name = acct_meta ? normalizeProfile(acct_meta.toJS()).name : null;
            const user_title = name ? `${name} (@${user_name})` : user_name;
            page_title = user_title;
            if(route.params[1] === "followers"){
                page_title = tt('header_jsx.people_following') + " " + user_title;
            }
            if(route.params[1] === "followed"){
                page_title = tt('header_jsx.people_followed_by') + " " + user_title;
            }
            if(route.params[1] === "curation-rewards"){
                page_title = tt('header_jsx.curation_rewards_by') + " " + user_title;
            }
            if(route.params[1] === "author-rewards"){
                page_title = tt('header_jsx.author_rewards_by') + " " + user_title;
            }
            if(route.params[1] === "recent-replies"){
                page_title = tt('header_jsx.replies_to') + " " + user_title;
            }
            // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
            if(route.params[1] === "posts" || route.params[1] === "comments"){
                page_title = tt('header_jsx.comments_by') + " " + user_title;
            }
        } else {
            page_name = ''; //page_title = route.page.replace( /([a-z])([A-Z])/g, '$1 $2' ).toLowerCase();
        }

        // Format first letter of all titles and lowercase user name
        if (route.page !== 'UserProfile') {
            page_title = page_title.charAt(0).toUpperCase() + page_title.slice(1);
        }

        if (process.env.BROWSER && (route.page !== 'Post' && route.page !== 'PostNoCategory')) document.title = page_title + ' | ' + SEO_TITLE;

        const logo_link = route.params && route.params.length > 1 && this.last_sort_order ? '/' + this.last_sort_order : (current_account_name ? `/@${current_account_name}/feed` : '/');
        let topic_link = topic ? <Link to={`/${this.last_sort_order || 'hot'}/${topic_original_link}`}>{detransliterate(topic)}</Link> : null;

        const sort_orders = [
            ['created', tt('g.new')],
            ['hot', tt('main_menu.hot')],
            ['trending', tt('main_menu.trending')],
            ['promoted', tt('g.promoted')],
            //['payout', 'payout (posts)'],
            //['payout_comments', 'payout (comments)'],
        ];
        if (current_account_name) sort_orders.unshift(['home', tt('header_jsx.home')]);
        const sort_order_menu = sort_orders.filter(so => so[0] !== sort_order).map(so => ({link: sortOrderToLink(so[0], topic_original_link, current_account_name), value: capitalizeFirstLetter(so[1])}));
        const selected_sort_order = sort_orders.find(so => so[0] === sort_order);

        const sort_orders_horizontal = [
            ['created', tt('g.new')],
            ['hot', tt('main_menu.hot')],
            ['trending', tt('main_menu.trending')],
            ['promoted', tt('g.promoted')],
            //['payout', 'payout (posts)'],
            //['payout_comments', 'payout (comments)'],
        ];
        if (current_account_name) sort_orders_horizontal.unshift(['home', tt('header_jsx.home')]);
        const sort_order_menu_horizontal = sort_orders_horizontal.map(so => {
                let active = (so[0] === sort_order);
                if (so[0] === 'home' && sort_order === 'home' && !home_account) active = false;
                return {link: sortOrderToLink(so[0], topic_original_link, current_account_name), value: so[1], active};
            });

        // domestic
        DOMESTIC.all = tt('g.all_langs');
        let currentDomesticKey = DEFAULT_DOMESTIC;
        let currentDomesticTitle = DOMESTIC[currentDomesticKey];
        const domestic_menu = [];
        for (var key in DOMESTIC) {
          if (this.props.current_domestic === key) {
            currentDomesticKey = key;
            currentDomesticTitle = DOMESTIC[currentDomesticKey];
          }
          else
            domestic_menu.push({link: '#' + key, onClick: this.props.changeDomestic, value: DOMESTIC[key]})
        }

        let sort_order_extra_menu = null;
        if (sort_order === 'trending' || sort_order === 'trending30') {
            const items = [
                {link: `/trending/${topic_original_link}`, value: tt('g.24_hour'), active: sort_order === 'trending'},
                {link: `/trending30/${topic_original_link}`, value: tt('g.30_day'), active: sort_order === 'trending30'}
            ];
            // hide extra menu until crowdsale start because they make no sense
            sort_order_extra_menu = <HorizontalMenu items={items} />
        }
        return (
            <header className="Header noPrint">
                <div className="Header__top header">
                    <div className="expanded row">
                        <div className="columns">
                            <ul className="menu">
                                <li className="Header__top-logo">
                                    <Link to={logo_link}>
                                        <Icon name={APP_ICON} size="2x" />
                                    </Link>
                                </li>
                                <li className="Header__top-steemit show-for-medium noPrint">
                                    <Link to={logo_link}>{APP_NAME}<span className="beta">beta</span></Link>
                                </li>
                                {(topic_link || user_name || page_name) && <li className="delim show-for-medium">|</li>}
                                {topic_link && <li className="Header__top-topic">{topic_link}</li>}
                                {user_name && <li><Link to={`/@${user_name}`}>@{user_name}</Link></li>}
                                {page_name && <li><span>{page_name}</span></li>}
                                {(topic_link || user_name || page_name) && sort_order && <li className="delim show-for-small-only">|</li>}
                                {selected_sort_order && route && route.page !== 'Landing' && <DropdownMenu className="Header__sort-order-menu show-for-small-only" items={sort_order_menu} selected={selected_sort_order[1]} el="li" />}
                            </ul>
                        </div>
                        <div className="columns shrink">
                            <TopRightMenu {...this.props} />
                        </div>
                    </div>
                </div>
                <div className={'Header__sub-nav expanded show-for-medium row' + (this.state.subheader_hidden ? ' hidden' : '')}>
                    <div className="columns">
                        <HorizontalMenu items={sort_order_menu_horizontal}>
                          <LinkWithDropdown
                            closeOnClickOutside
                            dropdownPosition="bottom"
                            dropdownAlignment="left"
                            dropdownContent={<VerticalMenu items={domestic_menu} title={tt('settings_jsx.choose_domestic')} />}
                            >
                              <a className="domestic-selector" title={tt('settings_jsx.choose_domestic')} onClick={e => e.preventDefault()}>
                                <Icon className="domestic-flag" name={'flags/4x3/' + currentDomesticKey} /> <Icon name="caret-down" />
                              </a>
                            </LinkWithDropdown>
                        </HorizontalMenu>
                    </div>
                </div>
            </header>
        );
    }
}

export {Header as _Header_};

export default connect(
    state => {
        const current_domestic = state.user.get('domestic');
        const current_user = state.user.get('current');
        const account_user = state.global.get('accounts');
        const current_account_name = current_user ? current_user.get('username') : state.offchain.get('account');
        return {
            location: state.app.get('location'),
            current_account_name,
            account_meta: account_user,
            current_domestic: current_domestic || DEFAULT_DOMESTIC
        }
    },
    dispatch => ({
        changeDomestic: e => {
          if (e) e.preventDefault();
          const targetDomestic = e.target.text.trim();
          let domestic = DEFAULT_DOMESTIC;
          for (var key in DOMESTIC) {
            if (targetDomestic.localeCompare(DOMESTIC[key]) == 0)
              domestic = key;
          }
          dispatch(user.actions.changeDomestic(domestic));
        }
    })
)(Header);
