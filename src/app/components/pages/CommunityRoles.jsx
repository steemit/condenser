import React from 'react';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import { Map, List } from 'immutable';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

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
        this.props.loadCommunityRoles(this.props.community);
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
                        <h2>{community}</h2>
                        {updating && <div>Updating User...</div>}
                        {loading && spinner}
                        {!loading && (
                            <div>
                                <div>User roles:</div>
                                <div>{table}</div>
                                <div>Modify user role:</div>
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
