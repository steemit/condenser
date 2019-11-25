import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import { Role } from 'app/utils/Community';
import UserTitle from 'app/components/elements/UserTitle';
import UserTitleEditor from 'app/components/modules/UserTitleEditor';

class CommunitySubscriberList extends React.Component {
    static propTypes = {
        community: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        viewerRole: PropTypes.string.isRequired,
        fetchSubscribers: PropTypes.func.isRequired,
        saveTitle: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        const { community, loading } = this.props;
        this.editSubscriberName = () => {
            const { state: { showEditName } } = this;
            this.setState({ showEditName: !showEditName });
        };
    }

    componentDidMount() {
        if (this.props.subscribers.length === 0) {
            this.props.fetchSubscribers(this.props.community.name);
        }
    }

    onSave = (newTitle, subscriberName) => {
        const { community, loading, username, saveTitle } = this.props;
        /*
        //-- Simulate a "receiveState" action to feed new title into post state
        let newstate = { content: {}, simulation: true };
        let content_key = this.props.author + '/' + this.props.permlink;
        newstate['content'][content_key] = { author_title: newTitle };
        this.props.pushState(newstate);
        */
        debugger;
        saveTitle(username, subscriberName, community, newTitle);
    };

    render() {
        const { loading, subscribers, community, viewerRole } = this.props;

        const isMod = Role.atLeast(viewerRole, 'mod');
        const subs = this.props.subscribers.map(s => {
            const subscriberTitle = !isMod ? (
                <UserTitleEditor
                    title={s[2]}
                    username={s[0]}
                    community={community.title}
                    onSubmit={newTitle => {
                        this.onSave(newTitle, s[0]);
                        return;
                    }}
                    key={s[0]}
                />
            ) : (
                <div>{s[0]}</div>
            );
            return subscriberTitle;
        });
        return (
            <div>
                <div>Community Subscribers</div>
                {loading && <div>loading...</div>}
                {subs}
            </div>
        );
    }
}

const ConnectedCommunitySubscriberList = connect(
    // mapStateToProps
    (state, ownProps) => {
        let subscribers = [];
        let loading = true;
        if (
            state.community.getIn([ownProps.community.name]) &&
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
            username: state.user.getIn(['current', 'username']),
            viewerRole: state.community.getIn(
                [ownProps.community.name, 'context', 'role'],
                'guest'
            ),
        };
    },
    // mapDispatchToProps
    dispatch => {
        return {
            fetchSubscribers: communityName =>
                dispatch(
                    communityActions.getCommunitySubscribers(communityName)
                ),
            saveTitle: (
                username,
                account,
                community,
                title,
                successCallback,
                errorCallback
            ) => {
                const action = 'setUserTitle';

                const payload = [
                    action,
                    {
                        community,
                        account,
                        title,
                    },
                ];

                return dispatch(
                    transactionActions.broadcastOperation({
                        type: 'custom_json',
                        operation: {
                            id: 'community',
                            required_posting_auths: [username],
                            json: JSON.stringify(payload),
                        },
                        successCallback,
                        errorCallback,
                    })
                );
            },
        };
    }
)(CommunitySubscriberList);

export default ConnectedCommunitySubscriberList;
