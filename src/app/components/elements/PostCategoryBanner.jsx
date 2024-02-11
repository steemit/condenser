import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import { browserHistory } from 'react-router';
import tt from 'counterpart';

class PostCategoryBanner extends React.Component {
    componentWillMount() {
        const {
            communityName,
            getCommunity,
            community,
            username,
            getAccountSubscriptions,
        } = this.props;
        if (communityName && !community) getCommunity(communityName);

        if (username) {
            getAccountSubscriptions(username);
        }

        if (community && !selectedCommunity) {
            this.setState({
                selectedCommunity: {
                    name: community.get('name'),
                    title: community.get('title'),
                },
            });
        }
    }

    componentDidUpdate(prevProps) {
        const {
            username,
            communityName,
            getCommunity,
            disabledCommunity,
            subscriptions,
            community,
            getAccountSubscriptions,
        } = this.props;

        if (prevProps.communityName != communityName) {
            if (communityName && !community) getCommunity(communityName);
        }

        if (
            prevProps.username !== username &&
            prevProps.subscriptions !== subscriptions
        ) {
            getAccountSubscriptions(username);
        }

        if (community && !disabledCommunity) {
            this.setState({
                selectedCommunity: {
                    name: community.get('name'),
                    title: community.get('title'),
                },
            });
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            selectedCommunity: undefined,
        };
    }

    handleSelectCommunity = event => {
        const newCommunity = event.target.value;
        this.setState({
            selectedCommunity: newCommunity,
        });

        this.props.onCommunityChange(JSON.parse(newCommunity).name);
    };

    render() {
        const { selectedCommunity } = this.state;
        const {
            username,
            community,
            disabledCommunity,
            subscriptions,
            posting,
        } = this.props;
        const url = selectedCommunity
            ? '/trending/' + selectedCommunity.name
            : null;
        const label =
            selectedCommunity && !disabledCommunity ? (
                <Link to={url}>{selectedCommunity.title}</Link>
            ) : (
                <span style={{ color: '#A6B2BA' }}>{`@${
                    username
                }'s blog`}</span>
            );
        const onClick = e => {
            e.preventDefault();
            this.props.onCancel();
        };
        const onUndo = e => {
            e.preventDefault();

            // if the category not exist in url
            if (!community && !selectedCommunity) {
                // getting the very first subsubcribed community from the subsucriptions
                const firstCommunity =
                    subscriptions && subscriptions.length > 0
                        ? subscriptions[0]
                        : '';

                if (firstCommunity) {
                    const [name, title] = firstCommunity;

                    // updating the url with the first community name
                    browserHistory.replace(`/submit.html?category=${name}`);
                    this.setState({ selectedCommunity: { name, title } });

                    // pusging the community name to the tags
                    this.props.onUndo(name);
                }
            } else {
                // category exist in url
                this.props.onUndo(disabledCommunity);
            }
        };

        return (
            <div className="PostCategoryBanner column small-12 ">
                {selectedCommunity &&
                    !disabledCommunity && (
                        <a
                            href="#"
                            onClick={onClick}
                            style={{ float: 'right' }}
                        >
                            [Post to blog]
                        </a>
                    )}
                {(disabledCommunity || !selectedCommunity) &&
                    (subscriptions.length <= 0 ? (
                        <Link to="/communities" style={{ float: 'right' }}>
                            [{tt('g.show_more_topics')}]
                        </Link>
                    ) : (
                        <a href="#" onClick={onUndo} style={{ float: 'right' }}>
                            [Post to Community]
                        </a>
                    ))}
                <div className="postTo">
                    <small>
                        Posting to{' '}
                        {selectedCommunity && !disabledCommunity
                            ? 'Community: '
                            : ''}
                        <span className="smallLabel">{label}</span>
                    </small>
                </div>

                <div className="categoryName">
                    <select
                        value={
                            selectedCommunity
                                ? JSON.stringify(selectedCommunity)
                                : ''
                        }
                        disabled={disabledCommunity || !community}
                        onChange={this.handleSelectCommunity}
                    >
                        <option value="" disabled selected>
                            Select community
                        </option>

                        {subscriptions &&
                            subscriptions.length > 0 &&
                            subscriptions.map(item => {
                                const [name, title] = item;
                                return (
                                    <option
                                        key={name}
                                        value={JSON.stringify({
                                            name: name,
                                            title: title,
                                        })}
                                    >
                                        {title || name}
                                    </option>
                                );
                            })}
                    </select>
                </div>
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
        const loading = state.global.getIn(['subscriptions', 'loading']);
        const subscriptions = state.global.getIn([
            'subscriptions',
            ownProps.username,
        ]);

        return {
            ...ownProps,
            community: state.global.getIn(
                ['community', ownProps.communityName],
                null
            ),
            username,
            loading,
            subscriptions: subscriptions ? subscriptions.toJS() : [],
        };
    },
    dispatch => ({
        getCommunity: communityName => {
            return dispatch(fetchDataSagaActions.getCommunity(communityName));
        },
        getAccountSubscriptions: username =>
            dispatch(fetchDataSagaActions.getSubscriptions(username)),
    })
)(PostCategoryBanner);
