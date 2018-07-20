import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import tt from 'counterpart';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Url from 'app/utils/Url';
import * as type from './type';
import badges from './icon';
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
            notification: { notify_type, read } = {},
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
                    </div>
                );
            },
            account_update: notification => {
                return (
                    <div className="item-panel">
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
        // const amount = this.props.notification.amount;
        // const author = this.props.notification.author;
        // const classNames = this.props.notification.read ? '' : 'unread';
        // const created = this.props.notification.created;
        // const item = this.props.notification.item;
        // const read = this.props.notification.read;
        const post = this.props.notification.rootItem;
        const badge = badges[type] ? badges[type] : null;

        /*
        switch (notificationType) {
            case type.POST_REPLY:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)} <strong>{post.summary}</strong>
                    </span>
                );
                bodyContent = item.summary;
                break;
            case type.COMMENT_REPLY:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)} <strong>{item.parentSummary}</strong>
                    </span>
                );
                bodyContent = item.summary;
                break;
            case type.ANNOUNCEMENT:
            case type.ANNOUNCEMENT_IMPORTANT:
            //todo: use announcement comment 'image' as icon post steemfest. This will require addl info from yo.
            case type.FEED:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)}{' '}
                    </span>
                );
                bodyContent = item.summary;
                break;
            case type.RECEIVE_STEEM:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)}
                    </span>
                );
                bodyContent = (
                    <span>
                        {amount}{' '}
                        <span className="subject"> {tt('g.steem')}</span>
                    </span>
                );
                break;
            case type.RESTEEM:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)}
                    </span>
                );
                bodyContent = item.summary;
                link = Url.comment(item);
                break;
            case type.SECURITY_PWD_CHANGE:
            case type.SECURITY_WITHDRAWAL:
            case type.SECURITY_NEW_MOBILE:
            case type.POWER_DOWN:
                headerContent = (
                    <span>
                        <span className="subject">
                            {tt(`${localeRoot}.subject`)}
                        </span>{' '}
                        {tt(localeAction)}
                    </span>
                );
                bodyContent = tt(`${localeRoot}.body`);
                picture = (
                    <div
                        className="Userpic"
                        dangerouslySetInnerHTML={{ __html: badges.important }}
                    />
                );
                break;
            case type.MENTION:
            case type.VOTE:
                localeAction = localeRoot + '.actionComment';
                if (0 === item.depth) {
                    localeAction = localeRoot + '.actionPost';
                    link = Url.comment(item);
                }
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)}
                    </span>
                );
                bodyContent = item.summary;
                break;
            default:
                console.log(
                    `no option for this notification ${notificationType}`,
                    this.props
                );
                return null;
        }
        */

        /*
        if (!picture) {
            switch (type) {
                //case type.ANNOUNCEMENT_IMPORTANT :
                //todo: special image - unknown json format in notification
                case type.POWER_DOWN:
                    //todo: blank circle image
                    break;
                default:
                    picture = <Userpic account={author} badge={badge} />;
            }
        }
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
                    {!this.props.shown ? (
                        <span
                            className="unseenIndicator"
                            dangerouslySetInnerHTML={{ __html: '&#9679' }}
                        />
                    ) : null}
                    {notificationInner}
                    <div
                        className="rightControls"
                        onClick={read ? this.markUnread : this.markRead}
                        dangerouslySetInnerHTML={{
                            __html: read
                                ? badges.visibilityOn
                                : badges.visibilityOff,
                        }}
                    />
                </Link>
            </li>
        );
        /*
        return (
            <Link
                to={link}
                className={classNames}
                onClick={e => {
                    if (this.props.onClick) {
                        this.props.onClick(e);
                    }
                    this.markReadDefault(e);
                }}
            >
                {!this.props.shown ? (
                    <span
                        className="unseenIndicator"
                        dangerouslySetInnerHTML={{ __html: '&#9679' }}
                    />
                ) : null}
                <div className="item-panel">
                    <div className={'Comment__Userpic show-for-medium ' + type}>
                        {picture}
                    </div>
                    <div className="item-header">{headerContent}</div>
                    {bodyContent ? (
                        <div className="item-body">{bodyContent}</div>
                    ) : null}
                    <div className="item-footer">
                        <TimeAgoWrapper date={created} className="updated" />
                    </div>
                </div>
                {readControl}
            </Link>
        );*/
    }
}

export default connect(null, dispatch => ({
    markRead: id => dispatch(notificationActions.updateOne(id, { read: true })),
    markUnread: id =>
        dispatch(notificationActions.updateOne(id, { read: false })),
    markShown: id =>
        dispatch(notificationActions.updateOne(id, { shown: true })),
}))(Notification);
