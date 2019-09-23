import React from 'react';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';

class CommunityRoles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        this.props.setCurrentCommunity('hive-105677');
    }

    render() {
        const {
            pathname,
            community,
            account,
            isOwnAccount,
            user_preferences,
        } = this.props;
        return <h1>Community Roles</h1>;
    }
}

export default connect(
    (state, ownProps) => {
        const pathname = state.app.get('location').pathname;

        return {
            pathname,
            community: state.community.toJS(),
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
