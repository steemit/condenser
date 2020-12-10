/* eslint-disable no-undef */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Role } from 'app/utils/Community';
import SettingsEditButton from 'app/components/elements/SettingsEditButton';
import SubscribeButton from 'app/components/elements/SubscribeButton';
import * as globalActions from 'app/redux/GlobalReducer';
import * as userActions from 'app/redux/UserReducer';
import { numberWithCommas } from 'app/utils/StateFunctions';

class CommunityPaneMobile extends Component {
    static propTypes = {
        community: PropTypes.object.isRequired,
        showRecentSubscribers: PropTypes.func.isRequired,
        showModerationLog: PropTypes.func.isRequired,
    };

    render() {
        const {
            community,
            showRecentSubscribers,
            showModerationLog,
            showLogin,
        } = this.props;
        const handleSubscriberClick = () => {
            showRecentSubscribers(community);
        };
        const handleModerationLogCLick = e => {
            e.preventDefault();
            showModerationLog(community);
        };
        const category = community.get('name');
        const viewer_role = community.getIn(['context', 'role'], 'guest');
        const canPost = Role.canPost(category, viewer_role);

        const settings = Role.atLeast(viewer_role, 'admin') && (
            <SettingsEditButton community={community.get('name')}>
                Settings
            </SettingsEditButton>
        );

        const roles = Role.atLeast(viewer_role, 'mod') && (
            <Link to={`/roles/${category}`}>Roles</Link>
        );

        const subs = community.get('subscribers');

        const checkIfLogin = () => {
            if (!this.props.loggedIn) {
                return showLogin();
            }
            return browserHistory.replace(`/submit.html?category=${category}`);
        };

        return (
            <div>
                <div className="c-sidebar__module CommunityPaneMobile">
                    <div
                        className="row"
                        style={{ textAlign: 'center', lineHeight: '1em' }}
                    >
                        <div
                            className="column large-10 medium-8 small-12"
                            style={{ textAlign: 'left' }}
                        >
                            {roles && (
                                <div style={{ float: 'right' }}>
                                    Mod{': '}
                                    {roles}
                                    {settings && (
                                        <span>
                                            {' / '}
                                            {settings}
                                        </span>
                                    )}
                                </div>
                            )}
                            <h3 className="c-sidebar__h3">
                                {community.get('title')}
                            </h3>
                            <div
                                style={{
                                    margin: '-14px 0 8px',
                                    opacity: '0.65',
                                }}
                            >
                                <span
                                    onClick={handleSubscriberClick}
                                    className="pointer"
                                >
                                    {numberWithCommas(subs)}
                                    {subs == 1 ? ' subscriber' : ' subscribers'}
                                </span>
                                <div
                                    style={{
                                        float: 'right',
                                        fontSize: '0.8em',
                                    }}
                                >
                                    <a onClick={handleModerationLogCLick}>
                                        Activity Log
                                    </a>
                                </div>
                                &nbsp;&nbsp;&bull;&nbsp;&nbsp;
                                {numberWithCommas(
                                    community.get('num_authors')
                                )}{' '}
                                active
                            </div>
                            {community.get('is_nsfw') && (
                                <span className="affiliation">nsfw</span>
                            )}
                            <div style={{ margin: '0 0 12px' }}>
                                {community.get('about')}
                            </div>
                        </div>

                        <div className="column large-2 medium-4 small-12">
                            <span
                                style={{
                                    display: 'inline-block',
                                    margin: '0 4px',
                                }}
                            >
                                <SubscribeButton
                                    community={community.get('name')}
                                />
                            </span>
                            {canPost && (
                                <span
                                    style={{
                                        display: 'inline-block',
                                        margin: '0 4px',
                                    }}
                                >
                                    <Link
                                        className="button primary"
                                        style={{ minWidth: '7em' }}
                                        onClick={checkIfLogin}
                                    >
                                        Post
                                    </Link>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => ({
        community: ownProps.community,
        loggedIn: !!state.user.getIn(['current', 'username']),
    }),
    // mapDispatchToProps
    dispatch => {
        return {
            showLogin: e => {
                if (e) e.preventDefault();
                dispatch(userActions.showLogin({ type: 'basic' }));
            },
            showRecentSubscribers: community => {
                dispatch(
                    globalActions.showDialog({
                        name: 'communitySubscribers',
                        params: { community },
                    })
                );
            },
            showModerationLog: community => {
                dispatch(
                    globalActions.showDialog({
                        name: 'communityModerationLog',
                        params: { community },
                    })
                );
            },
        };
    }
)(CommunityPaneMobile);
