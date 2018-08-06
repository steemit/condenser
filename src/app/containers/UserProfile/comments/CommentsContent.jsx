import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import tt from 'counterpart';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import PostsList from 'src/app/components/common/PostsList';
import InfoBlock from 'src/app/components/common/InfoBlock';

const Loader = styled(LoadingIndicator)`
    margin-top: 30px;
`;

class CommentsContent extends Component {
    render() {
        const { pageAccount, isOwner } = this.props;

        const posts = pageAccount.get('posts') || pageAccount.get('comments');

        if (!posts) {
            return <Loader type="circle" center size={40} />;
        }

        const pageUserName = pageAccount.get('name');

        if (!posts.size) {
            return (
                <InfoBlock>
                    Похоже, что {pageUserName} ещё не оставил ни одного комментария!
                </InfoBlock>
            );
        }

        return (
            <PostsList
                pageAccountName={pageUserName}
                category="comments"
                allowInlineReply={!isOwner}
                //order="by_author"
                //showSpam TODO
            />
        );
    }
}

export default connect((state, props) => {
    const pageAccountName = props.params.accountName.toLowerCase();
    const pageAccount = state.global.getIn(['accounts', pageAccountName]);
    const isOwner = state.user.getIn(['current', 'username']) === pageAccountName;

    return {
        pageAccount,
        isOwner
    };
})(CommentsContent);
