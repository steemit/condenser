import React, {PropTypes} from 'react';
import PostSummary from 'app/components/cards/PostSummary';
import Post from 'app/components/pages/Post';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import debounce from 'lodash.debounce';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import {findParent} from 'app/utils/DomUtils';
import Icon from 'app/components/elements/Icon';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { IGNORE_TAGS } from 'config/client_config';
import {encode} from 'app/utils/helpers';
import { isPostVisited, getVisitedPosts, visitPost } from 'app/utils/helpers';

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
    };

    static defaultProps = {
        showSpam: false,
    }

    constructor() {
        super();
        this.state = {
            // _isMounted: false,
            thumbSize: 'desktop',
            showNegativeComments: false,
            nsfwPref: 'warn',
            showPost: null,
            visitedPosts : []
        }
        this.scrollListener = this.scrollListener.bind(this);
        this.onPostClick = this.onPostClick.bind(this);
        this.onBackButton = this.onBackButton.bind(this);
        this.closeOnOutsideClick = this.closeOnOutsideClick.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsList')
    }

    componentWillMount() {
        this.readNsfwPref()
    }

    readNsfwPref() {
        if(!process.env.BROWSER) return
        const {username} = this.props
        const key = 'nsfwPref' + (username ? '-' + username : '')
        const nsfwPref = localStorage.getItem(key) || 'warn'
        this.setState({nsfwPref})
    }

    componentDidMount() {
        // this.setState({_isMounted: true});
        this.attachScrollListener();
    }

    componentWillUpdate() {
        const location = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (this.state.showPost && (location !== this.post_url)) {
            this.setState({showPost: null});
        }
        this.readNsfwPref();
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

    componentWillReceiveProps(nextProps) {
        const visited = getVisitedPosts();
        if (this.state.visitedPosts != visited) {
            this.setState({visitedPosts: visited});
        }
    }

    componentWillUnmount() {
        // this.setState({_isMounted: false});
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
        this.setState({showPost: null});
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
      // if (! this.state._isMounted) return;
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
        window.addEventListener('scroll', this.scrollListener);
        window.addEventListener('resize', this.scrollListener);
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
        visitPost(post);
    }

    render() {
        const {posts, showSpam, loading, category, content,
            ignore_result, account} = this.props;
        const {thumbSize, showPost, nsfwPref} = this.state
        const postsInfo = [];

        posts.forEach(item => {
            const cont = content.get(item);
            if(!cont) {
                console.error('PostsList --> Missing cont key', item)
                return
            }
            const ignore = ignore_result && ignore_result.has(cont.get('author'))
            // if(ignore) console.log('ignored post by', cont.get('author'), '\t', item)
            // const json_metadata = JSON.parse(cont.get('json_metadata') || '{}')
            // const postTags = Array.isArray(json_metadata.tags) ? json_metadata.tags : typeof json_metadata.tags === 'string' ? [json_metadata.tags] : []
                  // postTags.push(cont.get('category'))
            // TODO: check tags is string or null
            // let igonedPostTags = IGNORE_TAGS && postTags.filter(function(n) { return IGNORE_TAGS.indexOf(n) >= 0 }) || []

            const {hide, netVoteSign, authorRepLog10} = cont.get('stats').toJS()
            if (!(ignore || hide) || showSpam) // rephide
                postsInfo.push({item, ignore, netVoteSign, authorRepLog10})
        });
        const renderSummary = items => items.map(item => <li key={item.item}>
            <PostSummary
                account={account}
                post={item.item}
                currentCategory={category}
                thumbSize={thumbSize}
                ignore={item.ignore}
                netVoteSign={item.netVoteSign}
                authorRepLog10={item.authorRepLog10}
                onClick={this.onPostClick}
                nsfwPref={nsfwPref}
                visited={isPostVisited(item.item)}
            />
        </li>)

        return (
            <div id="posts_list" className="PostsList">
                <ul className="PostsList__summaries hfeed" itemScope itemType="http://schema.org/blogPosts">
                    {renderSummary(postsInfo)}
                </ul>
                {loading && <center><LoadingIndicator type="circle" /></center>}
                {showPost && <div id="post_overlay" className="PostsList__post_overlay" tabIndex={0}>
                    <div className="PostsList__post_top_overlay">
                        <div className="PostsList__post_top_bar">
                            <button className="back-button" type="button" title="Back" onClick={() => {this.setState({showPost: null})}}>
                                <span aria-hidden="true"><Icon name="chevron-left" /></span>
                            </button>
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

// import {List, Map} from 'immutable'
import {connect} from 'react-redux'

export default connect(
    (state, props) => {
        const pathname = state.app.get('location').pathname;
        const current = state.user.get('current')
        const username = current ? current.get('username') : state.offchain.get('account')
        const content = state.global.get('content');
        const ignore_result = state.global.getIn(['follow', 'get_following', username, 'ignore_result']);
        return {...props, username, content, ignore_result, pathname};
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
