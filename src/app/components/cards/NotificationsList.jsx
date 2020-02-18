import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as globalActions from 'app/redux/GlobalReducer';
import ClaimBox from 'app/components/elements/ClaimBox';
import Callout from 'app/components/elements/Callout';
import Icon from 'app/components/elements/Icon';
import Userpic from 'app/components/elements/Userpic';

const notificationsIcon = type => {
    const types = {
        reply: 'chatbox',
        reply_post: 'chatbox',
        reply_comment: 'chatbox',
        follow: 'voters',
        set_label: 'pencil2',
        set_role: 'pencil2',
        vote: 'chevron-up-circle',
        error: 'cog',
        reblog: 'reblog',
        mention: 'chatboxes',
    };

    let icon = 'chain';
    if (type in types) {
        icon = types[type];
    } else {
        console.error('no icon for type: ', type);
    }

    return <Icon size="0_8x" name={icon} />;
};

const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {' '}
            {parts.map((part, i) => (
                <span
                    key={i}
                    style={
                        part.toLowerCase() === highlight.toLowerCase()
                            ? { fontWeight: 'bold' }
                            : {}
                    }
                >
                    {part}
                </span>
            ))}{' '}
        </span>
    );
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
        username: PropTypes.string,
        markAsRead: PropTypes.func.isRequired,
        unreadNotifications: PropTypes.number,
        notificationActionPending: PropTypes.bool,
        lastRead: PropTypes.string.isRequired,
        postNotifications: PropTypes.bool.isRequired,
        postNotificationsLoading: PropTypes.bool,
        isPostNotificationsLastPage: PropTypes.bool,
        fetchPostNotifications: PropTypes.func.isRequired,
    };

    static defaultProps = {
        username: false,
        notifications: [],
        unreadNotifications: 0,
        notificationActionPending: false,
        isLastPage: false,
        postNotificationsLoading: false,
        isPostNotificationsLastPage: false,
    };

    constructor() {
        super();
    }

    componentWillMount() {
        const {
            username,
            getAccountNotifications,
            postNotifications,
            author,
            permlink,
            fetchPostNotifications,
        } = this.props;
        if (username) {
            getAccountNotifications(username);
        }
        if (postNotifications) {
            fetchPostNotifications(author, permlink);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, getAccountNotifications } = this.props;
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

    onClickLoadMorePostNotifications = e => {
        e.preventDefault();
        const {
            author,
            permlink,
            fetchPostNotifications,
            notifications,
        } = this.props;
        const lastId = notifications.slice(-1)[0].id;
        fetchPostNotifications(author, permlink, lastId);
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
            isOwnAccount,
            accountName,
            isLastPage,
            notificationActionPending,
            lastRead,
            postNotifications,
            postNotificationsLoading,
            isPostNotificationsLastPage,
        } = this.props;
        const renderItem = item => {
            const unRead =
                Date.parse(`${lastRead}Z`) <= Date.parse(`${item.date}Z`);
            const usernamePattern = /\B@[a-z0-9\.-]+/gi;
            const mentions = item.msg.match(usernamePattern);
            const participants = mentions
                ? mentions.map(m => (
                      <a href={'/' + m}>
                          <Userpic account={m.substring(1)} />
                      </a>
                  ))
                : null;
            return (
                <div
                    key={item.id}
                    className="notification__item flex-body"
                    style={{
                        background: 'rgba(225,255,225,' + item.score + '%)',
                    }}
                >
                    <div className="flex-row">
                        {mentions && participants && participants[0]}
                    </div>
                    <div className="flex-column">
                        <div className="notification__message">
                            <a href={`/${item.url}`}>
                                {highlightText(
                                    item.msg,
                                    mentions ? mentions[0] : null
                                )}
                            </a>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(item.type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper date={item.date + 'Z'} />
                            </div>
                        </div>
                    </div>
                    {unRead && (
                        <span className="notification__unread">&bull;</span>
                    )}
                </div>
            );
        };

        return (
            <div className="">
                {isOwnAccount && <ClaimBox accountName={accountName} />}
                {!postNotifications &&
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

                {postNotifications &&
                    notifications.length === 0 &&
                    !postNotificationsLoading && (
                        <Callout>No activity on this post.</Callout>
                    )}
                {postNotifications &&
                    postNotificationsLoading && (
                        <center>
                            <LoadingIndicator
                                style={{ marginBottom: '2rem' }}
                                type="circle"
                            />
                        </center>
                    )}
                {postNotifications &&
                    !isPostNotificationsLastPage &&
                    !postNotificationsLoading &&
                    notifications && (
                        <center>
                            <br />
                            <a
                                href="#"
                                onClick={this.onClickLoadMorePostNotifications}
                            >
                                <strong>Load more...</strong>
                            </a>
                        </center>
                    )}

                {notifications &&
                    notifications.length > 0 && (
                        <div style={{ lineHeight: '1rem' }}>
                            {notifications.map(item => renderItem(item))}
                        </div>
                    )}
                {!postNotifications &&
                    !notifications &&
                    !notificationActionPending &&
                    process.env.BROWSER && (
                        <Callout>
                            Welcome! You don't have any notifications yet.
                        </Callout>
                    )}

                {!postNotifications &&
                    !notificationActionPending &&
                    notifications &&
                    !isLastPage && (
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
        const { postNotifications, author, permlink } = props;
        const accountName = props.username;
        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == accountName;
        const xPostNotifications = state.global.getIn([
            'content',
            `${author}/${permlink}`,
            'post_notifications',
        ])
            ? state.global
                  .getIn([
                      'content',
                      `${author}/${permlink}`,
                      'post_notifications',
                  ])
                  .toJS()
            : [];

        const notifications = !postNotifications
            ? state.global
                  .getIn(
                      ['notifications', accountName, 'notifications'],
                      List()
                  )
                  .toJS()
            : xPostNotifications;

        const unreadNotifications = state.global.getIn(
            ['notifications', accountName, 'unreadNotifications', 'unread'],
            0
        );
        const lastRead = state.global.getIn(
            ['notifications', accountName, 'unreadNotifications', 'lastread'],
            ''
        );
        const isNotificationsLastPage = state.global.getIn(
            ['notifications', accountName, 'isLastPage'],
            null
        );

        const postNotificationsLoading = postNotifications
            ? state.global.getIn([
                  'content',
                  `${author}/${permlink}`,
                  'post_notifications_loading',
              ])
            : false;

        const isPostNotificationsLastPage = state.global.getIn([
            'content',
            `${author}/${permlink}`,
            'allNotificationsReceived',
        ]);

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
            notifications,
            isLastPage: isNotificationsLastPage,
            postNotificationsLoading,
            isPostNotificationsLastPage,
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
        fetchPostNotifications: (author, permlink, last_id) => {
            const query = {
                author,
                permlink,
            };
            if (last_id) {
                query.last_id = last_id;
            }
            dispatch(fetchDataSagaActions.getPostNotifications(query));
        },
    })
)(NotificationsList);
