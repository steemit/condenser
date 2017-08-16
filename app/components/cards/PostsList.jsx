import React, {PropTypes} from 'react';
import PostSummary from 'app/components/cards/PostSummary';
import Post from 'app/components/pages/Post';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import debounce from 'lodash.debounce';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import {findParent} from 'app/utils/DomUtils';
import Icon from 'app/components/elements/Icon';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {connect} from 'react-redux';
import { translate } from 'app/Translator.js';

import Modal from 'react-overlays/lib/Modal';
import Portal from 'react-overlays/lib/Portal';

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
            thumbSize: 'desktop',
            showNegativeComments: false,
            nsfwPref: 'warn',
            showPost: null,
            showModal: false,
        }
        this.scrollListener = this.scrollListener.bind(this);
        this.onPostClick = this.onPostClick.bind(this);
        this.closePostModal = this.closePostModal.bind(this);
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
        if (!this.state.showPost && prevState.showPost) {
            window.history.pushState({}, '', this.props.pathname);
            this.post_url = null;
        }
    }

    componentWillUnmount() {
        this.detachScrollListener();
        const post_overlay = document.getElementById('post_overlay');
    }

    closePostModal = () => {
        window.document.title = this.state.prevTitle;
        this.setState({showPost: null, prevTitle: null, showModal: false,});
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
        this.setState({showModal: true, showPost: post, prevTitle: window.document.title});
        window.history.pushState({}, '', url);
    }

    render() {
        const {posts, showSpam, loading, category, content,
            ignore_result, account} = this.props;
        const {thumbSize, showPost, nsfwPref} = this.state
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
        const postTopBar = (
          <div className="PostsList__post_top_overlay">
              <div className="PostsList__post_top_bar">
                  <ul className="menu back-button-menu">
                      <li><a onClick={this.closePostModal} href="#"><i><Icon name="chevron-left" /></i> <span>{translate('go_back')}</span></a></li>
                  </ul>
                  <CloseButton onClick={this.closePostModal} />
              </div>
          </div>
        )

        return (
            <div id="posts_list" className="PostsList" ref="container">
                <ul className="PostsList__summaries hfeed" itemScope itemType="http://schema.org/blogPosts">
                    {renderSummary(postsInfo)}
                    <Modal
                        aria-labelledby='modal-label'
                        className="PostsList__post_overlay"
                        backdropClassName="PostsList__post_overlay_backdrop"
                        show={this.state.showModal}
                        onHide={this.closePostModal}
                      >
                          <div id="post_overlay">
                              <Portal container={()=> this.refs.container}>
                                  { postTopBar }
                              </Portal>
                              <div className="PostsList__post_container">
                                  <Post post={ showPost }/>
                              </div>
                          </div>
                      </Modal>
                </ul>
                {loading && <center><LoadingIndicator style={{marginBottom: "2rem"}} type="circle" /></center>}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const pathname = state.app.get('location').pathname;
        const current = state.user.get('current')
        const username = current ? current.get('username') : state.offchain.get('account')
        const content = state.global.get('content');
        const ignore_result = state.global.getIn(['follow', 'getFollowingAsync', username, 'ignore_result']);
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
