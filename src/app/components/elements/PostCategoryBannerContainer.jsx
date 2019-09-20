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

        this.props.getCommunity(this.props.communityName);
    }

    render() {
        const { username, community, isCommunity } = this.props;
        console.log(
            'PostCategoryBannerContainer::render()',
            username,
            community,
            isCommunity
        );
        let label = `${username}'s Blog'`;
        if (isCommunity && community) {
            label = `${community.get('title')}`;
        }

        return <PostCategoryBanner {...this.state} label={label} />;
    }
}

PostCategoryBannerContainer.propTypes = {
    username: PropTypes.string.isRequired,
    communityName: PropTypes.string.isRequired,
    community: PropTypes.object.isRequired, // TODO: define shape
    isCommunity: PropTypes.bool.isRequired,
};

export default connect(
    (state, ownProps) => {
        console.log('PostCategoryBanner::connect()', arguments);
        return {
            ...ownProps,
            community: state.global.getIn(
                ['community', ownProps.communityName],
                null
            ),
        };
    },
    dispatch => ({
        getCommunity: communityName => {
            console.log('getCommunity', communityName);

            return dispatch(fetchDataSagaActions.getCommunity(communityName));
        },
    })
)(PostCategoryBannerContainer);
