/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import tt from 'counterpart';
import { List, Map } from 'immutable';
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
import SubscribeButtonContainer from 'app/components/elements/SubscribeButtonContainer';
import SettingsEditButtonContainer from 'app/components/elements/SettingsEditButtonContainer';
import { GptUtils } from 'app/utils/GptUtils';
import GptAd from 'app/components/elements/GptAd';
import ArticleLayoutSelector from 'app/components/modules/ArticleLayoutSelector';
import Topics from './Topics';
import SortOrder from 'app/components/elements/SortOrder';

class PostsIndex extends React.Component {
    static propTypes = {
        posts: PropTypes.object,
        status: PropTypes.object,
        routeParams: PropTypes.object,
        requestData: PropTypes.func,
        loading: PropTypes.bool,
        username: PropTypes.string,
        blogmode: PropTypes.bool,
        topics: PropTypes.object,
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
            prevProps.posts !== this.props.posts
        ) {
            this.refs.list.fetchIfNeeded();
        }
    }

    loadMore(last_post) {
        if (!last_post) return;
        const { category, order, status } = this.props;
        if (isFetchingOrRecentlyUpdated(status, order, category || '')) return;
        const [author, permlink] = last_post.split('/');
        this.props.requestData({
            author,
            permlink,
            order,
            category,
            observer: this.props.username,
        });
    }
    onShowSpam = () => {
        this.setState({ showSpam: !this.state.showSpam });
    };
    render() {
        const {
            topics,
            featured,
            promoted,
            gptBannedTags,
            community,
            category,
            account_name, // TODO: for feed
            order,
            posts,
        } = this.props;

        let allowAdsOnContent = true;
        allowAdsOnContent =
            this.props.gptEnabled &&
            !GptUtils.HasBannedTags([category], gptBannedTags);

        let emptyText = '';
        if (order === 'feed') {
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
        } else if (posts && posts.size === 0) {
            emptyText = (
                <div>
                    {'No ' +
                        order +
                        (category ? ' #' + category : '') +
                        ' posts found'}
                </div>
            );
        }

        function teamMembers(members) {
            return members.map((row, idx) => (
                <div key={idx} style={{ fontSize: '80%' }}>
                    <Link to={'/@' + row.get(0)}>{'@' + row.get(0)}</Link>
                    {' ['}
                    {row.get(1)}
                    {'] '}
                    {row.get(2) && (
                        <span className="affiliation">{row.get(2)}</span>
                    )}
                </div>
            ));
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
        if (order === 'feed') {
            if (account_name === this.props.username)
                page_title = 'My friends' || tt('posts_index.my_feed');
            else
                page_title = tt('posts_index.accountnames_feed', {
                    account_name,
                });
        } else if (category === 'my') {
            page_title = 'My subscriptions';
        } else if (community) {
            page_title = community.get('title');
        } else if (category) {
            page_title = '#' + category;
        } else {
            page_title = tt('g.all_tags');
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
                        <div className="small-8 medium-7 large-8 column">
                            <h1 className="articles__h1 show-for-mq-large articles__h1--no-wrap">
                                {page_title}
                            </h1>
                            <div className="show-for-mq-large">
                                {community && (
                                    <div
                                        style={{
                                            fontSize: '100%',
                                            color: 'gray',
                                        }}
                                    >
                                        #{category}
                                    </div>
                                )}
                                {!community &&
                                    category &&
                                    order !== 'feed' &&
                                    category !== 'my' && (
                                        <div
                                            style={{
                                                fontSize: '80%',
                                                color: 'gray',
                                            }}
                                        >
                                            unmoderated tag
                                        </div>
                                    )}
                            </div>
                            <span className="hide-for-mq-large articles__header-select">
                                <Topics
                                    username={this.props.username}
                                    order={order}
                                    current={category}
                                    topics={topics}
                                    compact
                                />
                            </span>
                        </div>
                        {order != 'feed' && (
                            <div className="small-4 medium-4 large-3 column hide-for-largeX articles__header-select">
                                <SortOrder
                                    sortOrder={order}
                                    topic={category}
                                    horizontal={false}
                                />
                            </div>
                        )}
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
                            anyPosts
                            category={category}
                            hideCategory={!!community}
                            loadMore={this.loadMore}
                            showFeatured
                            showPromoted
                            showSpam={showSpam}
                            allowAdsOnContent={allowAdsOnContent}
                        />
                    )}
                </article>

                <aside className="c-sidebar c-sidebar--right">
                    {community && (
                        <div className="c-sidebar__module">
                            <div className="c-sidebar__header">
                                <h3 className="c-sidebar__h3">
                                    {community.get('title')}
                                </h3>
                                {community.get('is_nsfw') && (
                                    <span className="affiliation">nsfw</span>
                                )}
                            </div>
                            <div
                                style={{
                                    border: '1px solid #ccc',
                                    marginBottom: '16px',
                                    padding: '0.5em',
                                }}
                            >
                                {community.get('about')}
                            </div>
                            <div style={{ float: 'none', marginTop: '-5px' }}>
                                <SubscribeButtonContainer
                                    community={community.get('name')}
                                />
                                <Link
                                    className="button slim hollow"
                                    to={`/submit.html?category=${category}`}
                                >
                                    Create Post
                                </Link>
                                <SettingsEditButtonContainer
                                    community={community.get('name')}
                                />
                            </div>
                            {community.get('subscribers')} subscribers
                            <br />
                            <br />
                            <strong>Moderators</strong>
                            {teamMembers(community.get('team', List()))}
                            <br />
                            <strong>Description</strong>
                            <br />
                            {community.get('description', 'empty')}
                            <br />
                            <br />
                            <strong>Language</strong>
                            <br />
                            {community.get('lang')}
                        </div>
                    )}
                    {this.props.isBrowser && !this.props.username ? (
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
                    {this.props.gptEnabled && allowAdsOnContent ? (
                        <div className="sidebar-ad">
                            <GptAd
                                type="Freestar"
                                id="bsa-zone_1566495004689-0_123456"
                            />
                        </div>
                    ) : null}
                </aside>

                <aside className="c-sidebar c-sidebar--left">
                    <Topics
                        order={order}
                        current={category}
                        compact={false}
                        username={this.props.username}
                        topics={topics}
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
                    {this.props.gptEnabled && allowAdsOnContent ? (
                        <div>
                            <div className="sidebar-ad">
                                <GptAd
                                    type="Freestar"
                                    slotName="bsa-zone_1566494461953-7_123456"
                                />
                            </div>
                            <div
                                className="sidebar-ad"
                                style={{ marginTop: 20 }}
                            >
                                <GptAd
                                    type="Freestar"
                                    slotName="bsa-zone_1566494856923-9_123456"
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
            // route can be e.g. trending/food (order/category);
            //   or, @username/feed (category/order). Branch on presence of `@`.
            const route = ownProps.routeParams;
            const account_name =
                route.order[0] == '@'
                    ? route.order.slice(1).toLowerCase()
                    : null;
            const category = account_name
                ? route.order
                : route.category ? route.category.toLowerCase() : null;
            const order = account_name
                ? route.category
                : route.order || constants.DEFAULT_SORT_ORDER;

            return {
                posts: state.global.getIn(
                    ['discussion_idx', category || '', order],
                    Map()
                ),
                status: state.global.get('status'),
                loading: state.app.get('loading'),
                community: state.global.getIn(
                    ['community', ownProps.params.category],
                    null
                ),
                account_name,
                category,
                order,
                username:
                    state.user.getIn(['current', 'username']) ||
                    state.offchain.get('account'),
                blogmode: state.app.getIn(['user_preferences', 'blogmode']),
                topics: state.global.getIn(['topics'], List()),
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
                isBrowser: process.env.BROWSER,
                gptEnabled: state.app.getIn(['googleAds', 'gptEnabled']),
                gptBannedTags: state.app.getIn(['googleAds', 'gptBannedTags']),
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
