import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';
import { Map } from 'immutable';
import PostCard from 'src/app/components/common/PostCard';
import CommentCard from 'src/app/components/common/CommentCard';
import { isFetchingOrRecentlyUpdated } from 'app/utils/StateFunctions';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

const Root = styled.div`
    ${is('grid')`
        position: relative;
        display: flex;
        flex-wrap: wrap;
        margin: 0 -8px;
        // display: grid;
        // grid-gap: 16px;
        // grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        // grid-auto-rows: minmax(100px, auto);
        // grid-auto-flow: dense;
    `};
`;

const Loader = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`;

const PostCardStyled = styled(PostCard)`
    margin-bottom: 16px;

    ${is('grid')`
        flex-basis: 200px;
        flex-grow: 1;
        flex-shrink: 0;
        margin: 0 8px 16px;
    `};
`;

const CommentCardStyled = styled(CommentCard)`
    margin-bottom: 16px;
`;

class PostsList extends PureComponent {
    static propTypes = {
        content: PropTypes.object, // immutable.Map
        posts: PropTypes.object, // immutable.List
        layout: PropTypes.oneOf(['list', 'grid']),
    };

    static defaultProps = {
        posts: Map(),
    };

    componentDidMount() {
        console.log('PostsList Did Mount');
        window.addEventListener('scroll', this._onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._onScroll);
        this._onScroll.cancel();
    }

    render() {
        const { posts, category, layout } = this.props;

        const isGrid = category === 'blog' && layout === 'grid';
        const EntryComponent = category === 'blog' ? PostCardStyled : CommentCardStyled;

        return (
            <Root innerRef={this._onRef} grid={isGrid}>
                {posts.map(permLink => (
                    <EntryComponent key={permLink} permLink={permLink} grid={isGrid} />
                ))}
                {this._renderLoaderIfNeed()}
            </Root>
        );
    }

    _renderLoaderIfNeed() {
        const { section, globalStatus } = this.props;

        const status = globalStatus ? globalStatus.getIn([section, 'by_author']) : null;
        const showLoader = status && status.fetching;

        if (showLoader) {
            return (
                <Loader>
                    <LoadingIndicator type="circle" size={40} />
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
        return {
            myAccount: state.user.getIn(['current', 'username']),
            globalStatus: state.global.get('status'),
            layout: state.profile.get('layout'),
            posts: state.global
                .get('accounts')
                .get(props.account)
                .get(props.category),
        };
    },
    {
        loadMore(params) {
            return { type: 'REQUEST_DATA', payload: params };
        },
    }
)(PostsList);
