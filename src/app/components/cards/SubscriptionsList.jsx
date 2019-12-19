import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as globalActions from 'app/redux/GlobalReducer';
import ClaimBox from 'app/components/elements/ClaimBox';
import Callout from 'app/components/elements/Callout';

class SubscriptionsList extends React.Component {
    static propTypes = {
        username: PropTypes.string.isRequired,
        subscriptions: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
            })
        ),
        loading: PropTypes.bool,
    };

    static defaultProps = {
        subscriptions: [],
        loading: false,
    };

    constructor() {
        super();
    }

    componentWillMount() {
        const { username, getAccountSubscriptions } = this.props;
        if (username) {
            getAccountSubscriptions(username);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, getAccountSubscriptions } = this.props;
        if (prevProps.username !== username) {
            getAccountSubscriptions(username);
        }
    }

    render() {
        const { subscriptions, loading } = this.props;

        const renderItem = item => {
            return <div>hello</div>;
        };

        return (
            <div className="">
                {subscriptions &&
                    subscriptions.length > 0 && (
                        <div style={{ lineHeight: '1rem' }}>
                            {subscriptions.map(item => renderItem(item))}
                        </div>
                    )}
                {subscriptions.length === 0 &&
                    !loading && (
                        <Callout>
                            Welcome! You don't have any subscriptions yet.
                        </Callout>
                    )}

                {loading && (
                    <center>
                        <LoadingIndicator
                            style={{ marginBottom: '2rem' }}
                            type="circle"
                        />
                    </center>
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == props.username;
        const loading = state.global.getIn(['subscriptions', 'loading']);
        return {
            ...props,
            isOwnAccount,
            loading,
        };
    },
    dispatch => ({
        getAccountSubscriptions: username => {
            const query = {
                account: username,
            };
            return dispatch(fetchDataSagaActions.getSubscriptions(query));
        },
    })
)(SubscriptionsList);
