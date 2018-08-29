import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import tt from 'counterpart';
import { Link } from 'react-router';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import PostsListBlog from 'src/app/components/common/PostsList/PostsListBlog';
import InfoBlock from 'src/app/components/common/InfoBlock';
import EmptyBlock, { EmptySubText } from 'src/app/components/common/EmptyBlock';

const Loader = styled(LoadingIndicator)`
    margin-top: 30px;
`;

class BlogContent extends Component {
    render() {
        const { pageAccount } = this.props;

        const posts = pageAccount.get('blog');

        if (!posts) {
            return <Loader type="circle" center size={40} />;
        }

        if (!posts.size) {
            return this._renderCallOut();
        }

        return (
            <PostsListBlog
                pageAccountName={pageAccount.get('name')}
                order="by_author"
                category="blog"
                showPinButton
                //showSpam TODO
            />
        );
    }

    _renderCallOut() {
        const { isOwner } = this.props;

        return (
            <InfoBlock>
                <EmptyBlock>
                    Тут пока пусто
                    <EmptySubText>
                        {isOwner ? (
                            <Fragment>
                                Можешь написать свой первый пост с тегами{' '}
                                <Link to="/submit">#голос</Link>{' '}
                                <Link to="/submit">#знакомство</Link>.
                            </Fragment>
                        ) : (
                            'Пользователь еще не начал писать посты.'
                        )}
                    </EmptySubText>
                </EmptyBlock>
            </InfoBlock>
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
})(BlogContent);
