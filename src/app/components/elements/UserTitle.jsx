import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Role } from 'app/utils/Community';

import * as transactionActions from 'app/redux/TransactionReducer';
import * as globalActions from 'app/redux/GlobalReducer';

import Icon from 'app/components/elements/Icon';
import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import UserTitleEditor from 'app/components/modules/UserTitleEditor';

class UserTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            updatedTitle: '',
        };
    }

    onToggleDialog = () => {
        this.setState({ showDialog: !this.state.showDialog });
    };

    onSave = newTitle => {
        const community = this.props.community.get('name');
        //-- Simulate a "receiveState" action to feed new title into post state
        let newstate = { content: {}, simulation: true };
        let content_key = this.props.author + '/' + this.props.permlink;
        newstate['content'][content_key] = { author_title: newTitle };
        this.props.pushState(newstate);

        this.props.saveTitle(
            this.props.username,
            this.props.author,
            community,
            newTitle
        );
        this.props.onEditSubmit();
        this.setState({
            updatedTitle: newTitle,
        });
    };

    render() {
        const { title, role, viewer_role, hideEdit } = this.props;
        const isMod = Role.atLeast(viewer_role, 'mod');
        const showRole = role && role != 'guest';
        const showTitle = title != '' || (isMod && !hideEdit);

        if (!showRole && !showTitle) return null;

        let editor;
        if (isMod && !hideEdit) {
            const { author, community, username } = this.props;
            const { showDialog } = this.state;
            editor = (
                <span>
                    <a onClick={this.onToggleDialog} title="Edit Title">
                        <Icon name="pencil2" size="0_8x" />
                    </a>
                    {showDialog && (
                        <Reveal onHide={() => null} show>
                            <CloseButton
                                onClick={() => this.onToggleDialog()}
                            />
                            <UserTitleEditor
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

        return (
            <span>
                {showRole && <span className="user_role">{role}</span>}
                {showTitle && (
                    <span className="affiliation">
                        {this.state.updatedTitle.length > 0
                            ? this.state.updatedTitle
                            : title}
                        {editor}
                    </span>
                )}
            </span>
        );
    }
}

UserTitle.propTypes = {
    username: PropTypes.string, // edit only
    community: PropTypes.object.isRequired, // edit only
    author: PropTypes.string.isRequired, // edit only
    permlink: PropTypes.string.isRequired, // edit only
    title: PropTypes.string,
    onEditSubmit: PropTypes.func,
};

UserTitle.defaultProps = {
    onEditSubmit: () => {},
};

export default connect(
    (state, ownProps) => {
        const community = state.global.getIn(
            ['community', ownProps.community],
            Map()
        );
        const viewer_role = community.getIn(['context', 'role'], 'guest');
        const { author, permlink, title } = ownProps;
        return {
            author,
            permlink,
            title,
            username: state.user.getIn(['current', 'username']),
            community,
            viewer_role,
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
)(UserTitle);
