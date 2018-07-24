import React, { Component } from 'react';
import { connect } from 'react-redux';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Callout from 'app/components/elements/Callout';

import PostsList from 'src/app/components/common/PostsList';

class CommentsContent extends Component {
    render() {
        const { currentAccount } = this.props;

        const posts = currentAccount.get('posts') || currentAccount.get('comments');

        if (!posts) {
            return (
                <LoadingIndicator type="circle" center size={40} />
            );
        }

        if (!posts.size) {
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
                account={currentAccount.get('name')}
                category="comments"
                allowInlineEdit
                //order="by_author"
                //showSpam TODO
            />
        );
    }
}

export default connect((state, props) => {
    const accountName = props.params.accountName.toLowerCase();
    const currentAccount = state.global.getIn(['accounts', accountName]);

    return {
        currentAccount,
    };
})(CommentsContent);
