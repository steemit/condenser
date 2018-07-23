import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import InlineSVG from 'svg-inline-react';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import vizOn from 'assets/icons/visibility_on.svg';
import vizOff from 'assets/icons/visibility_off.svg';

class NotificationItem extends React.Component {
    render() {
        const {
            username,
            header,
            body,
            created,
            read,
            shown,
            markRead,
        } = this.props;
        return (
            <Link
                to={'TODO-MAKE-THIS-MEANINGFUL'} // TODO: Decide where a notification links to.
                onClick={e => {
                    // TODO: Decide what clicking on a notification means.
                }}
            >
                <div className="item-panel">
                    {!shown && <span className="unseenIndicator">●</span>}
                    <div className={'Comment__Userpic show-for-medium '}>
                        {username && <Userpic account={username} />}
                    </div>
                    <div className="item-header">
                        {username && <span className="user">{username}</span>}
                        <strong>{header}</strong>
                    </div>
                    <div className="item-body">{body && body}</div>
                    <div className="item-footer">
                        <TimeAgoWrapper date={created} className="updated" />
                    </div>
                    <div
                        className="rightControls"
                        onClick={read ? markUnread : markRead}
                    >
                        <InlineSVG src={read ? vizOn : vizOff} />
                    </div>
                </div>
            </Link>
        );
    }
}

NotificationItem.propTypes = {
    username: PropTypes.string,
    header: PropTypes.string.isRequired,
    body: PropTypes.string,
    created: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired,
    shown: PropTypes.bool.isRequired,
    markRead: PropTypes.func.isRequired,
};

export default NotificationItem;
