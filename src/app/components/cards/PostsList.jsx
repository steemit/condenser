import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import PostSummary from 'app/components/cards/PostSummary';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import debounce from 'lodash.debounce';
import VideoAd from 'app/components/elements/VideoAd';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import tt from 'counterpart';

function topPosition(domElt) {
    if (!domElt) {
        return 0;
    }
    return domElt.offsetTop + topPosition(domElt.offsetParent);
}

class PostsList extends React.Component {
    static propTypes = {
        posts: PropTypes.object,
        loading: PropTypes.bool.isRequired,
        category: PropTypes.string,
        loadMore: PropTypes.func,
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
            blist: [],
            currentSlide: 0,
            arePinnedPostsCollapsed: false,
            hideResteems: process.env.BROWSER
                ? localStorage.getItem('hideResteems') === 'true'
                : false,
        };
        this.scrollListener = this.scrollListener.bind(this);
        this.onBackButton = this.onBackButton.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsList');
        this.nextSlide = this.nextSlide.bind(this);
        this.prevSlide = this.prevSlide.bind(this);
        this.togglePinnedPosts = this.togglePinnedPosts.bind(this);
        this.handleToggleHideResteems = this.handleToggleHideResteems.bind(
            this
        );
    }

    componentDidMount() {
        this.attachScrollListener();
        this.initiatePinnedCollapsedState();
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.category &&
            this.props.category.startsWith('hive-') &&
            this.props.category !== prevProps.category
        ) {
            this.updateSlide(0);
            this.initiatePinnedCollapsedState();
        }
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
            if (loadMore && posts.size > 0) loadMore();
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

    updateSlide(index) {
        const screenWidth = window.innerWidth;
        const filteredPosts = this.props.posts.filter(post =>
            post.getIn(['stats', 'is_pinned'], false)
        );
        let totalSlides = filteredPosts.size;
        if (screenWidth >= 768) {
            totalSlides -= 1; // We reduce the slide count by 1 because we're displaying 2 on a screen and don't want an empty gap at the end
        }
        const pinnedPostsElement = document.querySelector('.pinnedPosts');
        let sliderPosition = 0;
        if (totalSlides > 0) {
            sliderPosition = (index + totalSlides) % totalSlides;
        }
        this.setState({ currentSlide: sliderPosition });
        if (pinnedPostsElement) {
            requestAnimationFrame(() => {
                pinnedPostsElement.style.setProperty(
                    `--pinned`,
                    `-${sliderPosition * 50}%`
                );
            });
        }
    }

    nextSlide() {
        this.updateSlide(this.state.currentSlide + 1);
    }

    prevSlide() {
        this.updateSlide(this.state.currentSlide - 1);
    }

    initiatePinnedCollapsedState() {
        const arePinnedPostsCollapsedStored = process.env.BROWSER
            ? localStorage.getItem('collapsepinned-' + this.props.category)
            : null;
        const arePinnedPostsCollapsed = arePinnedPostsCollapsedStored
            ? JSON.parse(arePinnedPostsCollapsedStored)
            : false;

        if (arePinnedPostsCollapsed !== this.state.arePinnedPostsCollapsed) {
            this.setState({ arePinnedPostsCollapsed });
        }
    }

    togglePinnedPosts() {
        const { category } = this.props;
        const { arePinnedPostsCollapsed } = this.state;
        const updatedCollapsedState = !arePinnedPostsCollapsed;

        this.setState(
            prevState => ({
                arePinnedPostsCollapsed: !prevState.arePinnedPostsCollapsed,
            }),
            () => {
                if (process.env.BROWSER) {
                    localStorage.setItem(
                        'collapsepinned-' + category,
                        updatedCollapsedState
                    );
                }

                if (updatedCollapsedState) {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                }
                this.updateSlide(0);
            }
        );
    }

    handleToggleHideResteems() {
        this.setState(prevState => {
            const newHideResteems = !prevState.hideResteems;
            if (process.env.BROWSER) {
                localStorage.setItem('hideResteems', newHideResteems);
            }
            return { hideResteems: newHideResteems };
        });
    }

    render() {
        const {
            posts,
            loading,
            category,
            order,
            nsfwPref,
            hideCategory,
            depth,
            following,
        } = this.props;
        const {
            thumbSize,
            currentSlide,
            arePinnedPostsCollapsed,
            hideResteems,
        } = this.state;

        const pinnedPosts = posts.filter(post =>
            post.getIn(['stats', 'is_pinned'], false)
        );
        const pinnedPostsCount = pinnedPosts.size;
        const screenWidth = process.env.BROWSER ? window.innerWidth : 0;

        const renderSummary = items =>
            items.map((post, i) => {
                const ps = (
                    <PostSummary
                        post={post}
                        thumbSize={thumbSize}
                        nsfwPref={nsfwPref}
                        hideCategory={hideCategory}
                        order={order}
                        depth={depth}
                    />
                );

                const summary = [];
                summary.push(
                    <li
                        key={i}
                        className={
                            (post.getIn(['stats', 'is_pinned'], false)
                                ? 'isPinned'
                                : '') +
                            (hideResteems &&
                            post.get('reblogged_by') &&
                            !following.includes(post.get('author'))
                                ? ' hideResteems'
                                : '')
                        }
                    >
                        {ps}
                    </li>
                );

                const every = this.props.adSlots.in_feed_1.every;
                if (false && this.props.videoAdsEnabled && i === 4) {
                    summary.push(
                        <div key={`id-${i}`}>
                            <div className="articles__content-block--ad video-ad">
                                <VideoAd id="bsa-zone_1572296522077-3_123456" />
                            </div>
                        </div>
                    );
                } else if (
                    this.props.shouldSeeAds &&
                    i >= every &&
                    i % every === 0 &&
                    depth !== 2
                ) {
                    summary.push(
                        <div
                            key={`ad-${i}`}
                            className="articles__content-block--ad"
                        />
                    );
                }
                return summary;
            });

        const renderDotLinks = totalItems => {
            let adjustedTotalItems = totalItems;
            if (screenWidth >= 768) {
                adjustedTotalItems -= 1;
            }
            const dots = Array.from({ length: adjustedTotalItems }, (_, i) => (
                <span
                    key={i}
                    className={currentSlide === i ? 'dot active' : 'dot'}
                    role="button"
                    onClick={() => this.updateSlide(i)}
                />
            ));
            return dots;
        };

        return (
            <div id="posts_list" className="PostsList">
                {order === 'feed' && (
                    <div>
                        <input
                            type="checkbox"
                            checked={hideResteems}
                            onChange={this.handleToggleHideResteems}
                            id="hideResteems"
                        />
                        <label
                            htmlFor="hideResteems"
                            className="hideResteemsLabel"
                        >
                            {tt('user_profile.hide_resteems')}
                        </label>
                    </div>
                )}
                {category &&
                    category.startsWith('hive-') &&
                    pinnedPostsCount > 0 &&
                    (order === 'trending' || order === 'created') && (
                        <div
                            className={`${
                                arePinnedPostsCollapsed && pinnedPostsCount >= 2
                                    ? 'pinnedPostsContainer'
                                    : ''
                            }`}
                        >
                            {arePinnedPostsCollapsed &&
                                ((pinnedPostsCount > 1 && screenWidth < 768) ||
                                    pinnedPostsCount > 2) && (
                                    <button
                                        className="prev"
                                        onClick={this.prevSlide}
                                    >
                                        &#10094;
                                    </button>
                                )}
                            <ul
                                className="PostsList__summaries hfeed pinnedPosts"
                                itemScope
                                itemType="http://schema.org/blogPosts"
                            >
                                {renderSummary(pinnedPosts)}
                            </ul>
                            {arePinnedPostsCollapsed &&
                                ((pinnedPostsCount > 1 && screenWidth < 768) ||
                                    pinnedPostsCount > 2) && (
                                    <button
                                        className="next"
                                        onClick={this.nextSlide}
                                    >
                                        &#10095;
                                    </button>
                                )}
                            {arePinnedPostsCollapsed &&
                                ((pinnedPostsCount > 1 && screenWidth < 768) ||
                                    pinnedPostsCount > 2) && (
                                    <div className="carouselDots">
                                        {renderDotLinks(pinnedPostsCount)}
                                    </div>
                                )}
                            {pinnedPostsCount >= 2 && (
                                <div className="collapseShowPinned">
                                    <a
                                        href="#"
                                        onClick={event => {
                                            this.togglePinnedPosts();
                                            event.preventDefault();
                                        }}
                                    >
                                        {pinnedPostsCount == 2 &&
                                        arePinnedPostsCollapsed
                                            ? tt('g.view_as_list') + ' \u25BC'
                                            : arePinnedPostsCollapsed
                                              ? tt('g.show_pinned') + ' \u25BC'
                                              : tt('g.collapse_pinned') +
                                                ' \u25B2'}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                <ul
                    className="PostsList__summaries hfeed"
                    itemScope
                    itemType="http://schema.org/blogPosts"
                >
                    {category &&
                    category.startsWith('hive-') &&
                    (order === 'trending' || order === 'created')
                        ? renderSummary(
                              posts.filter(
                                  post =>
                                      !post.getIn(['stats', 'is_pinned'], false)
                              )
                          )
                        : renderSummary(posts)}
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
        const userPreferences = state.app.get('user_preferences').toJS();
        const nsfwPref = userPreferences.nsfwPref || 'warn';
        const shouldSeeAds = state.app.getIn(['googleAds', 'enabled']);
        const videoAdsEnabled = state.app.getIn([
            'googleAds',
            'videoAdsEnabled',
        ]);
        const adSlots = state.app.getIn(['googleAds', 'adSlots']).toJS();

        const current = state.user.get('current');
        const username = current
            ? current.get('username')
            : state.offchain.get('account');
        const mutes = state.global.getIn(
            ['follow', 'getFollowingAsync', username, 'ignore_result'],
            List()
        );
        const pathname = state.global.get('pathname');
        const [_, userFeed] = pathname.split('/');
        const following = state.global.getIn(
            ['follow', 'getFollowingAsync', userFeed.slice(1), 'blog_result'],
            List()
        );

        const blacklist = state.global.get('blacklist');
        let { posts } = props;
        if (typeof posts === 'undefined') {
            const { post_refs, loading } = props;
            if (post_refs) {
                posts = [];
                props.post_refs.forEach(ref => {
                    const post = state.global.getIn(['content', ref]);
                    if (!post) {
                        // can occur when deleting a post
                        // console.error('PostsList --> Missing cont key: ' + ref);
                        return;
                    }
                    const muted = mutes.has(post.get('author'));
                    if (!muted) posts.push(post);
                });
                posts = List(posts);
            } else {
                console.error('PostsList: no `posts` or `post_refs`');
            }
        }

        return {
            ...props, //loading,category,order,hideCategory
            posts,
            nsfwPref,
            shouldSeeAds,
            videoAdsEnabled,
            adSlots,
            blacklist,
            following,
        };
    },
    dispatch => ({
        fetchState: pathname => {
            dispatch(fetchDataSagaActions.fetchState({ pathname }));
        },
    })
)(PostsList);
