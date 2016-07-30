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

export default class PostsList extends React.Component {

    static propTypes = {
        posts: PropTypes.array.isRequired,
        loading: PropTypes.bool.isRequired,
        category: PropTypes.string,
        loadMore: PropTypes.func,
        emptyText: PropTypes.string
    };

    constructor() {
        super();
        this.state = {thumbSize: 'desktop'}
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
        const {thumbSize} = this.state

        if (!loading && !posts.length) {
            return <div>{emptyText}</div>;
        }
        return (
            <div id="posts_list" className="PostsList">
                <ul className="PostsList__summaries hfeed" itemScope itemType="http://schema.org/blogPosts">
                    {
                        posts.map(item => <li key={item}>
                            <PostSummary post={item} currentCategory={category} thumbSize={thumbSize} />
                        </li>)
                    }
                </ul>
                {loading && <center><LoadingIndicator type="circle" /></center>}
            </div>
        );
    }
}
