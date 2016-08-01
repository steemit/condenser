import React, {PropTypes} from 'react';
import PostSummary from 'app/components/cards/PostSummary';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';

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
    };

    static defaultProps = {
        showSpam: false,
    }

    constructor() {
        super();
        this.state = {
            thumbSize: 'desktop',
            showNegativeComments: false,
        }
        this.scrollListener = this.scrollListener.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsList')
    }

    componentDidMount() {
        this.attachScrollListener();
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    fetchIfNeeded() {
        this.scrollListener();
    }

    toggleNegativeReplies = () => {
        this.setState({
            showNegativeComments: !this.state.showNegativeComments
        });
    }

    scrollListener() {
        const el = window.document.getElementById('posts_list');
        if (!el) return;
        const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
            (document.documentElement || document.body.parentNode || document.body).scrollTop;
        if (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < 10) {
            const {loadMore, posts, category} = this.props;
            if (loadMore && posts && posts.length > 0) loadMore(posts[posts.length - 1], category);
        }

        // Detect if we're in mobile mode (renders larger preview imgs)
        var mq = window.matchMedia('screen and (max-width: 39.9375em)')
        if(mq.matches) {
            this.setState({thumbSize: 'mobile'})
        } else {
            this.setState({thumbSize: 'desktop'})
        }
    }

    attachScrollListener() {
        window.addEventListener('scroll', this.scrollListener);
        window.addEventListener('resize', this.scrollListener);
        this.scrollListener();
    }

    detachScrollListener() {
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('resize', this.scrollListener);
    }

    render() {
        const {posts, loading, category, emptyText} = this.props;
        const {comments} = this.props
        const {thumbSize} = this.state

        if (!loading && !posts.length) {
            return <div>{emptyText}</div>;
        }
        const renderSummary = items => items.map(({item, ignore, netVoteSign, authorRepLog10}) => <li key={item}>
            <PostSummary post={item} currentCategory={category} thumbSize={thumbSize}
                ignore={ignore} netVoteSign={netVoteSign} authorRepLog10={authorRepLog10} />
        </li>)
        return (
            <div id="posts_list" className="PostsList">
                <ul className="PostsList__summaries hfeed" itemScope itemType="http://schema.org/blogPosts">
                    {renderSummary(comments)}
                </ul>
                {loading && <center><LoadingIndicator type="circle" /></center>}
            </div>
        );
    }
}

import {List} from 'immutable'
import {Long} from 'bytebuffer'
import {connect} from 'react-redux'
import {parsePayoutAmount, repLog10} from 'app/utils/ParsersAndFormatters';

export default connect(
    (state, props) => {
        const {posts, showSpam} = props;
        const comments = []
        posts.forEach(item => {
            const content = state.global.get('content').get(item);
            let pending_payout = 0;
            // let total_payout = 0;
            let votes = Long.ZERO
            if (content) {
                pending_payout = content.get('pending_payout_value');
                // total_payout = content.get('total_payout_value');
                content.get('active_votes').forEach(v => {
                    votes = votes.add(Long.fromString('' + v.get('rshares')))
                })
            }
            const netVoteSign = votes.compare(Long.ZERO)
            const hasPendingPayout = parsePayoutAmount(pending_payout) >= 0.02
            const current = state.user.get('current')
            const username = current ? current.get('username') : null
            const ignore = !hasPendingPayout && username ? state.global.getIn(['follow', 'get_following', username, 'result', content.get('author')], List()).contains('ignore') : false
            const authorRepLog10 = repLog10(content.get('author_reputation'))
            const hide = !hasPendingPayout && (ignore || authorRepLog10 <= -6)
            if(!hide || showSpam)
                comments.push({item, ignore, netVoteSign, authorRepLog10})
        })
        return {...props, comments};
    },
)(PostsList)
