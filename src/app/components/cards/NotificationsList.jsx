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
import tt from 'counterpart';
import classNames from 'classnames';

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

let notificationFilter = 'all';

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
    };

    notificationFilterToTypes = {
        replies: ['reply_comment', 'reply'],
        follows: ['follow'],
        upvotes: ['vote'],
        resteems: ['reblog'],
        mentions: ['mention'],
    };

    constructor() {
        super();
    }

    componentWillMount() {
        const { username, getAccountNotifications } = this.props;
        if (username) {
            getAccountNotifications(username);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, getAccountNotifications } = this.props;
        if (prevProps.username !== username) {
            getAccountNotifications(username);
        }
        this.applyFilter();
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

    applyFilter = () => {
        const notificationElements = document.getElementsByClassName(
            'notification__item'
        );

        for (let ni = 0; ni < notificationElements.length; ni += 1) {
            const notificationElement = notificationElements[ni];

            if (notificationFilter === 'all') {
                notificationElement.classList.remove('hide');
            } else if (
                this.notificationFilterToTypes.hasOwnProperty(
                    notificationFilter
                )
            ) {
                const notificationTypes = this.notificationFilterToTypes[
                    notificationFilter
                ];
                let matchType = false;

                for (let ti = 0; ti < notificationTypes.length; ti += 1) {
                    const notificationType = notificationTypes[ti];
                    if (
                        notificationElement.classList.contains(
                            `notification__${notificationType}`
                        )
                    ) {
                        matchType = true;
                    }
                }

                if (matchType === false) {
                    notificationElement.classList.add('hide');
                } else {
                    notificationElement.classList.remove('hide');
                }
            }
        }
    };

    onClickFilter = e => {
        e.preventDefault();
        const target = e.target;

        const filterElements = document.getElementsByClassName(
            'notification__filter'
        );

        // reset
        for (let fi = 0; fi < filterElements.length; fi += 1) {
            const filterElement = filterElements[fi];
            filterElement.classList.remove('selected');
        }

        target.classList.add('selected');
        notificationFilter = target.dataset.type;
        this.applyFilter();

        target.blur();
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
                    className={`notification__item flex-body notification__${
                        item.type
                    }`}
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
                {notifications &&
                    notifications.length > 0 &&
                    !notificationActionPending && (
                        <center>
                            <br />
                            <div className="notification__filter_select">
                                <a
                                    className={classNames(
                                        'notification__filter',
                                        {
                                            selected:
                                                notificationFilter === 'all',
                                        }
                                    )}
                                    role="link"
                                    data-type="all"
                                    tabIndex={0}
                                    onClick={this.onClickFilter}
                                >
                                    {tt('notificationslist_jsx.all')}
                                </a>
                                <a
                                    className={classNames(
                                        'notification__filter',
                                        {
                                            selected:
                                                notificationFilter ===
                                                'replies',
                                        }
                                    )}
                                    role="link"
                                    data-type="replies"
                                    tabIndex={0}
                                    onClick={this.onClickFilter}
                                >
                                    {tt('notificationslist_jsx.replies')}
                                </a>
                                <a
                                    className={classNames(
                                        'notification__filter',
                                        {
                                            selected:
                                                notificationFilter ===
                                                'mentions',
                                        }
                                    )}
                                    role="link"
                                    data-type="mentions"
                                    tabIndex={0}
                                    onClick={this.onClickFilter}
                                >
                                    {tt('notificationslist_jsx.mentions')}
                                </a>
                                <a
                                    className={classNames(
                                        'notification__filter',
                                        {
                                            selected:
                                                notificationFilter ===
                                                'follows',
                                        }
                                    )}
                                    role="link"
                                    data-type="follows"
                                    tabIndex={0}
                                    onClick={this.onClickFilter}
                                >
                                    {tt('notificationslist_jsx.follows')}
                                </a>
                                <a
                                    className={classNames(
                                        'notification__filter',
                                        {
                                            selected:
                                                notificationFilter ===
                                                'upvotes',
                                        }
                                    )}
                                    role="link"
                                    data-type="upvotes"
                                    tabIndex={0}
                                    onClick={this.onClickFilter}
                                >
                                    {tt('notificationslist_jsx.upvotes')}
                                </a>
                                <a
                                    className={classNames(
                                        'notification__filter',
                                        {
                                            selected:
                                                notificationFilter ===
                                                'resteems',
                                        }
                                    )}
                                    role="link"
                                    data-type="resteems"
                                    tabIndex={0}
                                    onClick={this.onClickFilter}
                                >
                                    {tt('notificationslist_jsx.resteems')}
                                </a>
                            </div>
                        </center>
                    )}
                {notifications &&
                    notifications.length > 0 &&
                    unreadNotifications !== 0 &&
                    !notificationActionPending && (
                        <center>
                            <br />
                            <a href="#" onClick={this.onClickMarkAsRead}>
                                <strong>
                                    {tt(
                                        'notificationslist_jsx.mark_all_as_read'
                                    )}
                                </strong>
                            </a>
                            <br />
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
                    process.env.BROWSER && (
                        <Callout>
                            Welcome! You don't have any notifications yet.
                        </Callout>
                    )}

                {!notificationActionPending &&
                    notifications &&
                    !isLastPage && (
                        <center>
                            <br />
                            <a
                                href="#"
                                onClick={this.onClickLoadMore}
                                className="LoadMore"
                            >
                                <strong>
                                    {tt('notificationslist_jsx.load_more')}
                                </strong>
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
        const notifications = state.global
            .getIn(['notifications', accountName, 'notifications'], List())
            .toJS();
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
