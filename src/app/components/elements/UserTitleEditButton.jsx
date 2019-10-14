import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as transactionActions from 'app/redux/TransactionReducer';
import * as globalActions from 'app/redux/GlobalReducer';

import Icon from 'app/components/elements/Icon';
import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import UserTitle from 'app/components/modules/UserTitle';

class UserTitleEditButton extends React.Component {
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
        let content_key = this.props.author + '/' + this.props.permlink;
        newstate['content'][content_key] = { author_title: newTitle };
        this.props.pushState(newstate);

        this.props.saveTitle(
            this.props.username,
            this.props.author,
            community,
            newTitle,
            () => {
                console.log('saveTitle::success');
                this.setState({ loading: false, title: newTitle });
            },
            () => {
                console.log('saveTitle::fail');
                this.setState({ loading: false });
            }
        );
    };

    render() {
        const { author, username, community } = this.props;
        const { title, showDialog } = this.state;
        return (
            <span>
                <a onClick={this.onToggleDialog}>
                    <Icon name="pencil2" size="0_8x" />
                </a>
                {showDialog && (
                    <Reveal onHide={() => null} show>
                        <CloseButton onClick={() => this.onToggleDialog()} />
                        <UserTitle
                            title={title}
                            username={author}
                            community={community.get('title')}
                            onSubmit={newTitle => {
                                this.onToggleDialog();
                                this.onSave(newTitle);
                            }}
                        />
                    </Reveal>
                )}
            </span>
        );
    }
}

UserTitleEditButton.propTypes = {
    author: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired,
    community: PropTypes.object,
    title: PropTypes.string,
};

export default connect(
    (state, ownProps) => {
        const community = state.global.getIn(
            ['community', ownProps.community],
            {}
        );

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
            username,
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
                        required_posting_auths: [username],
                        json: JSON.stringify(payload),
                    },
                    successCallback,
                    errorCallback,
                })
            );
        },
    })
)(UserTitleEditButton);
