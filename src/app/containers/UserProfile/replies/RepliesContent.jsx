import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Callout from 'app/components/elements/Callout';

import PostsList from 'src/app/components/common/PostsList';

class RepliesContent extends Component {
    render() {
        const { currentAccount } = this.props;

        const posts = currentAccount.get('recent_replies');

        if (!posts) {
            return (
                <LoadingIndicator type="circle" center size={40}/>
            );
        }

        if (posts && !posts.size) {
            return (
                <Callout>
                    {tt('user_profile.user_hasnt_had_any_replies_yet', {
                        name: currentAccount.get('name'),
                    })}
                </Callout>
            );
        }

        return (
            <PostsList
                key={currentAccount.get('name')}
                account={currentAccount.get('name')}
                posts={posts}
                category="recent_replies"
                showSpam
            />
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const route = ownProps.routes.slice(-1)[0].path;
        const accountName = ownProps.params.accountName.toLowerCase();

        const currentAccount = state.global.getIn(['accounts', accountName]);

        return {
            accountName,
            currentAccount,
        };
    },
    // mapDispatchToProps
    dispatch => ({})
)(RepliesContent);
