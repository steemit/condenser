import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Callout from 'app/components/elements/Callout';

import PostsList from 'src/app/components/common/PostsList';

class BlogContent extends Component {
    render() {
        const { currentAccount, fetching, isOwner } = this.props;

        const posts = currentAccount.get('blog');
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
                    {isOwner ? (
                        <div>
                            {tt('submit_a_story.you_hasnt_started_bloggin_yet')}
                            <br />
                            <br />
                            <Link to="/submit.html">{tt('g.submit_a_story')}</Link>
                            <br />
                            <a href="/welcome">{tt('submit_a_story.welcome_to_the_blockchain')}</a>
                        </div>
                    ) : (
                        tt('user_profile.user_hasnt_started_bloggin_yet', {
                            name: currentAccount.get('name'),
                        })
                    )}
                </Callout>
            );
        }

        return (
            <PostsList
                key={currentAccount.get('name')}
                account={currentAccount.get('name')}
                posts={posts}
                loading={fetching}
                order="by_author"
                category="blog"
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

        const isOwner = state.user.getIn(['current', 'username'], null) === accountName;

        return {
            accountName,
            currentAccount,

            fetching,
            isOwner,
        };
    },
    // mapDispatchToProps
    dispatch => ({})
)(BlogContent);
