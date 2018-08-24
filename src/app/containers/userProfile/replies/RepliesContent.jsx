import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import InfoBlock from 'src/app/components/common/InfoBlock';
import PostsListBlog from 'src/app/components/common/PostsList/PostsListBlog';
import EmptyBlock, { EmptySubText } from 'src/app/components/common/EmptyBlock';

const Loader = styled(LoadingIndicator)`
    margin-top: 30px;
`;

class RepliesContent extends Component {
    render() {
        const { pageAccount, isOwner } = this.props;

        const posts = pageAccount.get('recent_replies');

        if (!posts) {
            return <Loader type="circle" center size={40} />;
        }

        if (!posts.size) {
            return (
                <InfoBlock>
                    <EmptyBlock>
                        Тут пока пусто
                        <EmptySubText>
                            {isOwner
                                ? 'Начни писать посты и получать комментарии от пользователей.'
                                : 'Пользователь пока не получил комментариев. Напиши свой комментарий.'}
                        </EmptySubText>
                    </EmptyBlock>
                </InfoBlock>
            );
        }

        return (
            <PostsListBlog
                pageAccountName={pageAccount.get('name')}
                posts={posts}
                category="recent_replies"
                allowInlineReply={isOwner}
                //showSpam
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
        isOwner,
    };
})(RepliesContent);
