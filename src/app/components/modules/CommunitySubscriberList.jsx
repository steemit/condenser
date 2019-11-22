import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as communityActions from 'app/redux/CommunityReducer';
import UserTitle from 'app/components/elements/UserTitle';

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

    render() {
        const { loading, subscribers, community } = this.props;
        console.log('SUBS', subscribers);

        const subs = this.props.subscribers.map(s => {
            return <div>{s[0]}</div>;
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
        };
    }
)(CommunitySubscriberList);

export default ConnectedCommunitySubscriberList;
