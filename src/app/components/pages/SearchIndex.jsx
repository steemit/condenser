/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import tt from 'counterpart';
import { List, Map } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
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
import { ifHive } from 'app/utils/Community';
import CommunityPane from 'app/components/elements/CommunityPane';
import CommunityPaneMobile from 'app/components/elements/CommunityPaneMobile';

const emptyFeedText = (isMyAccount, account_name) => {
    return isMyAccount ? (
        <div>
            {tt('posts_index.empty_feed_1')}.<br />
            <br />
            {tt('posts_index.empty_feed_2')}.<br />
            <br />
            <Link to="/trending">{tt('posts_index.empty_feed_3')}</Link>
            <br />
            <Link to="/welcome">{tt('posts_index.empty_feed_4')}</Link>
            <br />
            <Link to="/faq.html">{tt('posts_index.empty_feed_5')}</Link>
            <br />
        </div>
    ) : (
        <div>
            {tt('user_profile.user_hasnt_followed_anything_yet', {
                name: account_name,
            })}
        </div>
    );
};

class SearchIndex extends React.Component {
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

    constructor() {
        super();
        this.state = {};
        this.loadMore = this.loadMore.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'SearchIndex');
    }

    componentWillMount() {
        const { subscriptions, getSubscriptions, username } = this.props;
        if (!subscriptions && username) getSubscriptions(username);
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

    render() {
        const {
            topics,
            subscriptions,
            allowAdsOnContent,
            community,
            category,
            account_name, // TODO: for feed
            order,
            posts,
        } = this.props;

        let emptyText = '';
        if (order === 'feed') {
            const isMyAccount = this.props.username === account_name;
            emptyText = emptyFeedText(isMyAccount, account_name);
        } else if (posts.size === 0) {
            const cat = community
                ? community.get('title')
                : category ? ' #' + category : '';
            emptyText = <div>{`No ${order} ${cat} posts found`}</div>;
        } else {
            emptyText = 'Nothing here to see...';
        }

        const status = this.props.status
            ? this.props.status.getIn([category || '', order])
            : null;
        const fetching = (status && status.fetching) || this.props.loading;

        // page title
        let page_title = tt('g.all_tags');
        if (order === 'feed') {
            if (account_name === this.props.username)
                page_title = 'My friends' || tt('posts_index.my_feed');
            else
                page_title = tt('posts_index.accountnames_feed', {
                    account_name,
                });
        } else if (category === 'my') {
            page_title = 'My communities';
        } else if (community) {
            page_title = community.get('title');
        } else if (category) {
            page_title = '#' + category;
        }

        const layoutClass = this.props.blogmode
            ? ' layout-block'
            : ' layout-list';
        return (
            <div
                className={
                    'SearchIndex row' +
                    (fetching ? ' fetching' : '') +
                    layoutClass
                }
            >
                <article className="articles">
                    {community && (
                        <span className="hide-for-mq-large articles__header-select">
                            <CommunityPaneMobile
                                community={community}
                                username={this.props.username}
                            />
                        </span>
                    )}
                    <div className="articles__header row">
                        <div className="small-8 medium-7 large-8 column">
                            <h1 className="articles__h1 show-for-mq-large articles__h1--no-wrap">
                                {page_title}
                            </h1>
                            <div className="show-for-mq-large">
                                {community && (
                                    <div
                                        style={{
                                            fontSize: '80%',
                                            color: 'gray',
                                        }}
                                    >
                                        Community
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
                                            Unmoderated tag
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
                    {!fetching && !posts.size ? (
                        <Callout>{emptyText}</Callout>
                    ) : (
                        <PostsList
                            ref="list"
                            posts={posts}
                            loading={fetching}
                            anyPosts
                            order={order}
                            category={category}
                            hideCategory={!!community}
                            loadMore={this.loadMore}
                            showFeatured
                            showPromoted
                            allowAdsOnContent={allowAdsOnContent}
                        />
                    )}
                </article>

                <aside className="c-sidebar c-sidebar--right">
                    {community && (
                        <CommunityPane
                            community={community}
                            username={this.props.username}
                        />
                    )}
                    {this.props.isBrowser &&
                        !community &&
                        !this.props.username && <SidebarNewUsers />}
                    {this.props.isBrowser &&
                        !community &&
                        this.props.username && (
                            <SidebarLinks
                                username={this.props.username}
                                subscriptions={subscriptions}
                            />
                        )}
                    {false && !community && <Notices />}
                    {!category && <SteemMarket />}
                    {allowAdsOnContent && (
                        <div className="sidebar-ad">
                            <GptAd
                                type="Freestar"
                                id="bsa-zone_1566495004689-0_123456"
                            />
                        </div>
                    )}
                </aside>

                <aside className="c-sidebar c-sidebar--left">
                    <Topics
                        order={order}
                        current={category}
                        compact={false}
                        username={this.props.username}
                        topics={topics}
                    />
                    {allowAdsOnContent && (
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
                    )}
                </aside>
            </div>
        );
    }
}

module.exports = {
    path: ':order(/:category)', // TODO: match url for search with order, ':order(/:searchTerm)'
    component: connect(
        (state, ownProps) => {
            debugger;
            // route can be e.g. trending/food (order/category);
            //   or, @username/feed (category/order). Branch on presence of `@`.
            const route = ownProps.routeParams;
            const account_name =
                route.order && route.order[0] == '@'
                    ? route.order.slice(1).toLowerCase()
                    : null;
            const category = account_name
                ? route.order
                : route.category ? route.category.toLowerCase() : null;
            const order = account_name
                ? route.category
                : route.order || 'trending';

            const hive = ifHive(category);
            const community = state.global.getIn(['community', hive], null);

            const allowAdsOnContent =
                ownProps.gptEnabled &&
                !GptUtils.HasBannedTags(
                    [category],
                    state.app.getIn(['googleAds', 'gptBannedTags'])
                );

            const subscriptions = state.global.get('subscriptions');

            return {
                subscriptions: subscriptions ? subscriptions.toJS() : null,
                status: state.global.get('status'),
                loading: state.app.get('loading'),
                account_name,
                category,
                order,
                posts: state.global.getIn(
                    ['discussion_idx', category || '', order],
                    List()
                ),
                community,
                username:
                    state.user.getIn(['current', 'username']) ||
                    state.offchain.get('account'),
                blogmode: state.app.getIn(['user_preferences', 'blogmode']),
                topics: state.global.getIn(['topics'], List()),
                isBrowser: process.env.BROWSER,
                allowAdsOnContent,
            };
        },
        dispatch => ({
            getSubscriptions: account =>
                dispatch(fetchDataSagaActions.getSubscriptions(account)),
            requestData: args =>
                dispatch(fetchDataSagaActions.requestData(args)),
        })
    )(SearchIndex),
};
