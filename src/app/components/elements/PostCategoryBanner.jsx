import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Userpic from 'app/components/elements/Userpic';
import { Link } from 'react-router';

import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as transactionActions from 'app/redux/TransactionReducer';

class PostCategoryBanner extends React.Component {
    componentWillMount() {
        const { communityName, getCommunity, community } = this.props;
        if (communityName && !community) getCommunity(communityName);
    }

    componentDidUpdate(prevProps) {
        const { communityName, getCommunity, community } = this.props;
        if (prevProps.communityName != communityName) {
            if (communityName && !community) getCommunity(communityName);
        }
    }

    render() {
        const { username, community, disabledCommunity } = this.props;
        const url = community ? '/trending/' + community.get('name') : null;
        const label = community ? (
            <Link to={url}>{community.get('title')}</Link>
        ) : (
            `@${username}'s blog`
        );
        const onClick = e => {
            e.preventDefault();
            this.props.onCancel();
        };
        const onUndo = e => {
            e.preventDefault();
            this.props.onUndo(disabledCommunity);
        };

        return (
            <div className="PostCategoryBanner column small-12 ">
                {community && (
                    <a href="#" onClick={onClick} style={{ float: 'right' }}>
                        [Post to blog]
                    </a>
                )}
                {disabledCommunity && (
                    <a href="#" onClick={onUndo} style={{ float: 'right' }}>
                        [Post to Community]
                    </a>
                )}
                <div className="postTo">
                    <small>
                        Posting to {community ? 'Community: ' : ''}
                        <span className="smallLabel">{label}</span>
                    </small>
                    {this.props.editorButton}
                </div>
                {/*
                <div className="categoryName">
                    <Userpic account={currentUser} />
                    <h3>{label}</h3>
                </div>
                */}
            </div>
        );
    }
}

PostCategoryBanner.propTypes = {
    username: PropTypes.string.isRequired,
    communityName: PropTypes.string,
    community: PropTypes.object, // TODO: define shape
    onCancel: PropTypes.func,
};

export default connect(
    (state, ownProps) => {
        const username = state.user.getIn(['current', 'username'], null);
        return {
            ...ownProps,
            community: state.global.getIn(
                ['community', ownProps.communityName],
                null
            ),
            username,
        };
    },
    dispatch => ({
        getCommunity: communityName => {
            return dispatch(fetchDataSagaActions.getCommunity(communityName));
        },
    })
)(PostCategoryBanner);
