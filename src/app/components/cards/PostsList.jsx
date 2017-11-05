import React, {PropTypes} from 'react';
import PostSummary from 'app/components/cards/PostSummary';
import Post from 'app/components/pages/Post';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import debounce from 'lodash.debounce';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import {findParent} from 'app/utils/DomUtils';
import Icon from 'app/components/elements/Icon';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {connect} from 'react-redux'
import tt from 'counterpart';

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
        fetchState: PropTypes.func.isRequired,
        pathname: PropTypes.string,
        nsfwPref: PropTypes.string.isRequired
    };

    static defaultProps = {
        showSpam: false,
    }

    constructor() {
        super();
        this.state = {
            thumbSize: 'desktop',
            showNegativeComments: false,
            showPost: null
        }
        this.scrollListener = this.scrollListener.bind(this);
        this.onPostClick = this.onPostClick.bind(this);
        this.onBackButton = this.onBackButton.bind(this);
        this.closeOnOutsideClick = this.closeOnOutsideClick.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsList')
    }

    componentDidMount() {
        this.attachScrollListener();
    }

    componentWillUpdate() {
        const location = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (this.state.showPost && (location !== this.post_url)) {
            this.setState({showPost: null});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.showPost && !prevState.showPost) {
            document.getElementsByTagName('body')[0].className = 'with-post-overlay';
            window.addEventListener('popstate', this.onBackButton);
            window.addEventListener('keydown', this.onBackButton);
            const post_overlay = document.getElementById('post_overlay');
            if (post_overlay) {
                post_overlay.addEventListener('click', this.closeOnOutsideClick);
                post_overlay.focus();
            }
        }
        if (!this.state.showPost && prevState.showPost) {
            window.history.pushState({}, '', this.props.pathname);
            document.getElementsByTagName('body')[0].className = '';
            this.post_url = null;
        }
    }

    componentWillUnmount() {
        this.detachScrollListener();
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
        const post_overlay = document.getElementById('post_overlay');
        if (post_overlay) post_overlay.removeEventListener('click', this.closeOnOutsideClick);
        document.getElementsByTagName('body')[0].className = "";
    }

    onBackButton(e) {
        if ('keyCode' in e && e.keyCode !== 27) return;
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
        this.closePostModal();
    }

    closeOnOutsideClick(e) {
        const inside_post = findParent(e.target, 'PostsList__post_container');
        if (!inside_post) {
            const inside_top_bar = findParent(e.target, 'PostsList__post_top_bar');
            if (!inside_top_bar) {
                const post_overlay = document.getElementById('post_overlay');
                if (post_overlay) post_overlay.removeEventListener('click', this.closeOnOutsideClick);
                this.closePostModal();
            }
        }
    }

    closePostModal = () => {
        window.document.title = this.state.prevTitle;
        this.setState({showPost: null, prevTitle: null});
    }

    fetchIfNeeded() {
        this.scrollListener();
    }

    toggleNegativeReplies = () => {
        this.setState({
            showNegativeComments: !this.state.showNegativeComments
        });
    }

    scrollListener = debounce(() => {
        const el = window.document.getElementById('posts_list');
        if (!el) return;
        const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
            (document.documentElement || document.body.parentNode || document.body).scrollTop;
        if (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < 10) {
            const {loadMore, posts, category} = this.props;
            if (loadMore && posts && posts.size) loadMore(posts.last(), category);
        }

        // Detect if we're in mobile mode (renders larger preview imgs)
        const mq = window.matchMedia('screen and (max-width: 39.9375em)');
        if(mq.matches) {
            this.setState({thumbSize: 'mobile'})
        } else {
            this.setState({thumbSize: 'desktop'})
        }
    }, 150)

    attachScrollListener() {
        window.addEventListener('scroll', this.scrollListener, {capture: false, passive: true});
        window.addEventListener('resize', this.scrollListener, {capture: false, passive: true});
        this.scrollListener();
    }

    detachScrollListener() {
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('resize', this.scrollListener);
    }

    onPostClick(post, url) {
        this.post_url = url;
        this.props.fetchState(url);
        this.props.removeHighSecurityKeys();
        this.setState({showPost: post, prevTitle: window.document.title});
        window.history.pushState({}, '', url);
    }

    render() {
        const {posts, showSpam, loading, category, content,
            ignore_result, account, nsfwPref} = this.props;
        const {thumbSize, showPost} = this.state
        const postsInfo = [];
        posts.forEach((item) => {
            const cont = content.get(item);
            if(!cont) {
                console.error('PostsList --> Missing cont key', item)
                return
            }
            const ignore = ignore_result && ignore_result.has(cont.get('author'))
            const hide = cont.getIn(['stats', 'hide'])
            if(!(ignore || hide) || showSpam) // rephide
                postsInfo.push({item, ignore})
        });
        const renderSummary = items => items.map(item => <li key={item.item}>
            <PostSummary
                account={account}
                post={item.item}
                thumbSize={thumbSize}
                ignore={item.ignore}
                onClick={this.onPostClick}
                nsfwPref={nsfwPref}
            />
        </li>)

        return (
            <div id="posts_list" className="PostsList">
                <ul className="PostsList__summaries hfeed" itemScope itemType="http://schema.org/blogPosts">
                    {renderSummary(postsInfo)}
                </ul>
                {loading && <center><LoadingIndicator style={{marginBottom: "2rem"}} type="circle" /></center>}
                {showPost && <div id="post_overlay" className="PostsList__post_overlay" tabIndex={0}>
                    <div className="PostsList__post_top_overlay">
                        <div className="PostsList__post_top_bar">
                            <ul className="menu back-button-menu">
                                <li><a onClick={(e) => {e.preventDefault(); this.setState({showPost: null}) }} href="#"><i><Icon name="chevron-left" /></i> <span>{tt('g.go_back')}</span></a></li>
                            </ul>
                            <CloseButton onClick={this.closePostModal} />
                        </div>
                    </div>
                    <div className="PostsList__post_container">
                        <Post post={showPost} />
                    </div>
                </div>}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const pathname = state.getIn(['app', 'location']).pathname;
        const current = state.getIn(['user', 'current'])
        const username = current ? current.get('username') : state.getIn(['offchain', 'account'])
        const content = state.getIn(['global', 'content']);
        const ignore_result = state.getIn(['global', 'follow', 'getFollowingAsync', username, 'ignore_result']);
        const userPreferences = state.getIn(['app', 'user_preferences']).toJS();
        const nsfwPref = userPreferences.nsfwPref || 'warn';
        return {...props, username, content, ignore_result, pathname, nsfwPref};
    },
    dispatch => ({
        fetchState: (pathname) => {
            dispatch({type: 'FETCH_STATE', payload: {pathname}})
        },
        removeHighSecurityKeys: () => {
            dispatch({type: 'user/REMOVE_HIGH_SECURITY_KEYS'})
        }
    })
)(PostsList)
