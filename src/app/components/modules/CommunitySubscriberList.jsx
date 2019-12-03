import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import { Role } from 'app/utils/Community';
import UserTitle from 'app/components/elements/UserTitle';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

class CommunitySubscriberList extends React.Component {
    static propTypes = {
        community: PropTypes.object.isRequired,
        username: PropTypes.string,
        viewerRole: PropTypes.string.isRequired,
        fetchSubscribers: PropTypes.func.isRequired,
    };

    static defaultProps = {
        username: undefined,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.subscribers.length === 0) {
            this.props.fetchSubscribers(this.props.community.name);
        }
    }

    render() {
        const {
            loading,
            subscribers,
            community,
            viewerRole,
            username,
            fetchSubscribers,
        } = this.props;
        const isMod = Role.atLeast(viewerRole, 'mod');
        const subs = subscribers.map((s, idx) => (
            <div key={idx}>
                <a href={`/@${s[0]}`}>@{s[0]} </a>
                <UserTitle
                    username={username}
                    community={community.name}
                    author={s[0]}
                    permlink={'/'}
                    role={s[1]}
                    title={s[2]}
                    hideEdit={!isMod}
                    onEditSubmit={() => fetchSubscribers(community.name)}
                />
            </div>
        ));
        return (
            <div>
                <strong>Latest {community.title} Subscribers</strong>
                <hr />
                {loading && (
                    <center>
                        <LoadingIndicator type="circle" />
                    </center>
                )}
                <div>{subs}</div>
            </div>
        );
    }
}

const ConnectedCommunitySubscriberList = connect(
    // mapStateToProps
    (state, ownProps) => {
        let subscribers = [];
        let loading = true;
        let viewerRole = 'guest';
        // TODO: re-fetch community upon user loging - currently when a user logs in, at a community page, the context is not updated.
        // viewerRole = state.global.getIn(['community', ownProps.community.name, 'context', 'role'], 'guest');
        const username = state.user.getIn(['current', 'username'], null);
        const communityMember = state.global
            .getIn(['community', ownProps.community.name, 'team'], List([]))
            .toJS()
            .filter(member => member[0] === username);
        if (username && communityMember.length > 0) {
            viewerRole = communityMember[0][1];
        }
        if (
            state.community.getIn([ownProps.community.name]) &&
            state.community.getIn([ownProps.community.name, 'subscribers']) &&
            state.community.getIn([ownProps.community.name, 'subscribers'])
                .length > 0
        ) {
            subscribers = state.community.getIn([
                ownProps.community.name,
                'subscribers',
            ]);
            loading = state.community.getIn([
                ownProps.community.name,
                'listSubscribersPending',
            ]);
        }

        return {
            subscribers,
            loading,
            viewerRole,
            username,
        };
    },
    // mapDispatchToProps
    dispatch => {
        return {
            fetchSubscribers: communityName =>
                dispatch(
                    communityActions.getCommunitySubscribers(communityName)
                ),
        };
    }
)(CommunitySubscriberList);

export default ConnectedCommunitySubscriberList;
