import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import UserTitle from 'app/components/elements/UserTitle';
import UserTitleEditor from 'app/components/modules/UserTitleEditor';

class CommunitySubscriberList extends React.Component {
    static propTypes = {
        community: PropTypes.string,
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

    onSave = newTitle => {
        const community = this.props.community.name;

        /*
        //-- Simulate a "receiveState" action to feed new title into post state
        let newstate = { content: {}, simulation: true };
        let content_key = this.props.author + '/' + this.props.permlink;
        newstate['content'][content_key] = { author_title: newTitle };
        this.props.pushState(newstate);
        */

        this.props.saveTitle(
            this.props.username,
            this.props.author,
            community,
            newTitle
        );
    };

    render() {
        const { loading, subscribers, community } = this.props;
        const subs = this.props.subscribers.map(s => {
            console.log('S is: ', s);
            return (
                <UserTitleEditor
                    title={s[2]}
                    username={s[0]}
                    community={community.title}
                    onSubmit={newTitle => {
                        console.log('NEW TITLE', newTitle);
                        return;
                    }}
                    key={s[0]}
                />
            );
        });
        // Map over community Subscribers list
        /*
      return (
                    <UserTitle
                        username={username}
                        community={community}
                        author={author}
                        permlink={permlink}
                        role={role}
                        title={title}
                        hideEdit={this.props.hideEditor}
                    />
                    )
                  */
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
