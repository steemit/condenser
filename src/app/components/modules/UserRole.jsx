import React, { Component } from 'react';
import PropTypes from 'prop-types';

import tt from 'counterpart';

class UserRole extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newRole: this.props.role,
            message: '',
        };
    }

    onSelect = event => {
        event && event.preventDefault();
        this.setState({
            newRole: event.target.value,
        });
    };

    onSubmit = () => {
        if (this.props.role === this.state.newRole) {
            this.setState({
                message: 'The user already has that role.',
            });
            return;
        }
        this.props.onSubmit(this.state.newRole.trim());
    };

    render() {
        const { newRole, message } = this.state;
        const { username, community, role } = this.props;
        const submitButtonLabel = 'Save';

        return (
            <span>
                <div>
                    <h4>{tt('g.community_user_role_edit_header')}</h4>
                    <p>
                        {tt('g.community_user_role_edit_description', {
                            community,
                            username,
                        })}
                    </p>
                </div>
                <hr />
                <div className="input-group">
                    <span className="input-group-label">
                        Role &nbsp;<small>
                            [<a title="update user role within this community.">
                                ?
                            </a>]
                        </small>
                    </span>
                    <select value={newRole} onChange={this.onSelect} required>
                        <option value="admin">admin</option>
                        <option value="mod">mod</option>
                        <option value="member">member</option>
                        <option value="guest">guest</option>
                        <option value="muted">muted</option>
                    </select>
                </div>

                <div className="input-group">
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
                </div>
            </span>
        );
    }
}

UserRole.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
};

export default UserRole;
