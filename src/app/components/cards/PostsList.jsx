import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import * as userActions from 'app/redux/UserReducer';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import PostSummary from 'app/components/cards/PostSummary';
import Post from 'app/components/pages/Post';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import debounce from 'lodash.debounce';
import { findParent } from 'app/utils/DomUtils';
import Icon from 'app/components/elements/Icon';
import GptAd from 'app/components/elements/GptAd';

import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';

function topPosition(domElt) {
    if (!domElt) {
        return 0;
    }
    return domElt.offsetTop + topPosition(domElt.offsetParent);
}

class PostsList extends React.Component {
    static propTypes = {
        posts: PropTypes.object.isRequired,
        loading: PropTypes.bool.isRequired,
        category: PropTypes.string,
        loadMore: PropTypes.func,
        showResteem: PropTypes.bool,
        pathname: PropTypes.string,
        nsfwPref: PropTypes.string.isRequired,
    };

    static defaultProps = {
        loading: false,
    };

    constructor() {
        super();
        this.state = {
            thumbSize: 'desktop',
            showNegativeComments: false,
        };
        this.scrollListener = this.scrollListener.bind(this);
        this.onBackButton = this.onBackButton.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsList');
    }

    componentDidMount() {
        this.attachScrollListener();
    }

    componentWillUnmount() {
        this.detachScrollListener();
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
    }

    onBackButton(e) {
        if ('keyCode' in e && e.keyCode !== 27) return;
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
    }

    fetchIfNeeded() {
        this.scrollListener();
    }

    scrollListener = debounce(() => {
        const el = window.document.getElementById('posts_list');
        if (!el) return;
        const scrollTop =
            window.pageYOffset !== undefined
                ? window.pageYOffset
                : (
                      document.documentElement ||
                      document.body.parentNode ||
                      document.body
                  ).scrollTop;
        if (
            topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight <
            10
        ) {
            const { loadMore, posts } = this.props;
            if (loadMore && posts && posts.size) loadMore(posts.last());
        }

        // Detect if we're in mobile mode (renders larger preview imgs)
        const mq = window.matchMedia('screen and (max-width: 39.9375em)');
        if (mq.matches) {
            this.setState({ thumbSize: 'mobile' });
        } else {
            this.setState({ thumbSize: 'desktop' });
        }
    }, 150);

    attachScrollListener() {
        window.addEventListener('scroll', this.scrollListener, {
            capture: false,
            passive: true,
        });
        window.addEventListener('resize', this.scrollListener, {
            capture: false,
            passive: true,
        });
        this.scrollListener();
    }

    detachScrollListener() {
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('resize', this.scrollListener);
    }

