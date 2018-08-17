import { List, fromJS } from 'immutable';
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

        let filteredNotifications = notifications;
        if (currentTabId !== 'all') {
            filteredNotifications = notifications.filter(notification => {
                if (currentTabId == 'all') {
                    return true;
                }

                const eventType = notification.get('eventType');
                return types.includes(eventType);
            });
        }
        return filteredNotifications.sortBy(a => a.get('createdAt')).reverse();
    }
);

// Prepare all data for render notifications on activity page
export const hydratedNotificationsSelector = createDeepEqualSelector(
    [filteredNotificationsSelector, globalSelector('accounts'), globalSelector('content')],
    (notifications, accounts, contents) =>
        notifications.map((notification, key) =>
            notification.withMutations(notify => {
                // Add content title and link from store data
                if (
                    [
                        'vote',
                        'flag',
                        'repost',
                        'reply',
                        'mention',
                        'award',
                        'curatorAward',
                    ].includes(notify.get('eventType'))
                ) {
                    const content = contents.getIn([
                        `${notify.get('fromUsers').get(0)}/${notify.get('permlink')}`,
                    ]);
                    if (content) {
                        // if it isn't post
                        if (content.get('parent_author')) {
                            notify.setIn(
                                ['computed'],
                                fromJS({
                                    title: content.get('root_title'),
                                    link: content.get('url'),
                                })
                            );
                        } else {
                            notify.setIn(
                                ['computed'],
                                fromJS({
                                    title: content.get('title'),
                                    link: content.get('link'),
                                })
                            );
                        }
                    }
                }
                // Add users from store data
                const computedAccounts = notify
                    .get('fromUsers')
                    .map(userName => accounts.get(userName.toLowerCase()));
                notify.setIn(['computed', 'accounts'], computedAccounts);

                // skip first element, because we don't need date label before first element
                if (key == 0) {
                    return notify;
                }

                // Check that this notification have next day date
                const prevNotify = notifications.get(key - 1);
                const isNextDay =
                    new Date(prevNotify.get('createdAt')).toDateString() !==
                    new Date(notify.get('createdAt')).toDateString();

                return notify.set('isNextDay', isNextDay);
            })
        )
);

export const activityContentSelector = createDeepEqualSelector(
    [
        pageAccountSelector,
        globalSelector('accounts'),
        hydratedNotificationsSelector,
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
