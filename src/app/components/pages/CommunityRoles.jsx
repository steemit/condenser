import React from 'react';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import { List } from 'immutable';

class CommunityRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: '',
            role: 'member',
        };
        this.onAccountChange = this.onAccountChange.bind(this);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.props.loadCommunityRoles(this.props.communityName);
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
            community: this.props.communityName,
            account: this.state.account,
            role: this.state.role,
        };
        this.props.updateUser(params);
    }

    render() {
        const { community, loading, updating, roles } = this.props;

        const tableRows = roles.toJS().map((tuple, index) => (
            <tr key={tuple[0]}>
                <td>{tuple[0]}</td>
                <td>{tuple[1]}</td>
            </tr>
        ));

        const table = (
            <table>
                <thead>
                    <th>Username</th>
                    <th>Role</th>
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

        return (
            <div className="CommunityRoles">
                <div className="row">
                    <div className="column large-4">
                        <div>Community Name: {this.props.communityName}</div>
                        {updating && <div>Updating User...</div>}
                        {loading && <div>Loading...</div>}
                        <div>Community Members:</div>
                        <div>{table}</div>
                        <div>Add new user to community:</div>
                        {form}
                    </div>
                </div>
            </div>
        );
    }
}

const CommunityRolesWrapped = connect(
    (state, ownProps) => {
        const communityName = ownProps.params.community;

        const roles =
            state.community.get('communityName') == communityName
                ? state.community.get('roles', List())
                : List();

        console.log('Community state:', state.community.toJS());

        return {
            communityName,
            roles,
            loading: roles.size == 0,
            updating: state.community.get('updatePending'),
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
