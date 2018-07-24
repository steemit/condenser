import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';
import immutable from 'immutable';
import PostCard from 'src/app/components/common/PostCard';
import CommentCard from 'src/app/components/common/CommentCard';
import { isFetchingOrRecentlyUpdated } from 'app/utils/StateFunctions';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

const Root = styled.div`
    ${is('grid')`
        position: relative;
        margin: 0 -8px;
    `};
`;

const Loader = styled.div`
    margin-bottom: 20px;
`;

const EntryWrapper = styled.div`
    margin-bottom: 16px;

    ${is('grid')`
        display: inline-block;
        width: 50%;
        vertical-align: top;
        padding: 0 8px;
    
        @media screen and (max-width: 830px) {
            width: 100%;
        }
    `};
`;

class PostsList extends PureComponent {
    static propTypes = {
        content: PropTypes.instanceOf(immutable.Map),
        posts: PropTypes.instanceOf(immutable.List),
        layout: PropTypes.oneOf(['list', 'grid']),
    };

    static defaultProps = {
        posts: immutable.Map(),
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
        const EntryComponent = category === 'blog' ? PostCard : CommentCard;

        return (
            <Root innerRef={this._onRef} grid={isGrid}>
                {posts.map(permLink => (
                    <EntryWrapper key={permLink} grid={isGrid}>
                        <EntryComponent permLink={permLink} grid={isGrid} />
                    </EntryWrapper>
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
                    <LoadingIndicator type="circle" center size={40} />
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
            layout: state.profile ? state.profile.get('layout') : 'list',
            posts: state.global.getIn(['accounts', props.account, props.category]),
        };
    },
    {
        loadMore(params) {
            return { type: 'REQUEST_DATA', payload: params };
        },
    }
)(PostsList);
