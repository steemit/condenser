import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as globalActions from 'app/redux/GlobalReducer';
import * as transactionActions from 'app/redux/TransactionReducer';

import Icon from 'app/components/elements/Icon';
import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import FlagCommunityPost from '../modules/FlagCommunityPost';

class FlagButton extends React.Component {
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

    onSubmit = notes => {
        const { account, community, username, permlink, flagPost } = this.props;
        if (!notes || !community || !username) return false; // Fail Fast
        flagPost(username, community, account, notes, permlink);
    };

    render() {
        return (
            <span
                className={` flag__button ${
                    this.props.isComment
                        ? 'flag__button--comment'
                        : 'flag__button--post'
                } `}
            >
                <a onClick={() => this.showDialog()}>
                    <Icon name="flag1" />
                    <Icon name="flag2" />
                </a>
                {this.state.showDialog && (
                    <Reveal onHide={() => null} show>
                        <CloseButton onClick={() => this.hideDialog()} />
                        <FlagCommunityPost
                            onSubmit={notes => {
                                this.hideDialog();
                                this.onSubmit(notes);
                            }}
                            flagText={this.props.flagText}
                            isComment={this.props.isComment}
                        />
                    </Reveal>
                )}
            </span>
        );
    }
}

FlagButton.propTypes = {
    account: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired, //TODO: Define shape
    flagText: PropTypes.string.isRequired,
    isComment: PropTypes.bool,
};

FlagButton.defaultProps = {
    isComment: false,
};

export default connect(
    (state, ownProps) => {
        const { post } = ownProps;
        const account = post.get('author');
        const permlink = post.get('permlink');
        const community = post.get('category');
        const flagText = state.global.getIn([
            'community',
            community,
            'flag_text',
        ]);
        return {
            account,
            permlink,
            community,
            username: state.user.getIn(['current', 'username']),
            flagText,
        };
    },
    dispatch => ({
        stateSet: (key, value) => {
            dispatch(globalActions.set({ key, value }));
        },
        flagPost: (
            username,
            community,
            account,
            notes,
            permlink,
            successCallback,
            errorCallback
        ) => {
            const action = 'flagPost';
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
)(FlagButton);
