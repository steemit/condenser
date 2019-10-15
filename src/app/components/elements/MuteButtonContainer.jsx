import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as transactionActions from 'app/redux/TransactionReducer';

import MuteButton from './MuteButton';

class MuteButtonContainer extends React.Component {
    constructor(props) {
        super(props);
        const { isMuted } = this.props;
        this.state = {
            showDialog: false,
            loading: false,
            isMuted,
        };
    }

    onTogglePromptForMuteNotes = () => {
        this.setState({ showDialog: !this.state.showDialog });
    };

    onToggleMute = (isMuted, notes) => {
        const { account, community, username, permlink } = this.props;
        if (!notes || !community || !username) return false; // Fail Fast

        this.props.toggleMutedPost(
            username,
            !isMuted,
            community,
            account,
            notes,
            permlink,
            () => {
                console.log('MuteButtonContainer::onToggleMute()::success');
                this.setState({ isMuted: !isMuted });
            },
            () => {
                console.log('MuteButtonContainer::onToggleMute()::failure');
                this.setState({ isMuted });
            }
        );
    };

    render() {
        const { isMuted, showDialog, loading } = this.state;

        let label = `Mute`;
        if (isMuted) {
            label = `Unmute`;
        }

        return (
            <MuteButton
                loading={loading}
                label={label}
                showDialog={showDialog}
                onToggleMute={this.onToggleMute}
                onToggleDialog={this.onTogglePromptForMuteNotes}
                isMuted={isMuted}
            />
        );
    }
}

MuteButtonContainer.propTypes = {
    account: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired, //TODO: Define shape
};

export default connect(
    (state, ownProps) => {
        return {
            ...ownProps,
            username: state.user.getIn(['current', 'username']),
        };
    },
    dispatch => ({
        toggleMutedPost: (
            username,
            mutePost,
            community,
            account,
            notes,
            permlink,
            successCallback,
            errorCallback
        ) => {
            let action = 'unmutePost';
            if (mutePost) action = 'mutePost';

            const payload = [
                action,
                {
                    community,
                    account,
                    notes,
                    permlink,
                },
            ];

            return dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'community',
                        required_posting_auths: [username],
                        json: JSON.stringify(payload),
                    },
                    successCallback,
                    errorCallback,
                })
            );
        },
    })
)(MuteButtonContainer);
