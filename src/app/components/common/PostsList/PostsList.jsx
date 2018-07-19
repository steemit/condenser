import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';
import PostCard from 'src/app/components/common/PostCard';
import { isFetchingOrRecentlyUpdated } from 'app/utils/StateFunctions';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { Map } from 'immutable';

const Root = styled.div``;

const Loader = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`;

class PostsList extends PureComponent {
    static propTypes = {
        content: PropTypes.object, // immutable.Map
        posts: PropTypes.object, // immutable.List
    };

    static defaultProps = {
        posts: Map(),
    };

    componentDidMount() {
        window.addEventListener('scroll', this._onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._onScroll);
        this._onScroll.cancel();
    }

    render() {
        const { posts } = this.props;

        return (
            <Root innerRef={this._onRef}>
                {posts.map(permLink => <PostCard key={permLink} permLink={permLink} />)}
                {this._renderLoaderIfNeed()}
            </Root>
        );
    }

    _renderLoaderIfNeed() {
        const { section, loading, globalStatus } = this.props;

        const status = globalStatus ? globalStatus.getIn([section, 'by_author']) : null;
        const showLoader = loading || (status && status.fetching);

        if (showLoader) {
            return (
                <Loader>
                    <LoadingIndicator type="circle" width="40px" height="40px" />
                </Loader>
            );
        }
    }

    _onRef = el => {
        this._root = el;
    };

    _loadMore = () => {
        const { globalStatus, order, category, myAccount } = this.props;

        if (isFetchingOrRecentlyUpdated(globalStatus, order, category)) {
            return;
        }

        const lastPost = this.props.posts.last();

        const [author, permlink] = lastPost.split('/');

        this.props.loadMore({
            order,
            category,
            accountname: myAccount,
            author,
            permlink,
        });
    };

    _onScroll = throttle(
        () => {
            const rect = this._root.getBoundingClientRect();

            if (rect.top + rect.height < window.innerHeight * 1.5) {
                this._loadMore();
            }
        },
        100,
        { leading: false, tailing: true }
    );
}

export default connect(
    (state, props) => {
        if (process.env.BROWSER) {
            window.state = state;
        }

        return {
            loading: state.app.get('loading'),
            myAccount: state.user.getIn(['current', 'username']),
            globalStatus: state.global.get('status'),
            posts: state.global
                .get('accounts')
                .get(props.account)
                .get('blog'),
        };
    },
    {
        loadMore(params) {
            return { type: 'REQUEST_DATA', payload: params };
        },
    }
)(PostsList);
