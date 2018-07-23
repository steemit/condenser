import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import tt from 'counterpart';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Url from 'app/utils/Url';
import InlineSVG from 'svg-inline-react';
import vizOn from 'assets/icons/visibility_on.svg';
import vizOff from 'assets/icons/visibility_off.svg';
import * as notificationActions from 'app/redux/NotificationReducer';

class Notification extends React.Component {
    static propTypes = {
        notification: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func,
    };

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
                    <div className="item-panel">
                        <div className={'Comment__Userpic show-for-medium '}>
                            {/*<Userpic account={notification.data.account} />*/}
                        </div>
                        <div className="item-header">HEADER HERE</div>
                        <div className="item-body">BODY HERE</div>
                        <div className="item-footer">
                            <TimeAgoWrapper
                                date={notification.created}
                                className="updated"
                            />
                        </div>
                        <div
                            className="rightControls"
                            onClick={
                                notification.read
                                    ? this.markUnread
                                    : this.markRead
                            }
                        >
                            <InlineSVG
                                src={notification.read ? vizOn : vizOff}
                            />
                        </div>
                    </div>
                );
            },
            account_update: notification => {
                return (
                    <div className="item-panel">
                        {!notification.shown ? (
                            <span className="unseenIndicator">●</span>
                        ) : null}
                        <div className={'Comment__Userpic show-for-medium '}>
                            <Userpic account={notification.data.account} />
                        </div>
                        <div className="item-header">
                            <span>
                                <span className="subject">Account Update</span>
                            </span>
                        </div>
                        <div className="item-footer">
                            <TimeAgoWrapper
                                date={notification.created}
                                className="updated"
                            />
                        </div>
                    </div>
                );
            },
            comment_reply: notification => {
                return (
                    <div className="item-panel">
                        {!notification.shown ? (
                            <span className="unseenIndicator">●</span>
                        ) : null}
                        <div className={'Comment__Userpic show-for-medium '}>
                            <Userpic account={notification.data.author} />
                        </div>
                        <div className="item-header">
                            <span>
                                <span className="user">
                                    {notification.data.author}
                                </span>{' '}
                                <strong>{notification.data.title}</strong>
                            </span>
                        </div>
                        <div className="item-body">
                            {notification.data.body}
                        </div>
                        <div className="item-footer">
                            <TimeAgoWrapper
                                date={notification.created}
                                className="updated"
                            />
                        </div>
                    </div>
                );
            },
            feed: notification => {
                return (
                    <div className="item-panel">
                        {!notification.shown ? (
                            <span className="unseenIndicator">●</span>
                        ) : null}
                        <div className={'Comment__Userpic show-for-medium '}>
                            <Userpic account={notification.username} />
                        </div>
                        <div className="item-header">
                            <span>
                                <span className="user">
                                    {notification.username}
                                </span>
                                Feed Notification
                            </span>
                        </div>
                        <div className="item-footer">
                            <TimeAgoWrapper
                                date={notification.created}
                                className="updated"
                            />
                        </div>
                    </div>
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

        return (
            <li className={`item ${!read && 'unread'}`}>
                <Link
                    to={'@test-safari'}
                    onClick={e => {
                        if (this.props.onClick) {
                            this.props.onClick(e);
                        }
                        this.markReadDefault(e);
                    }}
                >
                    {notificationInner}
                </Link>
            </li>
        );
    }
}

export default connect(null, dispatch => ({
    markRead: id => dispatch(notificationActions.updateOne(id, { read: true })),
    markUnread: id =>
        dispatch(notificationActions.updateOne(id, { read: false })),
    markShown: id =>
        dispatch(notificationActions.updateOne(id, { shown: true })),
}))(Notification);
