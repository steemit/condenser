import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Role } from 'app/utils/Community';
import SettingsEditButton from 'app/components/elements/SettingsEditButton';
import SubscribeButton from 'app/components/elements/SubscribeButton';
import * as globalActions from 'app/redux/GlobalReducer';

class CommunityPaneMobile extends Component {
    static propTypes = {
        community: PropTypes.object.isRequired,
    };

    render() {
        const { community, showRecentSubscribers } = this.props;
        const handleSubscriberClick = () => {
            showRecentSubscribers(community);
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

        return (
            <div>
                <div className="c-sidebar__module CommunityPaneMobile">
                    <div
                        className="row"
                        style={{ textAlign: 'center', lineHeight: '1em' }}
                    >
                        <div
                            className="column large-5 medium-12 small-12"
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
                            {community.get('is_nsfw') && (
                                <span className="affiliation">nsfw</span>
                            )}
                            <div style={{ margin: '-6px 0 12px' }}>
                                {community.get('about')}
                            </div>
                        </div>

                        <div
                            onClick={handleSubscriberClick}
                            className="column large-1 medium-2 small-4 pointer"
                        >
                            {community.get('subscribers')}
                            <br />
                            <small>
                                {community.get('subscribers') == 1
                                    ? 'subscriber'
                                    : 'subscribers'}
                            </small>
                        </div>
                        <div className="column large-1 medium-2 small-4">
                            {'$'}
                            {community.get('sum_pending')}
                            <br />
                            <small>pending rewards</small>
                        </div>
                        <div
                            className="column large-1 medium-2 small-4"
                            style={{ marginBottom: '8px' }}
                        >
                            {community.get('num_pending')}
                            <br />
                            <small>active posts</small>
                        </div>

                        <div className="column large-4 medium-6 small-12">
                            {canPost && (
                                <Link
                                    className="button primary"
                                    style={{
                                        minWidth: '6em',
                                        marginRight: '16px',
                                    }}
                                    to={`/submit.html?category=${category}`}
                                >
                                    Post
                                </Link>
                            )}
                            {community &&
                                this.props.username && (
                                    <SubscribeButton
                                        community={community.get('name')}
                                    />
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
    }),
    // mapDispatchToProps
    dispatch => {
        return {
            showRecentSubscribers: community => {
                dispatch(
                    globalActions.showDialog({
                        name: 'communitySubscribers',
                        params: { community },
                    })
                );
            },
        };
    }
)(CommunityPaneMobile);
