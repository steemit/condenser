/* eslint react/prop-types: 0 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Topics from './Topics';
import constants from 'app/redux/constants';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import PostsList from 'app/components/cards/PostsList';
import {isFetchingOrRecentlyUpdated} from 'app/utils/StateFunctions';
import g from 'app/redux/GlobalReducer';

class PostsIndex extends React.Component {

    static propTypes = {
        discussions: PropTypes.object,
        status: PropTypes.object,
        routeParams: PropTypes.object,
        requestData: PropTypes.func,
        loading: PropTypes.bool
    };

    static defaultProps = {
        showSpam: false
    }

    constructor() {
        super();
        this.state = {}
        this.loadMore = this.loadMore.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsIndex')
    }

    componentDidUpdate(prevProps) {
        if (window.innerHeight && window.innerHeight > 3000 && prevProps.discussions !== this.props.discussions) {
            this.refs.list.fetchIfNeeded();
        }
    }

    getPosts(order, category) {
        const topic_discussions = this.props.discussions.get(category || '');
        if (!topic_discussions) return null;
        return topic_discussions.get(order);
    }

    loadMore(last_post) {
        if (!last_post) return;
        let {accountname} = this.props.routeParams
        let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
        if (category === 'feed'){
            accountname = order.slice(1);
            order = 'by_feed';
        }
        if (isFetchingOrRecentlyUpdated(this.props.status, order, category)) return;
        const [author, permlink] = last_post.split('/');
        this.props.requestData({author, permlink, order, category, accountname});
    }
    onShowSpam = () => {
        this.setState({showSpam: !this.state.showSpam})
    }
    render() {
        let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
        let topics_order = order;
        let posts = [];
        let emptyText = '';
        if (category === 'feed') {
            const account_name = order.slice(1);
            order = 'by_feed';
            topics_order = 'trending';
            posts = this.props.global.getIn(['accounts', account_name, 'feed']);
            emptyText = `Looks like ${account_name} hasn't followed anything yet!`;
        } else {
            posts = this.getPosts(order, category);
        }

        const status = this.props.status ? this.props.status.getIn([category || '', order]) : null;
        const fetching = (status && status.fetching) || this.props.loading;
        const {showSpam} = this.state

        return (
            <div className={'PostsIndex row' + (fetching ? ' fetching' : '')}>
                <div className="PostsIndex__left column small-collapse">
                    <div className="PostsIndex__topics_compact show-for-small hide-for-large">
                        <Topics order={topics_order} current={category} compact />
                    </div>
                    <PostsList ref="list"
                        posts={posts ? posts.toArray() : []}
                        loading={fetching}
                        category={category}
                        loadMore={this.loadMore}
                        emptyText = {emptyText}
                        showSpam={showSpam} />
                </div>
                <div className="PostsIndex__topics column shrink show-for-large">
                    <Topics order={topics_order} current={category} compact={false} />
                    <small><a onClick={this.onShowSpam}>{showSpam ? 'Show less' : 'Show more'}</a> low value posts</small>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: ':order(/:category)',
    component: connect(
        (state) => {
            return {
                discussions: state.global.get('discussion_idx'),
                status: state.global.get('status'),
                loading: state.app.get('loading'),
                global: state.global
            };
        },
        (dispatch) => {
            return {
                requestData: (args) => dispatch({type: 'REQUEST_DATA', payload: args}),
            }
        }
    )(PostsIndex)
};

