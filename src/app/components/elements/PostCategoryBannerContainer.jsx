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
        const {
            username,
            community,
            isCommunity,
            currentUser,
            userProfile,
        } = this.props;
        console.log(
            'PostCategoryBannerContainer::render()',
            username,
            community,
            isCommunity,
            currentUser,
            userProfile
        );
        let image = null;
        if (userProfile) {
            image = userProfile.profile_image;
        }
        let label = `${currentUser.get('username', '')}'s Blog`;
        let labelSmall = '';
        if (isCommunity && community) {
            label = `${community.get('title')}`;
            labelSmall = `# ${community.get('name')}`;
        }

        return (
            <PostCategoryBanner
                {...this.state}
                label={label}
                labelSmall={labelSmall}
                image={image}
            />
        );
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
        const currentUser = state.user.get('current', null);
        const userMetadata = state.global.getIn(
            ['accounts', currentUser.get('username', ''), 'json_metadata'],
            ''
        );
        let userProfile = null;
        if (userMetadata) userProfile = JSON.parse(userMetadata).profile;
        return {
            ...ownProps,
            community: state.global.getIn(
                ['community', ownProps.communityName],
                null
            ),
            currentUser,
            userProfile,
        };
    },
    dispatch => ({
        getCommunity: communityName => {
            return dispatch(fetchDataSagaActions.getCommunity(communityName));
        },
    })
)(PostCategoryBannerContainer);
