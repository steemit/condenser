import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import UserTitle from 'app/components/elements/UserTitle';

class CommunitySubscriberList extends React.Component {
    static propTypes = {
        community: PropTypes.string,
    };

    constructor(props) {
        super(props);
        const { community } = this.props;
        this.editSubscriberName = () => {
            const { state: { showEditName } } = this;
            this.setState({ showEditName: !showEditName });
        };
    }

    render() {
        // Map over community Subscribers list
        /*
      return (
                    <UserTitle
                        username={username}
                        community={community}
                        author={author}
                        permlink={permlink}
                        role={role}
                        title={title}
                        hideEdit={this.props.hideEditor}
                    />
                    )
                  */
        // Display a table of community subscribers.
        // If the user is a moderator, or some role, if they click on a user,
        // They can edit the user Title ...
        return <div>COMMUNITY SUBSCRIBER LIST</div>;
    }
}

const ConnectedCommunitySubscriberList = connect(
    // mapStateToProps
    (state, ownProps) => {
        // Get subscribers from state here.
        return {
            subscribers: ['bill', 'ted'],
        };
    },
    // mapDispatchToProps
    dispatch => {
        return {
            fetchSubscribers: communityName =>
                dispatch(
                    communityActions.getCommunitySubscribers(communityName)
                ),
        };
    }
)(CommunitySubscriberList);

export default ConnectedCommunitySubscriberList;
