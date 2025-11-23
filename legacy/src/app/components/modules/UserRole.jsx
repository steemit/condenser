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
                    message: tt('user_roles.invalid_username'),
                });
                return;
            }
            if (this.state.newUsername[0] === '@') {
                this.setState({
                    message: tt('user_roles.invalid_character'),
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
                    message: tt('user_roles.invalid_role'),
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
                <hr />
                {/*<p>
                    {tt('g.community_user_role_edit_description', {
                        community,
                        username,
                    })}{' '}
                </p>*/}
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
                <div className="input-group">
                    <span className="input-group-label">
                        {tt('g.username')}
                    </span>
                    <input
                        className="input-group-field"
                        type="text"
                        maxLength={32}
                        name="username"
                        value={addUser ? newUsername : username}
                        onChange={e => this.onInput(e)}
                        disabled={!addUser}
                    />
                </div>
                <div className="input-group">
                    <span className="input-group-label">{tt('g.role')}</span>
                    <select value={newRole} onChange={this.onSelect} required>
                        {roleSelector}
                    </select>
                </div>
                <div className="text-right">
                    <button
                        className="button"
                        type="submit"
                        onClick={() => this.onSubmit()}
                    >
                        {tt('g.save')}
                    </button>
                </div>
                <div>{message.length > 0 && message}</div>
                <div>
                    <h5>{tt('user_roles.role_permissions')}</h5>
                    <p>
                        <strong>{tt('user_roles.owner')}</strong> -{' '}
                        {tt('user_roles.owner_description')}
                        <br />
                        <strong>{tt('user_roles.admin')}</strong> -{' '}
                        {tt('user_roles.admin_description')}
                        <br />
                        <strong>{tt('user_roles.moderator')}</strong> -{' '}
                        {tt('user_roles.moderator_description')}
                        <br />
                        <strong>{tt('user_roles.member')}</strong> -{' '}
                        {tt('user_roles.member_description')}
                        <br />
                        <strong>{tt('user_roles.guest')}</strong> -{' '}
                        {tt('user_roles.guest_description')}
                        <br />
                        <strong>{tt('user_roles.muted')}</strong> -{' '}
                        {tt('user_roles.muted_description')}
                    </p>
                </div>
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
