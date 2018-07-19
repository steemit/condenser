import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Callout from 'app/components/elements/Callout';

import PostsList from 'src/app/components/common/PostsList';

class CommentsContent extends Component {
    render() {
        const { currentAccount, fetching } = this.props;

        const posts = currentAccount.get('posts') || currentAccount.get('comments');
        if (fetching || !posts) {
            return (
                <center>
                    <LoadingIndicator type="circle" />
                </center>
            );
        }

        if (posts && !posts.size) {
            return (
                <Callout>
                    {tt('user_profile.user_hasnt_made_any_posts_yet', {
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
                loading={fetching}
                category="comments"
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

        const fetching =
            state.global.getIn(['status', route, 'by_author'], {}).fetching ||
            state.app.get('loading');

        return {
            accountName,
            currentAccount,

            fetching,
        };
    },
    // mapDispatchToProps
    dispatch => ({})
)(CommentsContent);
