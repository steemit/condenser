import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as transactionActions from 'app/redux/TransactionReducer';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as globalActions from 'app/redux/GlobalReducer';
import UserTitleEditButton from './UserTitleEditButton';

class UserTitleEditButtonContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            loading: false,
            title: this.props.title,
        };
    }

    onToggleDialog = () => {
        this.setState({ showDialog: !this.state.showDialog });
    };

    onSave = newTitle => {
        const community = this.props.community.get('name');
        this.setState({ loading: true });
        //-- Simulate a "receiveState" action to feed new title into post state
        let newstate = { content: {}, simulation: true };
        let content_key = this.props.username + '/' + this.props.permlink;
        newstate['content'][content_key] = { author_title: newTitle };
        this.props.pushState(newstate);
        this.props.saveTitle(
            this.props.username,
            community,
            newTitle,
            () => {
                console.log('saveTitle::success');
                this.setState({ loading: false, title: newTitle });

                setTimeout(() => this.props.getCommunity(community), 10000);
            },
            () => {
                console.log('saveTitle::fail');
                this.setState({ loading: false });
                this.props.getCommunity(community);
            }
        );
    };

    render() {
        const { username, community } = this.props;
        return (
            <UserTitleEditButton
                {...this.state}
                username={username}
                community={community}
                onSave={this.onSave}
                onToggleDialog={this.onToggleDialog}
            />
        );
    }
}

UserTitleEditButtonContainer.propTypes = {
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired,
};

export default connect(
    (state, ownProps) => {
        const community = state.global.getIn(
            ['community', ownProps.community],
            {}
        );
        console.log('UserTitleEditButtonContainer');

        return {
            ...ownProps,
            username: state.user.getIn(['current', 'username']),
            community,
        };
    },
    dispatch => ({
        pushState: state => {
            return dispatch(globalActions.receiveState(state));
        },
        saveTitle: (
            account,
            community,
            title,
            successCallback,
            errorCallback
        ) => {
            const action = 'setUserTitle';

            const payload = [
                action,
                {
                    community,
                    account,
                    title,
                },
            ];

            return dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'community',
                        required_posting_auths: [account],
                        json: JSON.stringify(payload),
                    },
                    successCallback,
                    errorCallback,
                })
            );
        },
        getCommunity: communityName => {
            return dispatch(fetchDataSagaActions.getCommunity(communityName));
        },
    })
)(UserTitleEditButtonContainer);
