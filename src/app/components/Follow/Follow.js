import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Set, Map } from 'immutable';
import tt from 'counterpart';

import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Button from 'golos-ui/Button';
import Icon from 'golos-ui/Icon';

export default class Follow extends Component {
    static propTypes = {
        following: PropTypes.string,
        follower: PropTypes.string, // OPTIONAL default to current user
        showFollow: PropTypes.bool,
        showMute: PropTypes.bool,
        children: PropTypes.any,
        showLogin: PropTypes.func.isRequired,
    };

    static defaultProps = { showFollow: true, showMute: true };

    state = { busy: false };

    handleUpdateFollow = type => {
        const { updateFollow, follower, following } = this.props;
        if (this.state.busy) return;

        this.setState({ busy: true });
        const done = () => this.setState({ busy: false });

        updateFollow(follower, following, type, done);
    };

    follow = () => this.handleUpdateFollow('blog');
    unfollow = () => this.handleUpdateFollow(null);
    ignore = () => this.handleUpdateFollow('ignore');
    unignore = () => this.handleUpdateFollow(null);

    followLoggedOut = e => {
        // close author preview if present
        const author_preview = document.querySelector('.dropdown-pane.is-open');
        if (author_preview) author_preview.remove();
        // resume authenticate modal
        this.props.showLogin(e);
    };

    render() {
        const { loading } = this.props;
        if (loading)
            return (
                <span>
                    <LoadingIndicator /> {tt('g.loading')}&hellip;
                </span>
            );
        if (loading !== false) {
            // must know what the user is already following before any update can happen
            return null;
        }

        const { follower, following } = this.props; // html
        // Show follow preview for new users
        if (!follower || !following)
            return (
                <Button onClick={this.followLoggedOut}>{tt('g.follow')}</Button>
            );

        // Can't follow or ignore self
        if (follower === following) return null;

        const { showFollow, showMute, children, followingWhat } = this.props;
        const { busy } = this.state;

        return (
            <Fragment>
                {showFollow && followingWhat !== 'blog' ? 
                    (
                        <Button disabled={busy} onClick={this.follow}>
                            <Icon name="subscribe" height="10px" width="14px" />
                            {tt('g.follow')}
                        </Button>
                    )
                    :
                    (
                        <Button disabled={busy} light onClick={this.unfollow}>
                            <Icon name="cross" height="10px" width="10px" />
                            {tt('g.unfollow')}
                        </Button>
                    )}

                {showMute && followingWhat !== 'ignore' ? 
                    (
                        <Button disabled={busy} onClick={this.ignore}>
                            {tt('g.mute')}
                        </Button>
                    )
                    :
                    (
                        <Button disabled={busy} light onClick={this.unignore}>
                            {tt('g.unmute')}
                        </Button>
                    )}

                {children && <span>&nbsp;&nbsp;{children}</span>}
            </Fragment>
        );
    }
}

const emptyMap = Map();
const emptySet = Set();

module.exports = connect(
    (state, ownProps) => {
        let { follower } = ownProps;
        if (!follower) {
            const current_user = state.user.get('current');
            follower = current_user ? current_user.get('username') : null;
        }

        const { following } = ownProps;
        const follow = state.global.getIn(
            ['follow', 'getFollowingAsync', follower],
            emptyMap
        );
        const loading =
            follow.get('blog_loading', false) || follow.get('ignore_loading', false);
        const followingWhat = follow.get('blog_result', emptySet).contains(following)
            ? 'blog'
            : follow.get('ignore_result', emptySet).contains(following)
                ? 'ignore'
                : null;

        return {
            follower,
            following,
            followingWhat,
            loading,
        };
    },
    dispatch => ({
        updateFollow: (follower, following, action, done) => {
            const what = action ? [action] : [];
            const json = ['follow', { follower, following, what }];
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'follow',
                        required_posting_auths: [follower],
                        json: JSON.stringify(json),
                    },
                    successCallback: done,
                    errorCallback: done,
                })
            );
        },
        showLogin: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showLogin());
        },
    })
)(Follow);
