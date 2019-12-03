import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as transactionActions from 'app/redux/TransactionReducer';
import ClaimBox from 'app/components/elements/ClaimBox';
import Callout from 'app/components/elements/Callout';

class NotificationsList extends React.Component {
    static propTypes = {
        notifications: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                type: PropTypes.string,
                score: PropTypes.number,
                date: PropTypes.date,
                msg: PropTypes.string,
                url: PropTypes.url,
            })
        ),
        isLastPage: PropTypes.bool,
        username: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
        markAsRead: PropTypes.func.isRequired,
    };

    static defaultProps = {
        notifications: [],
        isLastPage: false,
    };

    static defaultProps = {
        loading: false,
    };

    constructor() {
        super();
    }

    componentWillMount() {
        const { username, notifications, getAccountNotifications } = this.props;
        if (username && !notifications) {
            getAccountNotifications(username);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, getAccountNotifications, isLastPage } = this.props;
        if (prevProps.username !== username) {
            getAccountNotifications(username);
        }
    }

    onClickLoadMore = e => {
        e.preventDefault();
        const { username, notifications, getAccountNotifications } = this.props;
        const lastId = notifications.slice(-1)[0].id;
        getAccountNotifications(username, lastId);
    };

    onClickMarkAsRead = e => {
        e.preventDefault();
        const { username, markAsRead } = this.props;
        let dateNow = new Date();
        dateNow.setMinutes(dateNow.getMinutes() - dateNow.getTimezoneOffset());
        markAsRead(username, dateNow.toISOString().slice(0, 10));
    };

    render() {
        const {
            notifications,
            loading,
            isOwnAccount,
            accountName,
            isLastpage,
        } = this.props;

        const renderItem = item => (
            <div
                key={item.id}
                style={{
                    padding: '0.5em 1em',
                    background: 'rgba(225,255,225,' + item.score + '%)',
                }}
            >
                <span style={{ opacity: '0.5' }}>
                    {item.type}
                    {' / '}
                </span>
                <strong>
                    <a href={`/${item.url}`}>{item.msg}</a>
                </strong>
                <br />
                <small>
                    <TimeAgoWrapper date={item.date + 'Z'} />
                </small>
            </div>
        );

        return (
            <div className="">
                {isOwnAccount && <ClaimBox accountName={accountName} />}
                {!loading &&
                    notifications &&
                    notifications.length > 0 && (
                        <center>
                            <br />
                            <a href="#" onClick={this.onClickMarkAsRead}>
                                <strong>Mark as read</strong>
                            </a>
                        </center>
                    )}
                {notifications &&
                    notifications.length > 0 && (
                        <div style={{ lineHeight: '1rem' }}>
                            {notifications.map(item => renderItem(item))}
                        </div>
                    )}
                {!notifications &&
                    !loading && (
                        <Callout>
                            Welcome! You don't have any notifications yet.
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
                {!loading &&
                    notifications && (
                        <center>
                            <br />
                            <a href="#" onClick={this.onClickMarkAsRead}>
                                <strong>Mark as read</strong>
                            </a>
                        </center>
                    )}
                {!loading &&
                    notifications &&
                    !isLastpage && (
                        <center>
                            <br />
                            <a href="#" onClick={this.onClickLoadMore}>
                                <strong>Load more...</strong>
                            </a>
                        </center>
                    )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const accountName = props.username;
        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == accountName;
        return {
            ...props,
            isOwnAccount,
            accountName,
        };
    },
    dispatch => ({
        getAccountNotifications: (username, last_id) => {
            const query = {
                account: username,
                limit: 50,
            };
            if (last_id) {
                query.last_id = last_id;
            }
            return dispatch(
                fetchDataSagaActions.getAccountNotifications(query)
            );
        },
        markAsRead: (username, timeNow) => {
            const ops = ['setLastRead', { date: timeNow }];
            debugger;
            return dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'community',
                        required_posting_auths: [username],
                        json: JSON.stringify(ops),
                    },
                    successCallback: () => {},
                    errorCallback: () => {},
                })
            );
        },
    })
)(NotificationsList);
