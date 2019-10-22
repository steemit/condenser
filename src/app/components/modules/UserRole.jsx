import React, { Component } from 'react';
import PropTypes from 'prop-types';

import tt from 'counterpart';
import { throws } from 'assert';

class UserRole extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newUsername: '',
            newRole: this.props.role,
            message: '',
        };
    }

    onInput = event => {
        event && event.preventDefault();
        this.setState({
            newUsername: event.target.value,
        });
    };

    onSelect = event => {
        event && event.preventDefault();
        this.setState({
            newRole: event.target.value,
        });
    };

    onSubmit = () => {
        // TODO: Username validation can be added here.
        if (this.state.newUsername === '') {
            this.setState({
                message: 'Please enter a valid username.',
            });
            return;
        }
        if (this.props.role === this.state.newRole) {
            this.setState({
                message: 'The user already has that role.',
            });
            return;
        }
        if (this.props.addUser) {
            this.props.onSubmit(
                this.state.newRole.trim(),
                this.state.newUsername.trim()
            );
        } else {
            this.props.onSubmit(this.state.newRole.trim());
        }
    };

    render() {
        const { newRole, message, newUsername } = this.state;
        const {
            username,
            community,
            role,
            availableRoles,
            children,
            addUser,
        } = this.props;
        const submitButtonLabel = 'Save';

        const roleSelector = availableRoles.map(role => (
            <option value={role}>{role}</option>
        ));
        const editUserModalHeader = (
            <div>
                <h4>{tt('g.community_user_role_edit_header')}</h4>
                <p>
                    {tt('g.community_user_role_edit_description', {
                        community,
                        username,
                    })}{' '}
                </p>
            </div>
        );
        const addUserModalHeader = (
            <div>
                <h4>{tt('g.community_user_role_add_header')}</h4>
                <p>
                    {tt('g.community_user_role_add_description', {
                        community,
                    })}
                </p>
            </div>
        );

        return (
            <span>
                {addUser ? addUserModalHeader : editUserModalHeader}
                <hr />
                {addUser && (
                    <div className="input-group">
                        <span className="input-group-label">
                            Username &nbsp;<small>
                                [<a title="the username to add to this community">
                                    ?
                                </a>]
                            </small>
                        </span>{' '}
                        <input
                            className="input-group-field"
                            type="text"
                            maxLength={32}
                            name="username"
                            value={newUsername}
                            onChange={e => this.onInput(e)}
                        />
                    </div>
                )}
                <div className="input-group">
                    <span className="input-group-label">
                        Role &nbsp;<small>
                            [<a title="update user role within this community.">
                                ?
                            </a>]
                        </small>
                    </span>
                    <select value={newRole} onChange={this.onSelect} required>
                        {roleSelector}
                    </select>
                </div>
                <button
                    className="button slim hollow secondary"
                    type="submit"
                    title={submitButtonLabel}
                    onClick={() => this.onSubmit()}
                >
                    {' '}
                    {submitButtonLabel}{' '}
                </button>{' '}
                <div>{message.length > 0 && message}</div>
            </span>
        );
    }
}

UserRole.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    availableRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
    addUser: PropTypes.bool.isRequired,
};

export default UserRole;
