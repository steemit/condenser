import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Role } from 'app/utils/Community';
import SettingsEditButton from 'app/components/elements/SettingsEditButton';
import SubscribeButton from 'app/components/elements/SubscribeButton';

class CommunityPaneMobile extends Component {
    static propTypes = {
        community: PropTypes.object.isRequired,
    };

    render() {
        const { community } = this.props;

        const category = community.get('name');
        const viewer_role = community.getIn(['context', 'role'], 'guest');

        return (
            <div>
                <div className="c-sidebar__module CommunityPaneMobile">
                    <div
                        className="row"
                        style={{ textAlign: 'center', lineHeight: '1em' }}
                    >
                        <div
                            className="column large-5 medium-6 small-12"
                            style={{ textAlign: 'left' }}
                        >
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

                        <div className="column large-1 medium-2 small-2">
                            {community.get('subscribers')}
                            <br />
                            <small>
                                {community.get('subscribers') == 1
                                    ? 'subscriber'
                                    : 'subscribers'}
                            </small>
                        </div>
                        <div className="column large-1 medium-2 small-2">
                            {'$'}
                            {community.get('sum_pending')}
                            <br />
                            <small>pending rewards</small>
                        </div>
                        <div className="column large-1 medium-2 small-2">
                            {community.get('num_pending')}
                            <br />
                            <small>pending posts</small>
                        </div>

                        <div className="column large-4 medium-12 small-6 xsmall-12">
                            <Link
                                className="button primary"
                                style={{ minWidth: '6em', marginRight: '16px' }}
                                to={`/submit.html?category=${category}`}
                            >
                                Post
                            </Link>
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
    })
)(CommunityPaneMobile);
