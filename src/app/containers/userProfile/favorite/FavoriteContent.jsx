import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import tt from 'counterpart';
import { Link } from 'react-router';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import PostsListFavorite from 'src/app/components/common/PostsList/PostsListFavorite';
import InfoBlock from 'src/app/components/common/InfoBlock';

const Loader = styled(LoadingIndicator)`
    margin-top: 30px;
`;

class FavoriteContent extends Component {
    render() {
        if (!process.env.BROWSER) {
            return <Loader type="circle" center size={40} />;
        }

        const { isOwner, list, isLoading, pageAccountName } = this.props;

        if (!isOwner) {
            return <InfoBlock>Избранное является приватными данными</InfoBlock>;
        }

        if (!list || isLoading) {
            return <Loader type="circle" center size={40} />;
        }

        if (!list.size) {
            return this._renderCallOut();
        }

        return <PostsListFavorite pageAccountName={pageAccountName} />;
    }

    _renderCallOut() {
        return (
            <InfoBlock>
                {tt('submit_a_story.you_hasnt_started_bloggin_yet')}
                <br />
                <br />
                <Link to="/submit">{tt('g.submit_a_story')}</Link>
                <br />
                <Link to="/welcome">{tt('submit_a_story.welcome_to_the_blockchain')}</Link>
            </InfoBlock>
        );
    }
}

export default connect((state, props) => {
    const pageAccountName = props.params.accountName.toLowerCase();
    const isOwner = state.user.getIn(['current', 'username']) === pageAccountName;

    const { isLoading, list } = state.data.favorite;

    return {
        isOwner,
        list,
        isLoading,
        pageAccountName,
    };
})(FavoriteContent);
