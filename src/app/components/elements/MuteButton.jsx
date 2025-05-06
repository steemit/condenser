import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';

import * as globalActions from 'app/redux/GlobalReducer';
import * as transactionActions from 'app/redux/TransactionReducer';

import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import MutePost from 'app/components/modules/MutePost';

class MuteButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showDialog: false };
    }

    showDialog = () => {
        this.setState({ showDialog: true });
    };

    hideDialog = () => {
        this.setState({ showDialog: false });
    };

    onSubmit = (isMuted, notes) => {
        const { account, community, username, permlink } = this.props;
        if (!notes || !community || !username) return false; // Fail Fast

        const postref = account + '/' + permlink;
        const key = ['content', postref, 'stats', 'gray'];
        this.props.stateSet(key, !isMuted);

        this.props.toggleMutedPost(
            username,
            !isMuted,
            community,
            account,
            notes,
            permlink
        );
    };

    render() {
        const { isMuted } = this.props;
        return (
            <span>
                <a onClick={() => this.showDialog()}>
                    {isMuted ? tt('g.unmute') : tt('g.mute')}
                </a>
                {this.state.showDialog && (
                    <Reveal onHide={() => null} show>
                        <CloseButton onClick={() => this.hideDialog()} />
                        <MutePost
                            isMuted={isMuted}
                            onSubmit={notes => {
                                this.hideDialog();
                                this.onSubmit(isMuted, notes);
                            }}
                        />
                    </Reveal>
                )}
            </span>
        );
    }
}

MuteButton.propTypes = {
    account: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired, //TODO: Define shape
};

export default connect(
    (state, ownProps) => {
        const { post } = ownProps;
        const account = post.get('author');
        const permlink = post.get('permlink');
        const community = post.get('category');
        const isMuted = post.getIn(['stats', 'gray'], false);
        return {
            account,
            permlink,
            community,
            isMuted,
            username: state.user.getIn(['current', 'username']),
        };
    },
    dispatch => ({
        stateSet: (key, value) => {
            dispatch(globalActions.set({ key, value }));
        },
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
            const action = mutePost ? 'mutePost' : 'unmutePost';
            const payload = [
                action,
                {
                    community,
                    account,
                    permlink,
                    notes,
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
)(MuteButton);
