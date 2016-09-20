import React, {PropTypes} from 'react';
import PostSummary from 'app/components/cards/PostSummary';
import Post from 'app/components/pages/Post';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import debounce from 'lodash.debounce';
import Callout from 'app/components/elements/Callout';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import {findParent} from 'app/utils/DomUtils';
import Icon from 'app/components/elements/Icon';

function topPosition(domElt) {
    if (!domElt) {
        return 0;
    }
    return domElt.offsetTop + topPosition(domElt.offsetParent);
}

class PostsList extends React.Component {

    static propTypes = {
        posts: PropTypes.array.isRequired,
        loading: PropTypes.bool.isRequired,
        category: PropTypes.string,
        loadMore: PropTypes.func,
        emptyText: PropTypes.string,
        showSpam: PropTypes.bool,
        global: PropTypes.object.isRequired,
        fetchState: PropTypes.func.isRequired,
        pathname: PropTypes.string,
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

    componentWillUnmount() {
        this.detachScrollListener();
        window.removeEventListener('popstate', this.onBackButton);
        window.removeEventListener('keydown', this.onBackButton);
        const post_overlay = document.getElementById('post_overlay');
        if (post_overlay) post_overlay.removeEventListener('click', this.closeOnOutsideClick);
        document.getElementsByTagName('body')[0].className = "";
    }

    componentWillUpdate(nextProps) {
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

    onBackButton(e) {
        if (e.keyCode && e.keyCode !== 27) return;
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
                this.setState({showPost: null});
            }
        }
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
            if (loadMore && posts && posts.length > 0) loadMore(posts[posts.length - 1], category);
        }

        // Detect if we're in mobile mode (renders larger preview imgs)
        var mq = window.matchMedia('screen and (max-width: 39.9375em)');
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
        this.setState({showPost: post});
        window.history.pushState({}, '', url);
    }

    render() {
        const {posts, loading, category, emptyText, global} = this.props;
        const {comments} = this.props
        const {thumbSize, showPost} = this.state
        if (!loading && !posts.length && emptyText) {
            return <Callout body={emptyText} type="success" />;
        }
        const renderSummary = items => items.map(({item, ignore, netVoteSign, authorRepLog10}) => <li key={item}>
            <PostSummary post={item} currentCategory={category} thumbSize={thumbSize}
                ignore={ignore} netVoteSign={netVoteSign} authorRepLog10={authorRepLog10} onClick={this.onPostClick} />
        </li>)
        return (
            <div id="posts_list" className="PostsList">
                <ul className="PostsList__summaries hfeed" itemScope itemType="http://schema.org/blogPosts">
                    {renderSummary(comments)}
                </ul>
                {loading && <center><LoadingIndicator type="circle" /></center>}
                {showPost && <div id="post_overlay" className="PostsList__post_overlay" tabIndex={0}>
                    <div className="PostsList__post_top_overlay">
                        <div className="PostsList__post_top_bar">
                            <button className="back-button" type="button" title="Back" onClick={() => {this.setState({showPost: null})}}>
                                <span aria-hidden="true"><Icon name="chevron-left" /></span>
                            </button>
                            <CloseButton onClick={() => {this.setState({showPost: null})}} />
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

import {List} from 'immutable'
import {connect} from 'react-redux'

export default connect(
    (state, props) => {
        const {posts, showSpam} = props;
        const comments = []
        const pathname = state.app.get('location').pathname;
        posts.forEach(item => {
            const content = state.global.get('content').get(item);
            if(!content) {
                console.error('PostsList --> Missing content key', item)
                return
            }
            // let total_payout = 0;
            const current = state.user.get('current')
            const username = current ? current.get('username') : null
            const key = ['follow', 'get_following', username, 'result', content.get('author')]
            const ignore = username ? state.global.getIn(key, List()).contains('ignore') : false
            const {hide, netVoteSign, authorRepLog10} = content.get('stats').toJS()
            if(!(ignore || hide) || showSpam) // rephide
                comments.push({item, ignore, netVoteSign, authorRepLog10})
        })
        return {...props, comments, global: state.global, pathname};
    },
    dispatch => ({
        fetchState: (pathname) => {
            dispatch({type: 'FETCH_STATE', payload: {pathname}})
        }
    })
)(PostsList)
