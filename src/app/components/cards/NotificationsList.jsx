import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as globalActions from 'app/redux/GlobalReducer';
import ClaimBox from 'app/components/elements/ClaimBox';
import Callout from 'app/components/elements/Callout';
import Icon from 'app/components/elements/Icon';

const notificationsIcons = type => {
    switch (type) {
        case 'reply':
            return (
                <Icon
                    className="notification__icon notification__reply"
                    name="reply"
                />
            );
        case 'follow':
            return (
                <Icon
                    className="notification__icon notification__follow"
                    name="voters"
                />
            );
        case 'set_label':
            return (
                <Icon
                    className="notification__icon notification__label"
                    name="quill"
                />
            );
        case 'vote':
            return (
                <Icon
                    className="notification__icon notification__vote"
                    name="voter"
                />
            );
        case 'error':
            return (
                <Icon
                    className="notification__icon notification__error"
                    name="close"
                />
            );
        case 'reblog':
            return (
                <Icon
                    className="notification__icon notification__reblog"
                    name="reblog"
                />
            );
        default:
            return <Icon name="chain" />;
    }
};

const notificationsTypes = type => {
    switch (type) {
        case 'reply':
            return <span className="notification__type">{type}</span>;
        case 'follow':
            return <span className="notification__type">{type}</span>;
        case 'set_label':
            return <span className="notification__type">{type}</span>;
        case 'vote':
            return <span className="notification__type">{type}</span>;
        case 'error':
            return <span className="notification__type">{type}</span>;
        case 'reblog':
            return <span className="notification__type">{type}</span>;
        default:
            return <span className="notification__type">{type}</span>;
    }
};

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
        unreadNotifications: PropTypes.number,
        notificationActionPending: PropTypes.bool,
        lastRead: PropTypes.string.isRequired,
    };

    static defaultProps = {
        notifications: [],
        unreadNotifications: 0,
        notificationActionPending: false,
        isLastPage: false,
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
        markAsRead(username, new Date().toISOString().slice(0, 19));
    };

    render() {
        const {
            notifications,
            unreadNotifications,
            loading,
            isOwnAccount,
            accountName,
            isLastpage,
            notificationActionPending,
            lastRead,
        } = this.props;

        const renderItem = item => {
            const unRead =
                Date.parse(`${lastRead}Z`) <= Date.parse(`${item.date}Z`);
            return (
                <div
                    key={item.id}
                    className="notification__item flex-body"
                    style={{
                        background: 'rgba(225,255,225,' + item.score + '%)',
                    }}
                >
                    <div className="flex-row">
                        <div className="notification__icon">
                            {notificationsIcons(item.type)}
                        </div>
                    </div>
                    {unRead && (
                        <span className="notification__unread">&bull;</span>
                    )}
                    <div className="flex-column">
                        <div className="notification__message">
                            <a href={`/${item.url}`}>{item.msg}</a>
                        </div>
                        <div className="flex-row">
                            <div className="notification__type">
                                {notificationsTypes(item.type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper date={item.date + 'Z'} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="">
                {isOwnAccount && <ClaimBox accountName={accountName} />}
                {!loading &&
                    notifications &&
                    notifications.length > 0 &&
                    unreadNotifications !== 0 &&
                    !notificationActionPending && (
                        <center>
                            <br />
                            <a href="#" onClick={this.onClickMarkAsRead}>
                                <strong>Mark as read</strong>
                            </a>
                        </center>
                    )}
                {(notificationActionPending || !process.env.BROWSER) && (
                    <center>
                        <LoadingIndicator type="circle" />
                    </center>
                )}

                {notifications &&
                    notifications.length > 0 && (
                        <div style={{ lineHeight: '1rem' }}>
                            {notifications.map(item => renderItem(item))}
                        </div>
                    )}
                {!notifications &&
                    !notificationActionPending &&
                    !loading &&
                    process.env.BROWSER && (
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
        const unreadNotifications = state.global.getIn(
            ['notifications', accountName, 'unreadNotifications', 'unread'],
            0
        );
        const lastRead = state.global.getIn(
            ['notifications', accountName, 'unreadNotifications', 'lastread'],
            ''
        );
        return {
            ...props,
            isOwnAccount,
            accountName,
            unreadNotifications,
            notificationActionPending: state.global.getIn([
                'notifications',
                'loading',
            ]),
            lastRead,
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
            const successCallback = (user, time) => {
                setTimeout(() => {
                    dispatch(
                        globalActions.receiveUnreadNotifications({
                            name: user,
                            unreadNotifications: {
                                lastread: time,
                                unread: 0,
                            },
                        })
                    );
                    dispatch(globalActions.notificationsLoading(false));
                }, 6000);
            };

            return dispatch(
                fetchDataSagaActions.markNotificationsAsRead({
                    username,
                    timeNow,
                    successCallback,
                })
            );
        },
    })
)(NotificationsList);
