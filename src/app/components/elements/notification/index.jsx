import React from 'react';
import NotificationCommentReply from './CommentReply'
import NotificationPostReply from './PostReply'
import NotificationTag from './Tag'
import NotificationResteem from './Resteem'
import NotificationReceiveSteem from './ReceiveSteem'
import NotificationVote from './Vote'
import * as type from './type'


const fnInstantiateNotification = (n) => {
    switch (n.notificationType) {
        case type.POST_REPLY :
            return (<NotificationPostReply {...n} />)
        case type.COMMENT_REPLY :
            return(<NotificationCommentReply {...n} />)
        case type.TAG :
            return(<NotificationTag {...n} />)
        case type.RESTEEM :
            return(<NotificationResteem {...n} />)
        case type.RECEIVE_STEEM :
            return(<NotificationReceiveSteem account_link={/*account_link*/ 'blah'} {...n} />)
        case type.VOTE :
            return(<NotificationVote {...n} />)
        default :
            console.log("no option for this notification", n)
    }
    return null
}

export const makeNotificationList = notifications => {
    const notificationList = []
    notifications.forEach( (notification) => {
        notificationList.push(<li className="item" key={notification.id}>{ fnInstantiateNotification(notification) }</li> )
    })
    return notificationList
}

export default class Notification extends React.Component {
    render() {
        return fnInstantiateNotification(this.props.notification)
    }
}
