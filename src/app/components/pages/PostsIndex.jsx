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
// import SidebarStats from 'app/components/elements/SidebarStats';
import SidebarLinks from 'app/components/elements/SidebarLinks';
import SidebarNewUsers from 'app/components/elements/SidebarNewUsers';
import Topics from './Topics';
import ArticleLayoutSelector from 'app/components/modules/ArticleLayoutSelector';

class PostsIndex extends React.Component {

    static propTypes = {
        discussions: PropTypes.object,
        accounts: PropTypes.object,
        status: PropTypes.object,
        routeParams: PropTypes.object,
        requestData: PropTypes.func,
        loading: PropTypes.bool,
        username: PropTypes.string,
        blogmode: PropTypes.bool,
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

        // If we're at one of the four sort order routes without a tag filter,
        // use the translated string for that sort order, f.ex "trending"
        //
        // If you click on a tag while you're in a sort order route,
        // the title should be the translated string for that sort order
        // plus the tag string, f.ex "trending: blog"
        //
        // Logged-in:
        // At homepage (@user/feed) say "People I follow"
        let page_title = 'Posts'; // sensible default here?
        if (typeof this.props.username !== 'undefined' && category === 'feed') {
            page_title = 'People I follow'; // todo: localization
        } else {
            switch (topics_order) {
                case 'trending': // cribbed from Header.jsx where it's repeated 2x already :P
                    page_title = tt('main_menu.trending');
                    break;
                case 'created':
                    page_title = tt('g.new');
                    break;
                case 'hot':
                    page_title = tt('main_menu.hot');
                    break;
                case 'promoted':
                    page_title = tt('g.promoted');
                    break;
            }
            if (typeof category !== 'undefined') {
                page_title = `${page_title}: ${category}`; // maybe todo: localize the colon?
            }
        }

        const layoutClass = this.props.blogmode ? ' layout-block' : ' layout-list';

        return (
            <div className={'PostsIndex row' + (fetching ? ' fetching' : '') + layoutClass}>
                <article className="articles">
                    <div className="articles__header">
                        <div className="articles__header-col">
                            <h1 className="articles__h1">{page_title}</h1>
                        </div>
                        <div className="articles__header-col articles__header-col--right">
                            <div className="articles__tag-selector">
                                <Topics order={topics_order} current={category} compact />
                            </div>
                            <ArticleLayoutSelector />
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
                        />
                    }
                </article>                
                 <aside className="c-sidebar c-sidebar--right">
                    { !this.props.username
                        ? <SidebarNewUsers />
                        : <div>
                              {/* <SidebarStats steemPower={123} followers={23} reputation={62} />  */}
                              <SidebarLinks username={this.props.username} />
                            </div>
                    }
                </aside>
                <aside className="c-sidebar c-sidebar--left">
                    <Topics order={topics_order} current={category} compact={false} />
                    <small><a className="c-sidebar__more-link" onClick={this.onShowSpam}>{showSpam ? tt('g.next_3_strings_together.show_less') : tt('g.next_3_strings_together.show_more')}</a>{' ' + tt('g.next_3_strings_together.value_posts')}</small>
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
                discussions: state.getIn(['global', 'discussion_idx']),
                status: state.getIn(['global', 'status']),
                loading: state.getIn(['app', 'loading']),
                accounts: state.getIn(['global', 'accounts']),
                username: state.getIn(['user', 'current', 'username']) || state.getIn(['offchain', 'account']),
                blogmode: state.getIn(['app', 'user_preferences', 'blogmode']),
            };
        },
        (dispatch) => {
            return {
                requestData: (args) => dispatch({type: 'REQUEST_DATA', payload: args}),
            }
        }
    )(PostsIndex)
};
