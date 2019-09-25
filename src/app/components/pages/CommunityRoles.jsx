import React from 'react';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';

class CommunityRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newCommunityUserName: '',
            newCommunityUserRole: '',
        };
        this.handleNewCommunityUserNameChange = this.handleNewCommunityUserNameChange.bind(
            this
        );
        this.handleNewCommunityUserRoleChange = this.handleNewCommunityUserRoleChange.bind(
            this
        );
        this.handleNewCommunityUserSubmit = this.handleNewCommunityUserSubmit.bind(
            this
        );
    }

    componentDidMount() {
        this.props.setCurrentCommunity(this.props.communityName);
        this.props.listCommunityRoles(this.props.communityName);
    }

    handleNewCommunityUserNameChange(event) {
        this.setState({ newCommunityUserName: event.target.value });
    }

    handleNewCommunityUserRoleChange(event) {
        this.setState({ newCommunityUserRole: event.target.value });
    }

    handleNewCommunityUserSubmit(event) {
        event.preventDefault();
        debugger;
        const newCommunityUser = {
            username: this.state.newCommunityUserName,
            role: this.state.newCommunityUserRole,
        };
        this.props.addCommunityUser(newCommunityUser);
    }

    render() {
        const {
            pathname,
            community,
            account,
            isOwnAccount,
            user_preferences,
        } = this.props;
        const communityTableCells = community.communityUsersWithRoles.map(
            communityUserAndRole => {
                return (
                    <tr>
                        <td>{communityUserAndRole[0]}</td>
                        <td>{communityUserAndRole[1]}</td>
                    </tr>
                );
            }
        );

        const communityTable = (
            <table>
                <thead>
                    <th>Username</th>
                    <th>Role</th>
                </thead>
                <tbody>{communityTableCells}</tbody>
            </table>
        );
        return (
            <div className="CommunityRoles">
                <div className="row">
                    <div className="column large-4">
                        <div>Community Name: {community.community}</div>
                        <div>Community Members:</div>
                        <div>{communityTable}</div>
                        <div>Add new user to community:</div>
                        <form onSubmit={this.handleNewCommunityUserSubmit}>
                            <label>
                                User:
                                <input
                                    required
                                    onChange={
                                        this.handleNewCommunityUserNameChange
                                    }
                                    type="text"
                                    name="name"
                                />
                            </label>
                            <label>
                                Role:
                                <select
                                    onChange={
                                        this.handleNewCommunityUserRoleChange
                                    }
                                >
                                    <option value="admin">admin</option>
                                    <option value="mod">mod</option>
                                    <option selected value="member">
                                        member
                                    </option>
                                    <option value="guest">guest</option>
                                    <option value="muted">muted</option>
                                </select>
                            </label>
                            <input type="submit" value="Submit" />
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        const pathname = state.app.get('location').pathname;
        const communityName = ownProps.params.community;
        return {
            pathname,
            community: state.community.toJS(),
            communityName,
            user_preferences: state.app.get('user_preferences').toJS(),
            ...ownProps,
        };
    },
    dispatch => ({
        setCurrentCommunity: community => {
            dispatch(communityActions.setCurrentCommunity(community));
        },
        listCommunityRoles: community => {
            dispatch(communityActions.listCommunityRoles(community));
        },
        updateCommunityUser: communityUser => {
            dispatch(communityActions.updateCommunityUser(communityUser));
        },
        addCommunityUser: communityUser => {
            dispatch(communityActions.addCommunityUser(communityUser));
        },
    })
)(CommunityRoles);
