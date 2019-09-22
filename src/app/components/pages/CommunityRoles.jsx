import React from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import * as communityActions from 'app/redux/CommunityReducer';
import UserList from 'app/components/elements/UserList';

class CommunityRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            successMessage: '',
        };
        this.onNsfwPrefChange = this.onNsfwPrefChange.bind(this);
    }
    componentDidMount() {
        this.props.setCurrentCommunity('hive-105677');
    }

    ///roles/<community-id>
    // onMount set the current community from the path.

    render() {
        const { state, props } = this;

        const {
            community,
            walletUrl,
            ignores,
            account,
            isOwnAccount,
            user_preferences,
        } = this.props;

        return (
            <div className="Settings">
                <div className="row">
                    <br />
                    <div className="small-12 medium-4 large-4 columns">
                        <select
                            value={user_preferences.nsfwPref}
                            onChange={e => {
                                console.log(e);
                            }}
                        >
                            <option value="admin">admin</option>
                            <option value="mod">mod</option>
                            <option value="member">member</option>
                            <option value="guest">guest</option>
                            <option value="muted">muted</option>
                        </select>
                        <br />
                        <br />
                    </div>
                </div>
                {ignores &&
                    ignores.size > 0 && (
                        <div className="row">
                            <div className="small-12 medium-6 large-6 columns">
                                <br />
                                <br />
                                <UserList
                                    title={tt('settings_jsx.muted_users')}
                                    users={ignores}
                                />
                            </div>
                        </div>
                    )}
            </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        const { accountname } = ownProps.routeParams;

        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == accountname;
        const ignores =
            isOwnAccount &&
            state.global.getIn([
                'follow',
                'getFollowingAsync',
                accountname,
                'ignore_result',
            ]);

        const pathname = state.app.get('location').pathname;

        return {
            pathname,
            community: state.community.toJS(),
            accountname,
            isOwnAccount,
            ignores,
            account: state.global.getIn(['accounts', accountname]).toJS(),
            user_preferences: state.app.get('user_preferences').toJS(),
            walletUrl: state.app.get('walletUrl'),
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
