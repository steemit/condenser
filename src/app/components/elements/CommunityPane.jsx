import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Role } from 'app/utils/Community';
import SettingsEditButton from 'app/components/elements/SettingsEditButton';
import SubscribeButton from 'app/components/elements/SubscribeButton';

class CommunityPane extends Component {
    static propTypes = {
        community: PropTypes.object.isRequired,
    };

    render() {
        const { community } = this.props;

        function teamMembers(members) {
            return members.map((row, idx) => {
                const account = `@${row.get(0)}`;
                const title = row.get(2);
                const sep = title ? '/ ' : '';
                const role = row.get(1) != 'mod' ? row.get(1) : null;

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

        return (
            <div className="c-sidebar__module">
                <div className="c-sidebar__header">
                    <h3 className="c-sidebar__h3">{community.get('title')}</h3>
                    {community.get('is_nsfw') && (
                        <span className="affiliation">nsfw</span>
                    )}
                </div>
                <div
                    style={{
                        border: '1px solid #ccc',
                        marginBottom: '16px',
                        padding: '0.5em',
                    }}
                >
                    {community.get('about')}
                </div>
                <div>
                    <Link
                        className="button slim hollow primary"
                        style={{ minWidth: '6em' }}
                        to={`/submit.html?category=${category}`}
                    >
                        New Post
                    </Link>
                    {this.props.username && (
                        <SubscribeButton community={community.get('name')} />
                    )}
                </div>
                {community.get('subscribers')} subscribers
                <br />
                <br />
                <strong>Moderators</strong>
                {teamMembers(community.get('team', List()))}
                <div style={{ fontSize: '0.8em' }}>
                    {Role.atLeast(viewer_role, 'mod') && (
                        <Link to={`/roles/${category}`}>Edit Roles...</Link>
                    )}
                </div>
                <div style={{ fontSize: '0.8em' }}>
                    {Role.atLeast(viewer_role, 'mod') && (
                        <SettingsEditButton community={community.get('name')}>
                            Edit Settings...
                        </SettingsEditButton>
                    )}
                </div>
                <br />
                <strong>Description</strong>
                <br />
                {community.get('description', 'empty')}
                <br />
                <br />
                <strong>Language</strong>
                <br />
                {community.get('lang')}
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => ({
        community: ownProps.community,
    })
)(CommunityPane);
