import React from 'react';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import { Map, List } from 'immutable';
import tt from 'counterpart';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import UserRole from 'app/components/modules/UserRole';
import { Link } from 'react-router';
import PostsIndexLayout from 'app/components/pages/PostsIndexLayout';

class CommunityRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: '',
            role: 'member',
            title: '',
            updateRoleModal: false,
            addUserToCommunityModal: false,
            updatedRole: '',
        };
        this.onAccountChange = this.onAccountChange.bind(this);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onEditUserRoleSelect = this.onEditUserRoleSelect.bind(this);
        this.toggleUpdateRoleModal = this.toggleUpdateRoleModal.bind(this);
        this.toggleAddUserToCommunityModal = this.toggleAddUserToCommunityModal.bind(
            this
        );
    }

    componentDidMount() {
        this.props.getCommunityRoles(this.props.community);
    }

    toggleUpdateRoleModal(showModal) {
        this.setState({
            updateRoleModal: showModal,
        });
    }
    toggleAddUserToCommunityModal(showModal) {
        this.setState({
            addUserToCommunityModal: showModal,
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
        const {
            community,
            loading,
            updating,
            roles,
            communityMetadata,
        } = this.props;

        const canEdit = {
            owner: ['admin', 'mod', 'member', 'guest', 'muted'],
            admin: ['mod', 'member', 'guest', 'muted'],
            mod: ['member', 'guest', 'muted'],
            member: ['guest', 'muted'],
            guest: ['muted'],
        };

        let availableRoles = [];

        if (
            communityMetadata &&
            communityMetadata.context &&
            Object.keys(communityMetadata.context).length > 0
        ) {
            availableRoles = canEdit[communityMetadata.context.role];
        }

        const tableRows = roles.toJS().map((tuple, index) => {
            const name = tuple[0];
            const title = tuple[2];
            let role = tuple[1];
            if (availableRoles && availableRoles.includes(tuple[1])) {
                role = (
                    <a
                        className="community-user--role"
                        aria-labelledby="Community User Role"
                        onClick={e => {
                            e.preventDefault();
                            this.onEditUserRoleSelect(name, tuple[1], title);
                            this.toggleUpdateRoleModal(true);
                        }}
                    >
                        {tuple[1]}
                    </a>
                );
            }
            return (
                <tr key={name}>
                    <td>
                        <Link to={`/@${name}`}>@{name}</Link>
                    </td>
                    <td>{role}</td>
                    <td>{title}</td>
                </tr>
            );
        });

        const table = (
            <table>
                <thead>
                    <tr>
                        <th>{tt('g.account')}</th>
                        <th>{tt('g.role')}</th>
                        <th>{tt('g.title')}</th>
                    </tr>
                </thead>
                <tbody>{tableRows}</tbody>
            </table>
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
                    availableRoles={availableRoles}
                    addUser={false}
                />
            </Reveal>
        );

        const addUserModal = (
            <Reveal onHide={() => null} show>
                <CloseButton
                    onClick={() => this.toggleAddUserToCommunityModal(false)}
                />
                <UserRole
                    title={this.state.title}
                    username={this.state.account}
                    community={this.props.community}
                    role={this.state.role}
                    onSubmit={(newUsername, newUserRole) => {
                        const params = {
                            community: this.props.community,
                            account: newUsername,
                            role: newUserRole,
                        };
                        this.props.updateUser(params);
                        this.toggleAddUserToCommunityModal(false);
                    }}
                    availableRoles={availableRoles}
                    addUser
                />
            </Reveal>
        );

        const commName = (communityMetadata && communityMetadata.title) || null;

        let body;
        if (loading) {
            body = (
                <center>
                    <LoadingIndicator type="circle" />
                </center>
            );
        } else {
            body = (
                <div>
                    <h1 className="articles__h1">
                        <Link to={`/trending/${community}`}>
                            {commName || community}
                        </Link>
                    </h1>
                    <br />
                    <div className="c-sidebar__module">
                        <h4>{tt('g.user_roles')}</h4>
                        {updating && <div>{tt('g.updating_user')}</div>}
                        {this.state.updateRoleModal && editUserModal}
                        {this.state.addUserToCommunityModal && addUserModal}
                        <div>
                            {table}
                            <button
                                onClick={() => {
                                    this.toggleAddUserToCommunityModal(true);
                                }}
                                className="button slim hollow secondary"
                            >
                                {tt('g.add_user')}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <PostsIndexLayout
                category={community}
                enableAds={false}
                blogmode={false}
            >
                <div className="CommunityRoles">
                    <div className="row">
                        <div className="column large-9 medium-12 small-12">
                            {body}
                        </div>
                    </div>
                </div>
            </PostsIndexLayout>
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
        const communityMetadata = state.global.getIn(['community', community]);
        return {
            community,
            roles,
            loading,
            updating,
            communityMetadata: communityMetadata && communityMetadata.toJS(),
        };
    },

    dispatch => ({
        getCommunityRoles: community => {
            dispatch(communityActions.getCommunityRoles(community));
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
