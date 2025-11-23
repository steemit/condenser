/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-undef */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Role } from 'app/utils/Community';
import tt from 'counterpart';
import SettingsEditButton from 'app/components/elements/SettingsEditButton';
import Icon from 'app/components/elements/Icon';
import * as globalActions from 'app/redux/GlobalReducer';

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
        showModerationLog: PropTypes.func.isRequired,
    };

    render() {
        const { community, showModerationLog } = this.props;

        const handleModerationLogCLick = e => {
            e.preventDefault();
            showModerationLog(community);
        };

        function teamMembers(members) {
            return members.map((row, idx) => {
                const account = `@${row.get(0)}`;
                const title = row.get(2);
                const role = row.get(1);
                if (role === 'owner') {
                    return null;
                }
                return (
                    <div
                        key={`${account}__${role}`}
                        style={{ fontSize: '80%' }}
                    >
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
                    <div>
                        {!canPost && (
                            <div
                                className="text-center"
                                style={{ marginBottom: '8px' }}
                            >
                                <small className="text-muted">
                                    <Icon name="eye" />&nbsp;{' '}
                                    {tt('g.only_approved')}
                                </small>
                            </div>
                        )}
                    </div>
                    <div>
                        {Role.atLeast(viewer_role, 'mod') && (
                            <div style={{ float: 'right', fontSize: '0.8em' }}>
                                <Link to={`/roles/${category}`}>
                                    {tt('g.edit_roles')}
                                </Link>
                            </div>
                        )}
                        <strong>{tt('g.leadership')}</strong>
                        {teamMembers(community.get('team', List()))}
                        <div style={{ float: 'right', fontSize: '0.8em' }}>
                            <a onClick={handleModerationLogCLick}>
                                {tt('g.activity_log')}
                            </a>
                        </div>
                    </div>
                </div>
                <div className="c-sidebar__module">
                    {Role.atLeast(viewer_role, 'admin') && (
                        <div style={{ float: 'right', fontSize: '0.8em' }}>
                            <SettingsEditButton
                                community={community.get('name')}
                            >
                                {tt('g.edit')}
                            </SettingsEditButton>
                        </div>
                    )}
                    {community.get('description') && (
                        <div>
                            <strong>{tt('g.description')}</strong>
                            {community.get('is_nsfw') && (
                                <span className="affiliation">nsfw</span>
                            )}
                            <br />
                            {nl2br(community.get('description', 'empty'))}
                            <br />
                        </div>
                    )}
                    {community.get('flag_text') && (
                        <div>
                            <strong>{tt('g.rules')}</strong>
                            <br />
                            <ol>{nl2li(community.get('flag_text'))}</ol>
                            <br />
                        </div>
                    )}
                    <div>
                        <strong>{tt('g.language')}</strong>
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
)(CommunityPane);
