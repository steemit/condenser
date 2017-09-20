import React from 'react'
import Notification from './Notification'
/*
export const makeNotificationList = (notifications = []) => {
    const notificationList = []
    notifications.forEach( notification => {
        if(!notification.hide) {
            let classNames = "item" + ( notification.read ? '' : ' unread' )
            notificationList.push(<li className={ classNames } key={notification.id}><Notification { ...notification } /></li> )
        }
    })
    return notificationList
}
*/
export default Notification
