import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';

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
        if (this.props.addUser) {
            if (this.state.newUsername === '') {
                this.setState({
                    message: 'Please enter a valid username.',
                });
                return;
            }
            if (this.state.newUsername[0] === '@') {
                this.setState({
                    message: 'Please enter a username without "@".',
                });
                return;
            }
            this.props.onSubmit(
                this.state.newUsername.trim(),
                this.state.newRole.trim()
            );
        } else {
            if (this.props.role === this.state.newRole) {
                this.setState({
                    message: 'The user already has that role.',
                });
                return;
            }
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
            addUser,
        } = this.props;

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
                        <span className="input-group-label">Username</span>
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
                    <span className="input-group-label">Role</span>
                    <select value={newRole} onChange={this.onSelect} required>
                        {roleSelector}
                    </select>
                </div>
                <button
                    className="button slim hollow secondary"
                    type="submit"
                    onClick={() => this.onSubmit()}
                >
                    Save
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
