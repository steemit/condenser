/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import tt from 'counterpart';
import { List } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import constants from 'app/redux/constants';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import PostsList from 'app/components/cards/PostsList';
import { isFetchingOrRecentlyUpdated } from 'app/utils/StateFunctions';
import Callout from 'app/components/elements/Callout';
import SidebarLinks from 'app/components/elements/SidebarLinks';
import SidebarNewUsers from 'app/components/elements/SidebarNewUsers';
import Notices from 'app/components/elements/Notices';
import SteemMarket from 'app/components/elements/SteemMarket';
import { GptUtils } from 'app/utils/GptUtils';
import GptAd from 'app/components/elements/GptAd';
import ArticleLayoutSelector from 'app/components/modules/ArticleLayoutSelector';
import Topics from './Topics';
import SortOrder from 'app/components/elements/SortOrder';

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
        categories: PropTypes.object,
    };

    static defaultProps = {
        showSpam: false,
    };

    constructor() {
        super();
        this.state = {};
        this.loadMore = this.loadMore.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsIndex');
    }

    componentDidUpdate(prevProps) {
        if (
            window.innerHeight &&
            window.innerHeight > 3000 &&
            prevProps.discussions !== this.props.discussions
        ) {
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
        let {
            accountname,
            category,
            order = constants.DEFAULT_SORT_ORDER,
        } = this.props.routeParams;
        if (category === 'feed') {
            accountname = order.slice(1);
            order = 'by_feed';
        }
        if (isFetchingOrRecentlyUpdated(this.props.status, order, category))
            return;
        const [author, permlink] = last_post.split('/');
        this.props.requestData({
            author,
            permlink,
            order,
            category,
            accountname,
        });
    }
    onShowSpam = () => {
        this.setState({ showSpam: !this.state.showSpam });
    };
    render() {
        let {
            category,
            order = constants.DEFAULT_SORT_ORDER,
        } = this.props.routeParams;

        const { categories, featured, promoted } = this.props;

        let topics_order = order;
        let posts = [];
        let account_name = '';
        let emptyText = '';
        if (category === 'feed') {
            account_name = order.slice(1);
            order = 'by_feed';
            topics_order = 'trending';
            posts = this.props.accounts.getIn([account_name, 'feed']);
            const isMyAccount = this.props.username === account_name;
            if (isMyAccount) {
                emptyText = (
                    <div>
                        {tt('posts_index.empty_feed_1')}.<br />
                        <br />
                        {tt('posts_index.empty_feed_2')}.<br />
                        <br />
                        <Link to="/trending">
                            {tt('posts_index.empty_feed_3')}
                        </Link>
                        <br />
                        <Link to="/welcome">
                            {tt('posts_index.empty_feed_4')}
                        </Link>
                        <br />
                        <Link to="/faq.html">
                            {tt('posts_index.empty_feed_5')}
                        </Link>
                        <br />
                    </div>
                );
            } else {
                emptyText = (
                    <div>
                        {tt('user_profile.user_hasnt_followed_anything_yet', {
                            name: account_name,
                        })}
                    </div>
                );
            }
        } else {
            posts = this.getPosts(order, category);
            if (posts && posts.size === 0) {
                emptyText = (
                    <div>
                        {'No ' +
                            topics_order +
                            (category ? ' #' + category : '') +
                            ' posts found'}
                    </div>
                );
            }
        }

        const status = this.props.status
            ? this.props.status.getIn([category || '', order])
            : null;
        const fetching = (status && status.fetching) || this.props.loading;
        const { showSpam } = this.state;

        // If we're at one of the four sort order routes without a tag filter,
        // use the translated string for that sort order, f.ex "trending"
        //
        // If you click on a tag while you're in a sort order route,
        // the title should be the translated string for that sort order
        // plus the tag string, f.ex "trending: blog"
        //
        // Logged-in:
        // At homepage (@user/feed) say "My feed"
        let page_title = 'Posts'; // sensible default here?
        if (category === 'feed') {
            if (account_name === this.props.username)
                page_title = tt('posts_index.my_feed');
            else
                page_title = tt('posts_index.accountnames_feed', {
                    account_name,
                });
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
            } else {
                page_title = `${page_title}: ${tt('g.all_tags')}`;
            }
        }
        const layoutClass = this.props.blogmode
            ? ' layout-block'
            : ' layout-list';
        return (
            <div
                className={
                    'PostsIndex row' +
                    (fetching ? ' fetching' : '') +
                    layoutClass
                }
            >
                <article className="articles">
                    <div className="articles__header row">
                        <div className="small-6 medium-6 large-6 column">
                            <h1 className="articles__h1 show-for-mq-large articles__h1--no-wrap">
                                {page_title}
                            </h1>
                            <span className="hide-for-mq-large articles__header-select">
                                <Topics
                                    username={this.props.username}
                                    order={topics_order}
                                    current={category}
                                    categories={categories}
                                    compact={true}
                                />
                            </span>
                        </div>
                        <div className="small-6 medium-5 large-5 column hide-for-large articles__header-select">
                            <SortOrder
                                sortOrder={this.props.sortOrder}
                                topic={this.props.topic}
                                horizontal={false}
                            />
                        </div>
                        <div className="medium-1 show-for-mq-medium column">
                            <ArticleLayoutSelector />
                        </div>
                    </div>
                    <hr className="articles__hr" />
                    {!fetching &&
                    (posts && !posts.size) &&
                    (featured && !featured.size) &&
                    (promoted && !promoted.size) ? (
                        <Callout>{emptyText}</Callout>
                    ) : (
                        <PostsList
                            ref="list"
                            posts={posts ? posts : List()}
                            loading={fetching}
                            anyPosts={true}
                            category={category}
                            loadMore={this.loadMore}
                            showFeatured={true}
                            showPromoted={true}
                            showSpam={showSpam}
                        />
                    )}
                </article>

                <aside className="c-sidebar c-sidebar--right">
                    {this.props.isBrowser &&
                    !this.props.maybeLoggedIn &&
                    !this.props.username ? (
                        <SidebarNewUsers />
                    ) : (
                        this.props.isBrowser && (
                            <div>
                                {/* <SidebarStats steemPower={123} followers={23} reputation={62} />  */}
                                <SidebarLinks username={this.props.username} />
                            </div>
                        )
                    )}
                    <Notices notices={this.props.notices} />
                    <SteemMarket />
                    {this.props.gptEnabled ? (
                        <div className="sidebar-ad">
                            <GptAd type="Freestar" id="steemit_160x600_Right" />
                        </div>
                    ) : null}
                </aside>

                <aside className="c-sidebar c-sidebar--left">
                    <Topics
                        order={topics_order}
                        current={category}
                        compact={false}
                        username={this.props.username}
                        categories={categories}
                    />
                    <small>
                        <a
                            className="c-sidebar__more-link"
                            onClick={this.onShowSpam}
                        >
                            {showSpam
                                ? tt('g.next_3_strings_together.show_less')
                                : tt('g.next_3_strings_together.show_more')}
                        </a>
                        {' ' + tt('g.next_3_strings_together.value_posts')}
                    </small>
                    {this.props.gptEnabled ? (
                        <div>
                            <div className="sidebar-ad">
                                <GptAd
                                    type="Freestar"
                                    slotName="steemit_160x600_Left_1"
                                />
                            </div>
                            <div
                                className="sidebar-ad"
                                style={{ marginTop: 20 }}
                            >
                                <GptAd
                                    type="Freestar"
                                    slotName="steemit_160x600_Left_2"
                                />
                            </div>
                        </div>
                    ) : null}
                </aside>
            </div>
        );
    }
}

module.exports = {
    path: ':order(/:category)',
    component: connect(
        (state, ownProps) => {
            return {
                discussions: state.global.get('discussion_idx'),
                status: state.global.get('status'),
                loading: state.app.get('loading'),
                accounts: state.global.get('accounts'),
                username:
                    state.user.getIn(['current', 'username']) ||
                    state.offchain.get('account'),
                blogmode: state.app.getIn(['user_preferences', 'blogmode']),
                sortOrder: ownProps.params.order,
                topic: ownProps.params.category,
                categories: state.global
                    .getIn(['tag_idx', 'trending'])
                    .take(50),
                featured: state.offchain
                    .get('special_posts')
                    .get('featured_posts'),
                promoted: state.offchain
                    .get('special_posts')
                    .get('promoted_posts'),
                notices: state.offchain
                    .get('special_posts')
                    .get('notices')
                    .toJS(),
                maybeLoggedIn: state.user.get('maybeLoggedIn'),
                isBrowser: process.env.BROWSER,
                gptEnabled: state.app.getIn(['googleAds', 'gptEnabled']),
            };
        },
        dispatch => {
            return {
                requestData: args =>
                    dispatch(fetchDataSagaActions.requestData(args)),
            };
        }
    )(PostsIndex),
};
