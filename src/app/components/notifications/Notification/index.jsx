import React from 'react';
import { connect } from 'react-redux';
import * as notificationActions from 'app/redux/NotificationReducer';
import NotificationItem from 'app/components/notifications/NotificationItem';

class Notification extends React.Component {
    static propTypes = {
        notification: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            timeOutId: null,
        };
    }

    componentDidMount() {
        const { notification } = this.props;
        if (!notification.shown) {
            const timeOutId = setTimeout(
                () => this.props.markShown(notification.id),
                3000
            );
            this.setState({
                timeOutId,
            });
        }
    }
    componentWillUnmount() {
        clearTimeout(this.state.timeOutId);
    }

    markReadDefault = e => {
        this.props.markRead(this.props.notification.id);
    };

    markRead = e => {
        e.preventDefault();
        e.stopPropagation();
        this.props.markRead(this.props.notification.id);
    };

    markUnread = e => {
        e.preventDefault();
        e.stopPropagation();
        this.props.markUnread(this.props.notification.id);
    };

    render() {
        const {
            notification,
            notification: { notify_type, read },
        } = this.props;

        const switchTypes = types => key =>
            types.hasOwnProperty(key) ? types[key] : types['default'];

        const notificationTypes = {
            default: notification => {
                return (
                    <NotificationItem
                        header={'Header placeholder'}
                        body={'Body placeholder'}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            account_update: notification => {
                return (
                    <NotificationItem
                        username={notification.data.account}
                        header={'Account Update'}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            comment_reply: notification => {
                return (
                    <NotificationItem
                        username={notification.data.author}
                        header={notification.data.title}
                        body={notification.data.body}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            feed: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={'Feed Notification'}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            follow: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Now Follows You `}
                        body={`${
                            notification.username
                        } follows your ${JSON.parse(notification.data.json)[
                            'what'
                        ].toString()}.`}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            mention: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Mentioned You In ${notification.data.title}`}
                        body={notification.data.body}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            post_reply: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Replied In ${notification.data.title}`}
                        body={notification.data.body}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            power_down: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Powerdown`}
                        body={notification.data.vesting_shares}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            send: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Sent Money`}
                        body={`${notification.data.amount} to ${
                            notification.data.to
                        }`}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            receive: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Received Money`}
                        body={`${notification.data.amount} from ${
                            notification.data.from
                        }`}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            resteem: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Resteemed`}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            reward: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Rewarded Money For ${
                            notification.data.permlink
                        }`}
                        body={`SBD payout: ${
                            notification.data.sbd_payout
                        }, STEEM payout: ${
                            notification.data.steem_payput
                        }, Vesting payout: ${notification.data.vesting_payout}`}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
            vote: notification => {
                return (
                    <NotificationItem
                        username={notification.username}
                        header={`Voted`}
                        body={`Weight: ${notification.data.weight}`}
                        created={notification.created}
                        read={notification.read}
                        shown={notification.shown}
                        markRead={this.markRead}
                    />
                );
            },
        };

        const notificationInner = switchTypes(notificationTypes)(notify_type)(
            notification
        );

        // TODO: Make notif link to relevant content
        // TODO: Display badge representing notification type.
        /*
        const post = this.props.notification.rootItem;
        const badge = badges[type] ? badges[type] : null;
        */

        return <span>{notificationInner}</span>;
    }
}

export default connect(null, dispatch => ({
    markRead: id => dispatch(notificationActions.updateOne(id, { read: true })),
    markUnread: id =>
        dispatch(notificationActions.updateOne(id, { read: false })),
    markShown: id =>
        dispatch(notificationActions.updateOne(id, { shown: true })),
}))(Notification);
