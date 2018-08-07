import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import is from 'styled-is';
import { Map } from 'immutable';
import { last } from 'ramda';

import tt from 'counterpart';
import { blockedUsers, blockedUsersContent } from 'app/utils/IllegalContent';

import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import IllegalContentMessage from 'app/components/elements/IllegalContentMessage';
import Container from 'src/app/components/common/Container';
import UserHeader from 'src/app/components/userProfile/common/UserHeader';
import UserNavigation from 'src/app/components/userProfile/common/UserNavigation';
import UserCardAbout from 'src/app/components/userProfile/common/UserCardAbout';

const Main = styled.div`
    background-color: #f9f9f9;
    padding: 20px 0;
`;

const SidebarLeft = styled.div`
    flex-basis: 273px;
    flex-shrink: 0;
`;

const Content = styled.div`
    flex-shrink: 1;
    flex-grow: 1;
    margin: 0 18px;

    &:first-child {
        margin-left: 0;
    }

    &:last-child {
        margin-right: 0;
    }

    ${is('center')`
        flex-shrink: 0;
        flex-grow: 0;
    `}
`;

const SidebarRight = styled.div`
    width: 273px;
    flex-shrink: 0;
`;

export default class UserProfileContainer extends Component {
    static propTypes = {
        isOwner: PropTypes.bool,
        params: PropTypes.object,
        route: PropTypes.object,
        routeParams: PropTypes.object,
        routes: PropTypes.array,
        router: PropTypes.any,
        content: PropTypes.any, // Routed component
        currentUser: PropTypes.object, // Immutable.Map
        currentAccount: PropTypes.object, // Immutable.Map
    };

    render() {
        const {
            currentUser,
            currentAccount,
            fetching,
            isOwner,
            followerCount,
            followingCount,
            uploadImage,
            updateAccount,
            notify,
        } = this.props;

        if (!currentAccount) {
            if (fetching) {
                return (
                    <div className="UserProfile loader">
                        <div className="UserProfile__center">
                            <LoadingIndicator type="circle" size={40} />
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="UserProfile">
                        <div className="UserProfile__center">
                            {tt('user_profile.unknown_account')}
                        </div>
                    </div>
                );
            }
        }

        if (blockedUsers.includes(currentAccount.get('name'))) {
            return <IllegalContentMessage />;
        }

        if (blockedUsersContent.includes(currentAccount.get('name'))) {
            return <div>{tt('g.blocked_user_content')}</div>;
        }

        const route = last(this.props.routes).path;

        return (
            <Fragment>
                <UserHeader
                    currentAccount={currentAccount}
                    currentUser={currentUser}
                    isOwner={isOwner}
                    uploadImage={uploadImage}
                    updateAccount={updateAccount}
                    notify={notify}
                />
                <UserNavigation
                    accountName={currentAccount.get('name')}
                    isOwner={isOwner}
                    showLayout={!route || route === 'blog'}
                />
                <Main>
                    <Container align="flex-start" justify="center" small>
                        {route !== 'settings' && (
                            <SidebarLeft>
                                <UserCardAbout
                                    account={currentAccount}
                                    followerCount={followerCount}
                                    followingCount={followingCount}
                                />
                            </SidebarLeft>
                        )}
                        <Content center={route === 'settings'}>{this.props.content}</Content>
                        {this.props.sidebarRight && (
                            <SidebarRight>{this.props.sidebarRight}</SidebarRight>
                        )}
                    </Container>
                </Main>
            </Fragment>
        );
    }
}

module.exports = {
    path: '@:accountName',
    getIndexRoute(nextState, cb) {
        cb(null, {
            components: {
                content: require('./blog/BlogContent').default,
                sidebarRight: require('../../components/userProfile/common/RightPanel').default,
            },
        });
    },
    childRoutes: [
        {
            path: 'comments',
            getComponents(nextState, cb) {
                cb(null, {
                    content: require('./comments/CommentsContent').default,
                    sidebarRight: require('../../components/userProfile/common/RightPanel').default,
                });
            },
        },
        {
            path: 'recent-replies',
            getComponents(nextState, cb) {
                cb(null, {
                    content: require('./replies/RepliesContent').default,
                    sidebarRight: require('../../components/userProfile/common/RightPanel').default,
                });
            },
        },
        {
            path: 'settings',
            getComponents(nextState, cb) {
                cb(null, {
                    content: require('./settings/SettingsContent').default,
                });
            },
        },
        {
            path: 'activity',
            getComponents(nextState, cb) {
                cb(null, {
                    content: require('./activity/ActivityContent').default,
                    sidebarRight: require('../../components/userProfile/common/RightPanel').default,
                });
            },
        },
    ],
    component: connect(
        (state, props) => {
            const accountName = props.params.accountName.toLowerCase();

            const currentUser = state.user.get('current') || Map();
            const currentAccount = state.global.getIn(['accounts', accountName]);

            const fetching = state.app.get('loading');
            const isOwner = currentUser.get('username') === accountName;

            const followerCount = state.global.getIn(
                ['follow_count', accountName, 'follower_count'],
                0
            );

            const followingCount = state.global.getIn(
                ['follow_count', accountName, 'following_count'],
                0
            );

            return {
                currentUser,
                currentAccount,

                fetching,
                isOwner,

                followerCount,
                followingCount,
            };
        },
        dispatch => ({
            uploadImage: (file, progress) => {
                dispatch({
                    type: 'user/UPLOAD_IMAGE',
                    payload: { file, progress },
                });
            },
            updateAccount: ({ successCallback, errorCallback, ...operation }) => {
                dispatch(
                    transaction.actions.broadcastOperation({
                        type: 'account_metadata',
                        operation,
                        successCallback() {
                            dispatch(user.actions.getAccount());
                            successCallback();
                        },
                        errorCallback,
                    })
                );
            },
            notify: (message, dismiss = 3000) => {
                dispatch({
                    type: 'ADD_NOTIFICATION',
                    payload: {
                        key: 'settings_' + Date.now(),
                        message,
                        dismissAfter: dismiss,
                    },
                });
            },
        })
    )(UserProfileContainer),
};
