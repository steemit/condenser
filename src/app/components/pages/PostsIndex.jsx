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
import { GptUtils } from 'app/utils/GptUtils';
import ArticleLayoutSelector from 'app/components/modules/ArticleLayoutSelector';
import Topics from './Topics';
import SortOrder from 'app/components/elements/SortOrder';
import { ifHive } from 'app/utils/Community';
import PostsIndexLayout from 'app/components/pages/PostsIndexLayout';

// posts_index.empty_feed_1 [-5]
const noFriendsText = (
    <div>
        You haven't followed anyone yet!<br />
        <br />
        <span style={{ fontSize: '1.25rem' }}>
            <Link to="/">Explore Trending</Link>
        </span>
        <br />
        <br />
        <Link to="/welcome">New users guide</Link>
    </div>
);

const noCommunitiesText = (
    <div>
        You haven't joined any communities yet!<br />
        <br />
        <span style={{ fontSize: '1.25rem' }}>
            <Link to="/communities">Explore Communities</Link>
        </span>
        {/*
        <br /><br />
        <Link to="/welcome">New users guide</Link>*/}
    </div>
);

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

    constructor() {
        super();
        this.state = {};
        this.loadMore = this.loadMore.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsIndex');
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
        if (last_post == this.props.pending) return; // if last post is 'pending', its an invalid start token
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
            enableAds,
            community,
            category,
            account_name, // TODO: for feed
            order,
            posts,
        } = this.props;

        let emptyText = '';
        if (order === 'feed') {
            emptyText = noFriendsText;
        } else if (category === 'my') {
            emptyText = noCommunitiesText;
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
                //page_title = tt('posts_index.accountnames_feed', {
                //    account_name,
                //});
                //page_title = '@' + account_name + "'s friends"
                page_title = 'My friends';
        } else if (category === 'my') {
            page_title = 'My communities';
        } else if (community) {
            page_title = community.get('title');
        } else if (category) {
            page_title = '#' + category;
        }

        return (
            <PostsIndexLayout
                category={category}
                enableAds={enableAds}
                blogmode={this.props.blogmode}
            >
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
                                current={category}
                                topics={subscriptions || topics}
                                compact
                            />
                        </span>
                    </div>
                    {order != 'feed' &&
                        !(category === 'my' && !posts.size) && (
                            <div className="small-4 medium-4 large-3 column articles__header-select">
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
                        allowAdsOnContent={enableAds}
                    />
                )}
            </PostsIndexLayout>
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

            const enableAds =
                ownProps.gptEnabled &&
                !GptUtils.HasBannedTags(
                    [category],
                    state.app.getIn(['googleAds', 'gptBannedTags'])
                );

            const key = ['discussion_idx', category || '', order];
            let posts = state.global.getIn(key, List());

            // if 'pending' post is found, prepend it to posts list
            //   (see GlobalReducer RECEIVE_CONTENT)
            const pkey = ['discussion_idx', category || '', '_' + order];
            const pending = state.global.getIn(pkey, null);
            if (pending && !posts.includes(pending)) {
                posts = posts.unshift(pending);
            }

            return {
                subscriptions: state.global.get('subscriptions'),
                status: state.global.get('status'),
                loading: state.app.get('loading'),
                account_name,
                category,
                order,
                posts,
                pending,
                community,
                username:
                    state.user.getIn(['current', 'username']) ||
                    state.offchain.get('account'),
                blogmode: state.app.getIn(['user_preferences', 'blogmode']),
                topics: state.global.getIn(['topics'], List()),
                isBrowser: process.env.BROWSER,
                enableAds,
            };
        },
        dispatch => ({
            getSubscriptions: account =>
                dispatch(fetchDataSagaActions.getSubscriptions(account)),
            requestData: args =>
                dispatch(fetchDataSagaActions.requestData(args)),
        })
    )(PostsIndex),
};
