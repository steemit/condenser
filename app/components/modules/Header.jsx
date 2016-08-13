import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import TopRightMenu from 'app/components/modules/TopRightMenu';
import Icon from 'app/components/elements/Icon.jsx';
import resolveRoute from 'app/ResolveRoute';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';

class Header extends React.Component {
    static propTypes = {
        location: React.PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Header');
    }

    componentWillReceiveProps(nextPrps) {
        if (nextPrps.location.pathname !== this.props.location.pathname) {
            const route = resolveRoute(nextPrps.location.pathname);
            const sort_order = route && route.page === 'PostsIndex' && route.params && route.params.length > 0 ? route.params[0] : null;
            if (sort_order) this.last_sort_order = sort_order;
        }
    }

    render() {
        const route = resolveRoute(this.props.location.pathname);
        let page_title = route.page;

        let sort_order = '';
        let topic = '';
        let user_name = null;
        let page_name = null;

        if (route.page === 'PostsIndex') {
            sort_order = route.params[0];
            if (route.params.length > 1) {
                topic = route.params[1];
                page_title = `${topic}/${sort_order}`;
            } else {
                page_title = `${sort_order}`;
            }
        } else if (route.page === 'Post') {
            sort_order = '';
            topic = route.params[0];
        } else if (route.page === 'UserProfile') {
            page_title = ''; //route.params[0];
            user_name = route.params[0].slice(1);
        } else {
            page_name = ''; //page_title = route.page.replace( /([a-z])([A-Z])/g, '$1 $2' ).toLowerCase();
        }

        if (process.env.BROWSER) document.title = page_title + ' — Steemit';

        const logo_link = route.params && route.params.length > 1 && this.last_sort_order ? '/' + this.last_sort_order : '/';
        let topic_link = topic ? <Link to={`/${this.last_sort_order || 'trending'}/${topic}`}>{topic}</Link> : null;

        const sort_orders = {
                hot: 'hot',
                trending: 'trending',
                trending30: 'trending (30 day)',
                cashout: 'payout time',
                created: 'new',
                active: 'active',
                responses: 'responses',
                votes: 'popular' };
        const sort_order_menu = Object.keys(sort_orders).filter(so => so !== sort_order).map(so => ({link: `/${so}/${topic}`, value: sort_orders[so]}));

        return (
            <header className="Header">
                <div className="Header__top header">
                    <div className="expanded row">
                        <div className="columns">
                            <ul className="menu">
                                <li className="Header__top-logo">
                                    <Link to={logo_link}>
                                        <Icon name="steem" size="2x" />
                                    </Link>
                                </li>
                                <li className="Header__top-steemit show-for-medium"><Link to={logo_link}>steemit<span className="beta">beta</span></Link></li>
                                {(topic_link || user_name || page_name) && <li className="delim show-for-medium">|</li>}
                                {topic_link && <li className="Header__top-topic">{topic_link}</li>}
                                {user_name && <li><Link to={`/@${user_name}`}>{user_name}</Link></li>}
                                {page_name && <li><span>{page_name}</span></li>}
                                {sort_order && <li className="delim show-for-medium">|</li>}
                                {(topic_link || user_name || page_name) && sort_order && <li className="delim show-for-small-only">|</li>}
                                {sort_order && <DropdownMenu className="Header__sort-order-menu" items={sort_order_menu} selected={sort_orders[sort_order]} el="li" />}
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

export {Header as _Header_};

export default connect(
    state => {
        return {
            location: state.app.get('location')
        }
    }
)(Header);
