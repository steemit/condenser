import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import tt from 'counterpart';
import { Link } from 'react-router';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import PostsList from 'src/app/components/common/PostsList';
import InfoBlock from 'src/app/components/common/InfoBlock';

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
            <PostsList
                pageAccountName={pageAccount.get('name')}
                order="by_author"
                category="blog"
                //showSpam TODO
            />
        );
    }

    _renderCallOut() {
        const { isOwner, pageAccount } = this.props;

        return (
            <InfoBlock>
                {isOwner ? (
                    <Fragment>
                        {tt('submit_a_story.you_hasnt_started_bloggin_yet')}
                        <br />
                        <br />
                        <Link to="/submit">{tt('g.submit_a_story')}</Link>
                        <br />
                        <Link to="/welcome">{tt('submit_a_story.welcome_to_the_blockchain')}</Link>
                    </Fragment>
                ) : (
                    tt('user_profile.user_hasnt_started_bloggin_yet', {
                        name: pageAccount.get('name'),
                    })
                )}
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
