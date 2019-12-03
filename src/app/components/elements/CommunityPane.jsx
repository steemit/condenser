import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Role } from 'app/utils/Community';
import SettingsEditButton from 'app/components/elements/SettingsEditButton';
import SubscribeButton from 'app/components/elements/SubscribeButton';
import Icon from 'app/components/elements/Icon';
import * as globalActions from 'app/redux/GlobalReducer';
import { numberWithCommas } from 'app/utils/StateFunctions';

const nl2br = text =>
    text.split('\n').map((item, key) => (
        <span key={key}>
            {item}
            <br />
        </span>
    ));
const nl2li = text =>
    text.split('\n').map((item, key) => <li key={key}>{item}</li>);

class CommunityPane extends Component {
    static propTypes = {
        community: PropTypes.object.isRequired,
        showRecentSubscribers: PropTypes.func.isRequired,
    };

    render() {
        const { community, showRecentSubscribers } = this.props;
        const handleSubscriberClick = () => {
            showRecentSubscribers(community);
        };

        function teamMembers(members) {
            return members.map((row, idx) => {
                const account = `@${row.get(0)}`;
                const title = row.get(2);
                const sep = title ? '/ ' : '';
                const role = row.get(1);

                return (
                    <div key={idx} style={{ fontSize: '80%' }}>
                        <Link to={`/${account}`}>{account}</Link>
                        {role && <span className="user_role"> {role} </span>}
                        {title && <span className="affiliation">{title}</span>}
                    </div>
                );
            });
        }

        const category = community.get('name');
        const viewer_role = community.getIn(['context', 'role'], 'guest');
        const canPost = Role.canPost(category, viewer_role);

        return (
            <div>
                <div className="c-sidebar__module">
                    {Role.atLeast(viewer_role, 'admin') && (
                        <div style={{ float: 'right', fontSize: '0.8em' }}>
                            <SettingsEditButton
                                community={community.get('name')}
                            >
                                Edit
                            </SettingsEditButton>
                        </div>
                    )}
                    <div className="c-sidebar__header">
                        <h3 className="c-sidebar__h3">
                            {community.get('title')}
                        </h3>
                        {community.get('is_nsfw') && (
                            <span className="affiliation">nsfw</span>
                        )}
                    </div>
                    <div style={{ margin: '-6px 0 12px' }}>
                        {community.get('about')}
                    </div>
                    <div
                        className="row"
                        style={{ textAlign: 'center', lineHeight: '1em' }}
                    >
                        <div
                            onClick={handleSubscriberClick}
                            className="column small-4 pointer"
                        >
                            {numberWithCommas(community.get('subscribers'))}
                            <br />
                            <small>
                                {community.get('subscribers') == 1
                                    ? 'subscriber'
                                    : 'subscribers'}
                            </small>
                        </div>
                        <div className="column small-4">
                            {'$'}
                            {numberWithCommas(community.get('sum_pending'))}
                            <br />
                            <small>
                                pending<br />rewards
                            </small>
                        </div>
                        <div className="column small-4">
                            {numberWithCommas(community.get('num_authors'))}
                            <br />
                            <small>
                                active<br />posters
                            </small>
                        </div>
                    </div>

                    <div style={{ margin: '12px 0 0' }}>
                        {community &&
                            this.props.username && (
                                <SubscribeButton
                                    community={community.get('name')}
                                    display="block"
                                />
                            )}
                        {canPost && (
                            <Link
                                className="button primary"
                                style={{
                                    minWidth: '6em',
                                    display: 'block',
                                    margin: '-6px 0 8px',
                                }}
                                to={`/submit.html?category=${category}`}
                            >
                                New Post
                            </Link>
                        )}
                        {!canPost && (
                            <div
                                className="text-center"
                                style={{ marginBottom: '8px' }}
                            >
                                <small className="text-muted">
                                    <Icon name="eye" />&nbsp; Only approved
                                    members can post
                                </small>
                            </div>
                        )}
                    </div>
                    <div>
                        {Role.atLeast(viewer_role, 'mod') && (
                            <div style={{ float: 'right', fontSize: '0.8em' }}>
                                <Link to={`/roles/${category}`}>
                                    Edit Roles
                                </Link>
                            </div>
                        )}
                        <strong>Leadership</strong>
                        {teamMembers(community.get('team', List()))}
                    </div>
                </div>
                <div className="c-sidebar__module">
                    {community.get('description') && (
                        <div>
                            <strong>Description</strong>
                            <br />
                            {nl2br(community.get('description', 'empty'))}
                            <br />
                        </div>
                    )}
                    {community.get('flag_text') && (
                        <div>
                            <strong>Rules</strong>
                            <br />
                            <ol>{nl2li(community.get('flag_text'))}</ol>
                            <br />
                        </div>
                    )}
                    <div>
                        <strong>Language</strong>
                        <br />
                        {community.get('lang')}
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
)(CommunityPane);
