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
import GoogleAd from 'app/components/elements/GoogleAd';
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
        showSpam: PropTypes.bool,
        showResteem: PropTypes.bool,
        fetchState: PropTypes.func.isRequired,
        pathname: PropTypes.string,
        nsfwPref: PropTypes.string.isRequired,
    };

    static defaultProps = {
        showSpam: false,
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
        this.closeOnOutsideClick = this.closeOnOutsideClick.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsList');
    }

    componentDidMount() {
        this.attachScrollListener();
    }

    componentWillUnmount() {
        this.detachScrollListener();
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
        const post_overlay = document.getElementById('post_overlay');
        if (post_overlay)
            post_overlay.removeEventListener('click', this.closeOnOutsideClick);
        document.getElementsByTagName('body')[0].className = '';
    }

    onBackButton(e) {
        if ('keyCode' in e && e.keyCode !== 27) return;
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
    }

    closeOnOutsideClick(e) {
        const inside_post = findParent(e.target, 'PostsList__post_container');
        if (!inside_post) {
            const inside_top_bar = findParent(
                e.target,
                'PostsList__post_top_bar'
            );
            if (!inside_top_bar) {
                const post_overlay = document.getElementById('post_overlay');
                if (post_overlay)
                    post_overlay.removeEventListener(
                        'click',
                        this.closeOnOutsideClick
                    );
                this.closePostModal();
            }
        }
    }

    fetchIfNeeded() {
        this.scrollListener();
    }

    toggleNegativeReplies = () => {
        this.setState({
            showNegativeComments: !this.state.showNegativeComments,
        });
    };

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
            const { loadMore, posts, category, showResteem } = this.props;
            if (loadMore && posts && posts.size)
                loadMore(posts.last(), category, showResteem);
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
            showPinned,
            showResteem,
            showSpam,
            loading,
            anyPosts,
            pathname,
            category,
            content,
            ignore_result,
            account,
            username,
            nsfwPref,
        } = this.props;
        const { thumbSize } = this.state;
        const postsInfo = [];
        posts.forEach(item => {
            const cont = content.get(item);
            if (!cont) {
                console.error('PostsList --> Missing cont key', item);
                return;
            }
            const ignore =
                ignore_result && ignore_result.has(cont.get('author'));
            const hideResteem =
                !showResteem && account && cont.get('author') != account;
            const hide = cont.getIn(['stats', 'hide']);
            if (!hideResteem && (!(ignore || hide) || showSpam))
                // rephide
                postsInfo.push({ item, ignore });
        });

        // Helper functions for determining whether to show pinned posts.
        const isLoggedInOnFeed = username && pathname === `/@${username}/feed`;
        const isLoggedOutOnTrending =
            !username && (pathname === '/' || pathname === '/trending');
        const arePinnedPostsVisible =
            showPinned && (isLoggedInOnFeed || isLoggedOutOnTrending);
        const arePinnedPostsReady = isLoggedInOnFeed
            ? anyPosts
            : postsInfo.length > 0;
        const showPinnedPosts = arePinnedPostsVisible && arePinnedPostsReady;

        const pinned = this.props.pinned;
        const renderPinned = pinnedPosts => {
            if (!process.env.BROWSER) return null;
            return pinnedPosts.map(pinnedPost => {
                const id = `${pinnedPost.author}/${pinnedPost.permlink}`;
                if (localStorage.getItem(`hidden-pinned-post-${id}`))
                    return null;
                const pinnedPostContent = content.get(id);
                const isSeen = pinnedPostContent.get('seen');
                const close = e => {
                    e.preventDefault();
                    localStorage.setItem(`hidden-pinned-post-${id}`, true);
                    this.forceUpdate();
                };
                return (
                    <li key={id}>
                        <div className="PinLabel">
                            <span className="PinText">Featured</span>
                            <a
                                onClick={close}
                                className="DismissPost"
                                title="Dismiss Post"
                            >
                                <Icon name="close" />
                            </a>
                        </div>
                        <PostSummary
                            account={account}
                            post={id}
                            thumbSize={thumbSize}
                            ignore={false}
                            nsfwPref={nsfwPref}
                        />
                    </li>
                );
            });
        };
        const renderSummary = items =>
            items.map((item, i) => {
                const every = this.props.adSlots.in_feed_1.every;
                if (this.props.shouldSeeAds && i >= every && i % every === 0) {
                    return (
                        <div key={item.item}>
                            <li>
                                <PostSummary
                                    account={account}
                                    post={item.item}
                                    thumbSize={thumbSize}
                                    ignore={item.ignore}
                                    nsfwPref={nsfwPref}
                                />
                            </li>

                            <div className="articles__content-block--ad">
                                <GoogleAd
                                    name="in-feed-1"
                                    format="fluid"
                                    slot={this.props.adSlots.in_feed_1.slot_id}
                                    layoutKey={
                                        this.props.adSlots.in_feed_1.layout_key
                                    }
                                    style={{ display: 'block' }}
                                />
                            </div>
                        </div>
                    );
                }
                return (
                    <li key={item.item}>
                        <PostSummary
                            account={account}
                            post={item.item}
                            thumbSize={thumbSize}
                            ignore={item.ignore}
                            nsfwPref={nsfwPref}
                        />
                    </li>
                );
            });

        return (
            <div id="posts_list" className="PostsList">
                <ul
                    className="PostsList__summaries hfeed"
                    itemScope
                    itemType="http://schema.org/blogPosts"
                >
                    {/* Only render pinned posts when other posts are ready */}
                    {showPinnedPosts && renderPinned(pinned)}
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
        const pinned = state.offchain
            .get('pinned_posts')
            .get('pinned_posts')
            .toJS();
        const shouldSeeAds = state.app.getIn(['googleAds', 'enabled']);
        const adSlots = state.app.getIn(['googleAds', 'adSlots']).toJS();

        return {
            ...props,
            pathname,
            username,
            content,
            ignore_result,
            pathname,
            nsfwPref,
            pinned,
            shouldSeeAds,
            adSlots,
        };
    },
    dispatch => ({
        fetchState: pathname => {
            dispatch(fetchDataSagaActions.fetchState({ pathname }));
        },
        removeHighSecurityKeys: () => {
            dispatch(userActions.removeHighSecurityKeys());
        },
    })
)(PostsList);
