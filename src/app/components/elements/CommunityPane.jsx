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
            return members.map((row, idx) => (
                <div key={idx} style={{ fontSize: '80%' }}>
                    <Link to={'/@' + row.get(0)}>{'@' + row.get(0)}</Link>
                    {' ['}
                    {row.get(1)}
                    {'] '}
                    {row.get(2) && (
                        <span className="affiliation">{row.get(2)}</span>
                    )}
                </div>
            ));
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
                {Role.atLeast(viewer_role, 'mod') && (
                    <Link
                        className="button slim hollow"
                        to={`/roles/${category}`}
                    >
                        Edit Roles
                    </Link>
                )}
                {Role.atLeast(viewer_role, 'mod') && (
                    <SettingsEditButton community={community.get('name')} />
                )}
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
