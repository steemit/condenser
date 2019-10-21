import React from 'react';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import { Map, List } from 'immutable';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import UserRole from 'app/components/modules/UserRole';

class CommunityRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: '',
            role: 'member',
            title: '',
            updateRoleModal: false,
            updatedRole: '',
        };
        this.onAccountChange = this.onAccountChange.bind(this);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onEditUserRoleSelect = this.onEditUserRoleSelect.bind(this);
        this.toggleUpdateRoleModal = this.toggleUpdateRoleModal.bind(this);
    }

    componentDidMount() {
        this.props.loadCommunityRoles(this.props.community);
    }

    toggleUpdateRoleModal(showModal) {
        this.setState({
            updateRoleModal: showModal,
        });
    }

    onEditUserRoleSelect(name, role, title) {
        this.setState({
            account: name,
            role,
            title,
        });
    }

    onAccountChange(event) {
        this.setState({ account: event.target.value });
    }

    onRoleChange(event) {
        this.setState({ role: event.target.value });
    }

    onSubmit(event) {
        event.preventDefault();
        const params = {
            community: this.props.community,
            account: this.state.account,
            role: this.state.role,
        };
        this.props.updateUser(params);
    }

    render() {
        const { community, loading, updating, roles } = this.props;

        const spinner = (
            <center>
                <LoadingIndicator type="circle" />
            </center>
        );

        const tableRows = roles.toJS().map((tuple, index) => {
            const name = tuple[0];
            const title = tuple[2];
            const role = (
                <span
                    className="community-user--role"
                    onClick={() => {
                        if (tuple[1] === 'owner') {
                            return;
                        }
                        this.onEditUserRoleSelect(name, tuple[1], title);
                        this.toggleUpdateRoleModal(true);
                    }}
                >
                    <td>{tuple[1]}</td>
                </span>
            );

            return (
                <tr key={name}>
                    <td>{name}</td>
                    <td>{role}</td>
                    <td>{title}</td>
                </tr>
            );
        });

        const table = (
            <table>
                <thead>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Title</th>
                </thead>
                <tbody>{tableRows}</tbody>
            </table>
        );

        const form = (
            <form onSubmit={this.onSubmit}>
                <label>
                    User:
                    <input
                        onChange={this.onAccountChange}
                        type="text"
                        name="name"
                        required
                    />
                </label>
                <label>
                    Role:
                    <select onChange={this.onRoleChange} required>
                        <option value="" />
                        <option value="admin">admin</option>
                        <option value="mod">mod</option>
                        <option value="member">member</option>
                        <option value="guest">guest</option>
                        <option value="muted">muted</option>
                    </select>
                </label>
                <input type="submit" value="Submit" />
            </form>
        );

        const editUserModal = (
            <Reveal onHide={() => null} show>
                <CloseButton
                    onClick={() => this.toggleUpdateRoleModal(false)}
                />
                <UserRole
                    title={this.state.title}
                    username={this.state.account}
                    community={this.props.community}
                    role={this.state.role}
                    onSubmit={newRole => {
                        const params = {
                            community: this.props.community,
                            account: this.state.account,
                            role: newRole,
                        };
                        this.props.updateUser(params);
                        this.toggleUpdateRoleModal(false);
                    }}
                />
            </Reveal>
        );

        return (
            <div className="CommunityRoles">
                <div className="row">
                    <div className="column large-4">
                        <h2>{community}</h2>
                        {updating && <div>Updating User...</div>}
                        {loading && spinner}
                        {this.state.updateRoleModal && editUserModal}
                        {!loading && (
                            <div>
                                <h4>User Roles</h4>
                                {table}
                                <h4>Modify User Role</h4>
                                {form}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const CommunityRolesWrapped = connect(
    (state, ownProps) => {
        const { community } = ownProps.params;
        const tree = state.community.get(community, Map());
        const roles = tree.get('roles', List());
        const loading = roles.size == 0;
        const updating = tree.get('updatePending', false);

        return {
            community,
            roles,
            loading,
            updating,
        };
    },

    dispatch => ({
        loadCommunityRoles: community => {
            dispatch(communityActions.loadCommunityRoles(community));
        },
        updateUser: params => {
            dispatch(communityActions.updateUserRole(params));
        },
    })
)(CommunityRoles);

module.exports = {
    path: 'roles(/:community)',
    component: CommunityRolesWrapped,
};