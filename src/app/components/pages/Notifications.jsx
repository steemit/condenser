import React from 'react'
import {connect} from 'react-redux'
import { makeNotificationList } from 'app/components/elements/notification'


class NotificationPage extends React.Component {
    static propTypes = {
        unreadNotifications: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    };

    closeMenu = (e) => {
        // If this was not a left click, or if CTRL or CMD were held, do not close the menu.
        if(e.button !== 0 || e.ctrlKey || e.metaKey) return;
        // Simulate clicking of document body which will close any open menus
        document.body.click();
    }

    render() {
        return ( <ul className="Notifications"> { makeNotificationList(this.props.unreadNotifications) } </ul> )
    }
}


export default connect(
    // mapStateToProps
    (state, ownProps) => {
        return {
            unreadNotifications: state.notification.unread.toArray(),
            ...ownProps
        }
    }
)(NotificationPage)
