import React from 'react';
import { Link } from 'react-router';
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
