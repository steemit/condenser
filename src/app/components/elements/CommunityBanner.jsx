import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import { proxifyImageUrl } from 'app/utils/ProxifyUrl';
import { numberWithCommas } from 'app/utils/StateFunctions';
import { Role } from 'app/utils/Community';
import tt from 'counterpart';
import Userpic from 'app/components/elements/Userpic';
import SubscribeButton from 'app/components/elements/SubscribeButton';
import SettingsEditButton from 'app/components/elements/SettingsEditButton';
import Icon from 'app/components/elements/Icon';
import { actions as UserProfilesSagaActions } from 'app/redux/UserProfilesSaga';
import * as userActions from 'app/redux/UserReducer';
import * as globalActions from 'app/redux/GlobalReducer';

class CommunityBanner extends Component {
    componentDidMount() {
        const { category, profile, fetchProfile } = this.props;
        if (!profile) fetchProfile(category);
    }

    componentDidUpdate(prevProps) {
        const { profile, fetchProfile, category } = this.props;
        if (!profile) fetchProfile(category);
    }

    render() {
        const {
            profile,
            community,
            category,
            loggedIn,
            showLogin,
            showRecentSubscribers,
            showModerationLog,
        } = this.props;

        const viewer_role = community.getIn(['context', 'role'], 'guest');
        const canPost = Role.canPost(category, viewer_role);

        const checkIfLogin = () => {
            if (!loggedIn) {
                return showLogin();
            }
            return browserHistory.replace(`/submit.html?category=${category}`);
        };

        const handleSubscriberClick = () => {
            showRecentSubscribers(community);
        };

        const handleModerationLogCLick = e => {
            e.preventDefault();
            showModerationLog(community);
        };

        // Try to get the cover image from community settings
        let cover_image = community.getIn(['settings', 'cover_url']) || null;

        // If the cover image from community settings is not available, fallback to the profile cover image
        if (!cover_image) {
            cover_image = profile
                ? profile.getIn(['metadata', 'profile']).toJS().cover_image
                : null;
        }

        let cover_image_style = {};
        if (cover_image) {
            cover_image_style = {
                backgroundImage:
                    'url(' + proxifyImageUrl(cover_image, '2048x512') + ')',
            };
        }

        const avatar_image = community.getIn(['settings', 'avatar_url']);
        let avatar_image_style = {};
        if (avatar_image) {
            avatar_image_style = {
                backgroundImage:
                    'url(' + proxifyImageUrl(avatar_image, '100x100') + ')',
            };
        }

        const roles = Role.atLeast(viewer_role, 'mod') && (
            <Link to={`/roles/${category}`}>{tt('g.roles')}</Link>
        );

        const settings = Role.atLeast(viewer_role, 'admin') && (
            <SettingsEditButton community={community.get('name')}>
                {tt('g.settings')}
            </SettingsEditButton>
        );

        return (
            <div>
                <div className="UserProfile__banner row expanded">
                    <div
                        className="column CommunityBanner"
                        style={cover_image_style}
                    >
                        <div className="CommunityTitle">
                            {avatar_image ? (
                                <div
                                    className="Userpic"
                                    style={avatar_image_style}
                                />
                            ) : (
                                <Userpic account={category} />
                            )}
                            <div className="TextContainer">
                                <h1>{community.get('title')}</h1>
                                <p>{community.get('about')}</p>
                            </div>
                            <div className="AdditionalActions">
                                <div className="ModeratorRoles">
                                    {roles && (
                                        <div>
                                            {tt('g.edit')}
                                            {': '}
                                            {roles}
                                            {settings && (
                                                <span>
                                                    {' / '}
                                                    {settings}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="ActivityLog">
                                    <a onClick={handleModerationLogCLick}>
                                        {tt('g.activity_log')}
                                    </a>
                                    {community.get('is_nsfw') && (
                                        <span className="affiliation">
                                            nsfw
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="CommunityActions">
                            {community && (
                                <SubscribeButton
                                    community={community.get('name')}
                                    display="block"
                                />
                            )}
                            {canPost && (
                                <Link
                                    className="button primary"
                                    onClick={checkIfLogin}
                                >
                                    <Icon name="pencil" size="2x" />{' '}
                                    {tt('g.new_post')}
                                </Link>
                            )}
                        </div>
                        <div className="CommunityAttributes">
                            <div
                                className="CommunitySubscribers"
                                onClick={handleSubscriberClick}
                                role="button"
                                tabIndex="0"
                                aria-label="View recent subscribers"
                            >
                                <p>
                                    {numberWithCommas(
                                        community.get('subscribers')
                                    )}
                                    <span className="CommunityLabel">
                                        {community.get('subscribers') == 1
                                            ? tt('g.subscriber')
                                            : tt('g.subscribers')}
                                    </span>
                                </p>
                            </div>
                            <p>
                                ${numberWithCommas(
                                    community.get('sum_pending')
                                )}
                                <span className="CommunityLabel">
                                    {tt('g.pending_rewards')}
                                </span>
                            </p>
                            <p>
                                {numberWithCommas(community.get('num_authors'))}
                                <span className="CommunityLabel">
                                    {tt('g.active_posters')}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const { category } = ownProps;
    const community = state.global.getIn(['community', category], null);
    const profile = state.userProfiles.getIn(['profiles', category]);
    const loggedIn = !!state.user.getIn(['current', 'username']);
    const username =
        state.user.getIn(['current', 'username']) ||
        state.offchain.get('account');

    return {
        community,
        loggedIn,
        profile,
        username,
    };
};

const mapDispatchToProps = dispatch => ({
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
    fetchProfile: account =>
        dispatch(UserProfilesSagaActions.fetchProfile({ account })),
});

const connectedCommunityBanner = connect(mapStateToProps, mapDispatchToProps)(
    CommunityBanner
);

export default connectedCommunityBanner;
