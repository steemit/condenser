import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';
import tt from 'counterpart';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import PostSummary from 'app/components/cards/PostSummary';
import Post from 'app/components/pages/Post';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { findParent } from 'app/utils/DomUtils';
import Icon from 'app/components/elements/Icon';
import KEYS from 'app/utils/keyCodes';

function topPosition(domElt) {
    if (!domElt) {
        return 0;
    }
    return domElt.offsetTop + topPosition(domElt.offsetParent);
}

class PostsList extends PureComponent {
    static propTypes = {
        posts: PropTypes.object.isRequired,
        loading: PropTypes.bool.isRequired,
        category: PropTypes.string,
        loadMore: PropTypes.func,
        showSpam: PropTypes.bool,
        fetchState: PropTypes.func.isRequired,
        pathname: PropTypes.string,
        ignoreResult: PropTypes.any,
    };

    static defaultProps = {
        showSpam: false,
    };

    state = {
        thumbSize: 'desktop',
        nsfwPref: 'warn',
        showPost: null,
    };

    readNsfwPref() {
        if (!process.env.BROWSER) {
            return;
        }
        const { username } = this.props;
        const key = 'nsfwPref' + (username ? '-' + username : '');

        this.setState({
            nsfwPref: localStorage.getItem(key) || 'warn',
        });
    }

    componentDidMount() {
        this.readNsfwPref();
        this.scrollListener();
        this.attachScrollListener();
    }

    componentWillUpdate() {
        const path = `${location.pathname}${location.search}${location.hash}`;
        if (this.state.showPost && path !== this.post_url) {
            this.setState({ showPost: null });
        }
        this.readNsfwPref();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.showPost && !prevState.showPost) {
            document.body.classList.add('with-post-overlay');
            window.addEventListener('popstate', this.onBackButton);
            window.addEventListener('keydown', this.onBackButton);
            const postOverlay = document.getElementById('post_overlay');
            if (postOverlay) {
                postOverlay.addEventListener('click', this.closeOnOutsideClick);
                postOverlay.focus();
            }
        }
        if (!this.state.showPost && prevState.showPost) {
            window.history.pushState({}, '', this.props.pathname);
            document.body.classList.remove('with-post-overlay');
            this.post_url = null;
        }
    }

    componentWillUnmount() {
        this.detachScrollListener();
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
        const postOverlay = document.getElementById('post_overlay');
        if (postOverlay) {
            postOverlay.removeEventListener('click', this.closeOnOutsideClick);
        }
        document.body.classList.remove('with-post-overlay');
    }

    onBackButton = e => {
        if ('keyCode' in e && e.keyCode !== KEYS.ESCAPE) return;
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
        this.closePostModal();
    };

    closeOnOutsideClick = e => {
        const inside_post = findParent(e.target, 'PostsList__post_container');
        if (!inside_post) {
            const inside_top_bar = findParent(
                e.target,
                'PostsList__post_top_bar'
            );
            if (!inside_top_bar) {
                const post_overlay = document.getElementById('post_overlay');
                if (post_overlay) {
                    post_overlay.removeEventListener(
                        'click',
                        this.closeOnOutsideClick
                    );
                }
                this.closePostModal();
            }
        }
    };

    closePostModal = () => {
        window.document.title = this.state.prevTitle;
        this.setState({ showPost: null, prevTitle: null });
    };

    fetchIfNeeded() {
        this.scrollListener();
    }

    scrollListener = throttle(() => {
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
            const { loadMore, posts, category } = this.props;

            if (loadMore && posts && posts.size) {
                loadMore(posts.last(), category);
            }
        }

        // Detect if we're in mobile mode (renders larger preview imgs)
        const mq = window.matchMedia('screen and (max-width: 39.9375em)');
        if (mq.matches) {
            this.setState({ thumbSize: 'mobile' });
        } else {
            this.setState({ thumbSize: 'desktop' });
        }
    }, 150, { leading: false });

    attachScrollListener() {
        window.addEventListener('scroll', this.scrollListener);
        window.addEventListener('resize', this.scrollListener);
    }

    detachScrollListener() {
        this.scrollListener.cancel();
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('resize', this.scrollListener);
    }

    onPostClick = (post, url) => {
        this.post_url = url;
        this.props.fetchState(url);
        this.props.removeHighSecurityKeys();
        this.setState({ showPost: post, prevTitle: window.document.title });
        window.history.pushState({}, '', url);
    };

    render() {
        const {
            posts,
            showSpam,
            loading,
            category,
            content,
            ignoreResult,
            account,
        } = this.props;

        const { thumbSize, showPost, nsfwPref } = this.state;

        const postsInfo = [];
        let aiPosts = [];

        posts.forEach(item => {
            if (showPost) {
                aiPosts.push(item);
            }
            const cont = content.get(item);
            if (!cont) {
                console.error('PostsList --> Missing cont key', item);
                return;
            }
            const ignore = ignoreResult && ignoreResult.has(cont.get('author'));
            const hide = cont.getIn(['stats', 'hide']);

            if (!(ignore || hide) || showSpam) {
                postsInfo.push({ item, ignore });
            }
        });

        if (showPost) {
            const sliceCount = 5;
            const index = aiPosts.indexOf(showPost);
            aiPosts = aiPosts.slice(
                index < sliceCount ? 0 : index - sliceCount,
                index + sliceCount + 1
            );
        }

        const renderSummary = items =>
            items.map(item => (
                <li key={item.item}>
                    <PostSummary
                        account={account}
                        post={item.item}
                        currentCategory={category}
                        thumbSize={thumbSize}
                        ignore={item.ignore}
                        onClick={this.onPostClick}
                        nsfwPref={nsfwPref}
                    />
                </li>
            ));

        return (
            <div id="posts_list" className="PostsList">
                <ul
                    className="PostsList__summaries hfeed"
                    itemScope
                    itemType="http://schema.org/blogPosts"
                >
                    {renderSummary(postsInfo)}
                </ul>
                {loading && (
                    <center>
                        <LoadingIndicator type="circle" />
                    </center>
                )}
                {showPost && (
                    <div
                        id="post_overlay"
                        className="PostsList__post_overlay"
                        tabIndex={0}
                    >
                        <div className="PostsList__post_top_overlay">
                            <div className="PostsList__post_top_bar">
                                <button
                                    className="back-button"
                                    type="button"
                                    title={tt('g.back')}
                                    onClick={() => {
                                        this.setState({ showPost: null });
                                    }}
                                >
                                    <span aria-hidden="true">
                                        <Icon name="chevron-left" />
                                    </span>
                                </button>
                                <CloseButton onClick={this.closePostModal} />
                            </div>
                        </div>
                        <div className="PostsList__post_container">
                            <Post post={showPost} aiPosts={aiPosts} />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const current = state.user.get('current');
        const username = current
            ? current.get('username')
            : state.offchain.get('account');

        return {
            ...props,
            username,
            content: state.global.get('content'),
            ignoreResult: state.global.getIn([
                'follow',
                'getFollowingAsync',
                username,
                'ignore_result',
            ]),
            pathname: state.app.get('location').pathname,
        };
    },
    {
        fetchState: pathname => ({
            type: 'FETCH_STATE',
            payload: { pathname },
        }),
        removeHighSecurityKeys: () => ({
            type: 'user/REMOVE_HIGH_SECURITY_KEYS',
        }),
    }
)(PostsList);
