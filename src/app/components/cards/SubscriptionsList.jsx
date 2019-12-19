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
        isOwnAccount: PropTypes.bool.isRequired,
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
        const { username, subscriptions, getAccountSubscriptions } = this.props;
        console.log('!!!%%%%!!!');
        if (username) {
            console.log('HHYYUUINNININ');
            getAccountSubscriptions(username);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, getAccountSubscriptions, isLastPage } = this.props;
        if (prevProps.username !== username) {
            getAccountSubscriptions(username);
        }
    }

    onClickLoadMore = e => {
        e.preventDefault();
        const { username, subscriptions, getAccountSubscriptions } = this.props;
        const lastId = subscriptions.slice(-1)[0].id;
        getAccountSubscriptions(username, lastId);
    };

    onClickMarkAsRead = e => {
        e.preventDefault();
        const { username, markAsRead } = this.props;
        markAsRead(username, new Date().toISOString().slice(0, 19));
    };

    render() {
        const {
            subscriptions,
            unreadSubscriptions,
            loading,
            isOwnAccount,
            accountName,
            isLastpage,
            subscriptionActionPending,
            lastRead,
        } = this.props;
        debugger;

        const renderItem = item => {
            return <div>hello</div>;
        };

        return (
            <div className="">
                {subscriptionActionPending && (
                    <center>
                        <LoadingIndicator type="circle" />
                    </center>
                )}
                {subscriptions &&
                    subscriptions.length > 0 && (
                        <div style={{ lineHeight: '1rem' }}>
                            {subscriptions.map(item => renderItem(item))}
                        </div>
                    )}
                {!subscriptions &&
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
                <h1>hi</h1>
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == props.username;
        const subscriptions = state.global.get('subscriptions');
        const loading = state.global.getIn(['subscriptions', 'loading']);
        console.log(state.global.toJS());
        return {
            ...props,
            isOwnAccount,
            subscriptions,
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
