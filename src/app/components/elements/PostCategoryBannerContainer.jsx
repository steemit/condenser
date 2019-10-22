import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as transactionActions from 'app/redux/TransactionReducer';

import PostCategoryBanner from './PostCategoryBanner';

class PostCategoryBannerContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    componentWillMount() {
        const { communityName, getCommunity, community } = this.props;
        if (communityName && !community) getCommunity(communityName);
    }

    componentDidUpdate(prevProps) {
        const { communityName, getCommunity, community } = this.props;
        if (prevProps.communityName != communityName) {
            if (communityName && !community) getCommunity(communityName);
        }
    }

    render() {
        const { username, community, isCommunity, currentUser } = this.props;

        let label = `${currentUser}'s blog`;
        let labelSmall = '';
        if (isCommunity && community) {
            label = `${community.get('title')}`;
            labelSmall = `#${community.get('name')}`;
        }

        return (
            <PostCategoryBanner
                {...this.state}
                author={currentUser}
                label={label}
                labelSmall={labelSmall}
                isCommunity={isCommunity}
            />
        );
    }
}

PostCategoryBannerContainer.propTypes = {
    username: PropTypes.string.isRequired,
    communityName: PropTypes.string,
    community: PropTypes.object, // TODO: define shape
    isCommunity: PropTypes.bool.isRequired,
};

export default connect(
    (state, ownProps) => {
        const currentUser = state.user.getIn(['current', 'username'], null);
        return {
            ...ownProps,
            community: state.global.getIn(
                ['community', ownProps.communityName],
                null
            ),
            currentUser,
        };
    },
    dispatch => ({
        getCommunity: communityName => {
            return dispatch(fetchDataSagaActions.getCommunity(communityName));
        },
    })
)(PostCategoryBannerContainer);
