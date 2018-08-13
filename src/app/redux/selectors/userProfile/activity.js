import {
    createDeepEqualSelector,
    globalSelector,
    entitiesArraySelector,
    statusSelector,
    uiSelector,
    routerParamSelector,
} from './../common';
import { NOTIFICATIONS_FILTER_TYPES } from 'src/app/redux/constants/common';

// Activity selectors

export const pageAccountSelector = createDeepEqualSelector(
    [globalSelector('accounts'), routerParamSelector('accountName')],
    (accounts, userName) => accounts.get(userName)
);

export const filteredNotificationsSelector = createDeepEqualSelector(
    [entitiesArraySelector('notifications'), uiSelector('profile')],
    (notifications, profileUi) => {
        const currentTabId = profileUi.getIn(['activity', 'currentTabId']);
        const types = NOTIFICATIONS_FILTER_TYPES[currentTabId];

        return notifications
            .filter(notification => {
                if (currentTabId == 'all') {
                    return true;
                }

                const eventType = notification.get('eventType');
                return types.includes(eventType);
            })
            .sortBy(a => a.get('updatedAt'))
            .reverse()
            .map((notification, key) => {
                const prevNotification = notifications.get(key - 1);
                if (!prevNotification) {
                    return notification;
                }

                const isNextDay =
                    new Date(notification.get('updatedAt')).toDateString() !==
                    new Date(prevNotification.get('updatedAt')).toDateString();
                if (!isNextDay) {
                    return notification;
                }

                return notification.set('isNextDay', isNextDay);
            }) ;
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