    render() {
        const {
            posts,
            showFeatured,
            showPromoted,
            showResteem,
            loading,
            anyPosts,
            pathname,
            category,
            order,
            content,
            ignore_result,
            account,
            username,
            nsfwPref,
            hideCategory,
        } = this.props;
        const { thumbSize } = this.state;
        const postsInfo = [];
        posts.forEach(item => {
            const cont = content.get(item);
            if (!cont) {
                // can occur when deleting a post
                console.error('PostsList --> Missing cont key: ' + item);
                return;
            }
            const author = cont.get('author');
            const ignore = ignore_result && ignore_result.has(author);
            const hideResteem = !showResteem && account && author != account;
            if (!(hideResteem || ignore)) postsInfo.push({ item, ignore });
        });

        // Helper functions for determining whether to show special posts.
        const isLoggedInOnFeed = username && pathname === `/@${username}/feed`;
        const isLoggedOutOnTrending =
            !username &&
            (pathname === '/' ||
                pathname === '/trending' ||
                pathname === '/trending/');

        const areFeaturedPostsVisible =
            showFeatured && (isLoggedInOnFeed || isLoggedOutOnTrending);
        const areFeaturedPostsReady = isLoggedInOnFeed
            ? anyPosts
            : postsInfo.length > 0;
        const showFeaturedPosts =
            areFeaturedPostsVisible && areFeaturedPostsReady;

        const featureds = this.props.featured;
        const renderFeatured = featuredPosts => {
            if (!process.env.BROWSER) return null;
            return featuredPosts.map(featuredPost => {
                const id = `${featuredPost.author}/${featuredPost.permlink}`;
                if (localStorage.getItem(`hidden-featured-post-${id}`))
                    return null;
                const featuredPostContent = content.get(id);
                const isSeen = featuredPostContent.get('seen');
                const close = e => {
                    e.preventDefault();
                    localStorage.setItem(`hidden-featured-post-${id}`, true);
                    this.forceUpdate();
                };
                return (
                    <li key={id}>
                        <PostSummary
                            account={account}
                            post={id}
                            thumbSize={thumbSize}
                            ignore={false}
                            nsfwPref={nsfwPref}
                            featured
                            onClose={close}
                        />
                    </li>
                );
            });
        };

        const arePromotedPostsVisible =
            showPromoted && (isLoggedInOnFeed || isLoggedOutOnTrending);
        const arePromotedPostsReady = isLoggedInOnFeed
            ? anyPosts
            : postsInfo.length > 0;
        const showPromotedPosts =
            arePromotedPostsVisible && arePromotedPostsReady;

        const promoteds = this.props.promoted;
        const renderPromoted = promotedPosts => {
            if (!process.env.BROWSER) return null;
            return promotedPosts.map(promotedPost => {
                const id = `${promotedPost.author}/${promotedPost.permlink}`;
                if (localStorage.getItem(`hidden-promoted-post-${id}`))
                    return null;
                const promotedPostContent = content.get(id);
                const isSeen = promotedPostContent.get('seen');
                const close = e => {
                    e.preventDefault();
                    localStorage.setItem(`hidden-promoted-post-${id}`, true);
                    this.forceUpdate();
                };
                return (
                    <li key={id}>
                        <PostSummary
                            account={account}
                            post={id}
                            thumbSize={thumbSize}
                            ignore={false}
                            nsfwPref={nsfwPref}
                            promoted
                            onClose={close}
                        />
                    </li>
                );
            });
        };

        const renderSummary = items =>
            items.map((item, i) => {
                const ps = (
                    <PostSummary
                        account={account}
                        post={item.item}
                        thumbSize={thumbSize}
                        ignore={item.ignore}
                        nsfwPref={nsfwPref}
                        hideCategory={hideCategory}
                        order={order}
                    />
                );

                const every = this.props.adSlots.in_feed_1.every;
                if (this.props.shouldSeeAds && i >= every && i % every === 0) {
                    return (
                        <div key={item.item}>
                            <li>{ps}</li>

                            <div className="articles__content-block--ad">
                                <GptAd
                                    tags={[category]}
                                    type="Freestar"
                                    id="bsa-zone_1566495089502-1_123456"
                                />
                            </div>
                        </div>
                    );
                }
                return <li key={item.item}>{ps}</li>;
            });

        return (
            <div id="posts_list" className="PostsList">
                <ul
                    className="PostsList__summaries hfeed"
                    itemScope
                    itemType="http://schema.org/blogPosts"
                >
                    {/* Only render featured and promoted posts when other posts are ready */}
                    {showFeaturedPosts && renderFeatured(featureds)}
                    {showPromotedPosts && renderPromoted(promoteds)}
                    {renderSummary(postsInfo)}
                </ul>
                {loading && (
                    <center>
                        <LoadingIndicator
                            style={{ marginBottom: '2rem' }}
                            type="circle"
                        />
                    </center>
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const pathname = state.app.get('location').pathname;
        const current = state.user.get('current');
        const username = current
            ? current.get('username')
            : state.offchain.get('account');
        const content = state.global.get('content');
        const ignore_result = state.global.getIn([
            'follow',
            'getFollowingAsync',
            username,
            'ignore_result',
        ]);
        const userPreferences = state.app.get('user_preferences').toJS();
        const nsfwPref = userPreferences.nsfwPref || 'warn';
        const featured = state.offchain
            .get('special_posts')
            .get('featured_posts')
            .toJS();
        const promoted = state.offchain
            .get('special_posts')
            .get('promoted_posts')
            .toJS();
        const shouldSeeAds = state.app.getIn(['googleAds', 'enabled']);
        const adSlots = state.app.getIn(['googleAds', 'adSlots']).toJS();

        return {
            ...props,
            pathname,
            username,
            content,
            ignore_result,
            nsfwPref,
            featured,
            promoted,
            shouldSeeAds,
            adSlots,
        };
    },
    dispatch => ({
        fetchState: pathname => {
            dispatch(fetchDataSagaActions.fetchState({ pathname }));
        },
    })
)(PostsList);
