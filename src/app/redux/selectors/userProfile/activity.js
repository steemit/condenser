import {
    createDeepEqualSelector,
    globalSelector,
    entitiesArraySelector,
    statusSelector,
    uiSelector,
    routerParamSelector,
} from './../common';
import { NOTIFIES_FILTER_TYPES } from 'src/app/redux/constants/common';

// Activity selectors

export const pageAccountSelector = createDeepEqualSelector(
    [globalSelector('accounts'), routerParamSelector('accountName')],
    (accounts, userName) => accounts.get(userName)
);

export const filteredNotifiesSelector = createDeepEqualSelector(
    [entitiesArraySelector('notifies'), uiSelector('profile')],
    (notifies, profileUi) => {
        const currentTabId = profileUi.getIn(['activity', 'currentTabId']);
        const types = NOTIFIES_FILTER_TYPES[currentTabId];

        return notifies
            .filter(notify => {
                if (currentTabId == 'all') {
                    return true;
                }

                const eventType = notify.get('eventType');
                return types.includes(eventType);
            })
            .sort((a, b) => a.get('updatedAt') < b.get('updatedAt'));
    }
);

export const activityContentSelector = createDeepEqualSelector(
    [
        pageAccountSelector,
        globalSelector('accounts'),
        filteredNotifiesSelector,
        statusSelector('notifies'),
        uiSelector('profile'),
    ],
    (account, accounts, notifies, notifiesStatus, profileUi) => ({
        account,
        accounts,
        notifies,
        isFetching: notifiesStatus.get('isFetching'),
        currentTabId: profileUi.getIn(['activity', 'currentTabId']),
    })
);
