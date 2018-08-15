import {
    createDeepEqualSelector,
    globalSelector,
    entitiesArraySelector,
    statusSelector,
    uiSelector,
    pageAccountSelector,
} from './../common';
import { NOTIFICATIONS_FILTER_TYPES } from 'src/app/redux/constants/common';

// Activity selectors

export const filteredNotificationsSelector = createDeepEqualSelector(
    [entitiesArraySelector('notifications'), uiSelector('profile')],
    (notifications, profileUi) => {
        const currentTabId = profileUi.getIn(['activity', 'currentTabId']);
        const types = NOTIFICATIONS_FILTER_TYPES[currentTabId];

        const filteredNotifications = notifications
            .filter(notification => {
                if (currentTabId == 'all') {
                    return true;
                }

                const eventType = notification.get('eventType');
                return types.includes(eventType);
            })
            .sortBy(a => a.get('createdAt'))
            .reverse();

        return filteredNotifications.map((notification, key) => {
            // if first element
            if (key == 0) {
                return notification;
            }

            const prevNotification = filteredNotifications.get(key - 1);

            const isNextDay =
                new Date(prevNotification.get('createdAt')).toDateString() !==
                new Date(notification.get('createdAt')).toDateString();

            if (!isNextDay) {
                return notification;
            }

            return notification.set('isNextDay', isNextDay);
        });
    }
);

export const activityContentSelector = createDeepEqualSelector(
    [
        pageAccountSelector,
        globalSelector('accounts'),
        filteredNotificationsSelector,
        statusSelector('notifications'),
        uiSelector('profile'),
    ],
    (account, accounts, notifications, notificationsStatus, profileUi) => ({
        account,
        accounts,
        notifications,
        isFetching: notificationsStatus.get('isFetching'),
        currentTabId: profileUi.getIn(['activity', 'currentTabId']),
    })
);
