/* eslint react/prop-types: 0 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import constants from 'app/redux/constants';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import PostsList from 'app/components/cards/PostsList';
import {isFetchingOrRecentlyUpdated} from 'app/utils/StateFunctions';
import {Link} from 'react-router';
import MarkNotificationRead from 'app/components/elements/MarkNotificationRead';
import tt from 'counterpart';
import Immutable from "immutable";
import Callout from 'app/components/elements/Callout';
import Topics from './Topics';
import { SidebarModule } from '../modules/SidebarModule';


class PostsIndex extends React.Component {

    static propTypes = {
        discussions: PropTypes.object,
        accounts: PropTypes.object,
        status: PropTypes.object,
        routeParams: PropTypes.object,
        requestData: PropTypes.func,
        loading: PropTypes.bool,
        username: PropTypes.string
    };

    static defaultProps = {
        showSpam: false
    }

    constructor() {
        super();
        this.state = {}
        this.loadMore = this.loadMore.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsIndex')
    }

    componentDidUpdate(prevProps) {
        if (window.innerHeight && window.innerHeight > 3000 && prevProps.discussions !== this.props.discussions) {
            this.refs.list.fetchIfNeeded();
        }
    }

    getPosts(order, category) {
        const topic_discussions = this.props.discussions.get(category || '');
        if (!topic_discussions) return null;
        return topic_discussions.get(order);
    }

    loadMore(last_post) {
        if (!last_post) return;
        let {accountname} = this.props.routeParams
        let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
        if (category === 'feed') {
            accountname = order.slice(1);
            order = 'by_feed';
        }
        if (isFetchingOrRecentlyUpdated(this.props.status, order, category)) return;
        const [author, permlink] = last_post.split('/');
        this.props.requestData({author, permlink, order, category, accountname});
    }
    onShowSpam = () => {
        this.setState({showSpam: !this.state.showSpam})
    }
    render() {
        let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
        let topics_order = order;
        let posts = [];
        let emptyText = '';
        let markNotificationRead = null;
        if (category === 'feed') {
            const account_name = order.slice(1);
            order = 'by_feed';
            topics_order = 'trending';
            posts = this.props.accounts.getIn([account_name, 'feed']);
            const isMyAccount = this.props.username === account_name;
            if (isMyAccount) {
                emptyText = <div>
                    {tt('posts_index.empty_feed_1')}.<br /><br />
                    {tt('posts_index.empty_feed_2')}.<br /><br />
                    <Link to="/trending">{tt('posts_index.empty_feed_3')}</Link><br />
                    <Link to="/welcome">{tt('posts_index.empty_feed_4')}</Link><br />
                    <Link to="/faq.html">{tt('posts_index.empty_feed_5')}</Link><br />
                </div>;
                markNotificationRead = <MarkNotificationRead fields="feed" account={account_name} />
            } else {
                emptyText = <div>{tt('user_profile.user_hasnt_followed_anything_yet', {name: account_name})}</div>;
            }
        } else {
            posts = this.getPosts(order, category);
            if (posts && posts.size === 0) {
                emptyText = <div>{'No ' + topics_order + (category ? ' #' + category : '') + ' posts found'}</div>;
            }
        }

        const status = this.props.status ? this.props.status.getIn([category || '', order]) : null;
        const fetching = (status && status.fetching) || this.props.loading;
        const {showSpam} = this.state;

        return (
            <div className={'PostsIndex row' + (fetching ? ' fetching' : '')}>
                <aside className="c-sidebar c-sidebar--left">
                    <Topics order={topics_order} current={category} compact={false} />
                    <small><a onClick={this.onShowSpam}>{showSpam ? tt('g.next_3_strings_together.show_less') : tt('g.next_3_strings_together.show_more')}</a>{' ' + tt('g.next_3_strings_together.value_posts')}</small>
                </aside>
                <article className="articles">
                    <div className="articles__header">
                        <div className="articles__header-col">
                        <h1 className="articles__h1">People I follow</h1>
                    </div>
                    <div className="articles__header-col articles__header-col--right">
                        <div className="articles__tag-selector">
                            <Topics order={topics_order} current={category} compact />
                        </div>
                    </div>         
                </div> 
                <hr className="articles__hr" />
                    {markNotificationRead}
                    {(!fetching && (posts && !posts.size)) ? <Callout>{emptyText}</Callout> :
                        <PostsList
                            ref="list"
                            posts={posts ? posts : Immutable.List()}
                            loading={fetching}
                            category={category}
                            loadMore={this.loadMore}
                            showSpam={showSpam}
                        />}
                </article>
                 <aside className="c-sidebar c-sidebar--right">
                    <div className="c-sidebar__module">
                      <div className="c-sidebar__header">
                        <h3 className="c-sidebar__h3">Stats</h3>
                      </div>
                      <div className="c-sidebar__content">
                        <ul className="c-sidebar__list">
                          <li className="c-sidebar__list-item"><span className="c-sidebar__label">Steem Power</span><span className="c-sidebar__score">2,340.890</span></li>
                          <li className="c-sidebar__list-item"><span className="c-sidebar__label">Power Rank</span><span className="c-sidebar__score">862</span></li>
                          <li className="c-sidebar__list-item"><span className="c-sidebar__label">Followers</span><span className="c-sidebar__score">340</span></li>
                        </ul>
                      </div>
                    </div>
                    <div className="c-sidebar__module">
                      <div className="c-sidebar__header">
                        <h3 className="c-sidebar__h3">Links</h3>
                      </div>
                      <div className="c-sidebar__content">
                        <ul className="c-sidebar__list">
                          <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="#">My blog</a></li>
                          <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="#">My wallet</a></li>
                          <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="#">Pay someone</a></li>
                          <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="#">Buy STEEM</a></li>
                        </ul>
                      </div>
                    </div>
                    <div className="c-sidebar__module">
                      <div className="c-sidebar__header">
                        <h3 className="c-sidebar__h3">New to Steemit?</h3>
                      </div>
                      <div className="c-sidebar__content">
                        <ul className="c-sidebar__list">
                          <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="/welcome">Quick start guide</a></li>
                          <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="/faq.html">FAQs</a></li>
                          <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="https://steem.io">About the blockchain</a></li>
                          <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="/pick_account">Sign up</a></li>
                        </ul>
                      </div>
                    </div>                    
                    {/* <SidebarModule /> */}
                  </aside>
            </div>
        );
    }
}


module.exports = {
    path: ':order(/:category)',
    component: connect(
        (state) => {
            return {
                discussions: state.global.get('discussion_idx'),
                status: state.global.get('status'),
                loading: state.app.get('loading'),
                accounts: state.global.get('accounts'),
                username: state.user.getIn(['current', 'username']) || state.offchain.get('account'),
            };
        },
        (dispatch) => {
            return {
                requestData: (args) => dispatch({type: 'REQUEST_DATA', payload: args}),
            }
        }
    )(PostsIndex)
};
