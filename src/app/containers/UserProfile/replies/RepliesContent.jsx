import React, { Component } from 'react';
import { connect } from 'react-redux';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import InfoBlock from 'src/app/components/common/InfoBlock';

import PostsList from 'src/app/components/common/PostsList';
import styled from 'styled-components';

const Loader = styled(LoadingIndicator)`
    margin-top: 30px;
`;

class RepliesContent extends Component {
    render() {
        const { currentAccount } = this.props;

        const posts = currentAccount.get('recent_replies');

        if (!posts) {
            return <Loader type="circle" center size={40} />;
        }

        if (!posts.size) {
            return (
                <InfoBlock>
                    {tt('user_profile.user_hasnt_had_any_replies_yet', {
                        name: currentAccount.get('name'),
                    })}
                </InfoBlock>
            );
        }

        return (
            <PostsList
                account={currentAccount.get('name')}
                posts={posts}
                category="recent_replies"
                allowInlineReply
                //showSpam
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
})(RepliesContent);
