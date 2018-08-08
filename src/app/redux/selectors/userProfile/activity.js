import {
    createDeepEqualSelector,
    globalSelector,
    entitiesArraySelector,
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
            .sort((a, b) => a.get('createdAt') < b.get('createdAt'));
    }
);

export const activityContentSelector = createDeepEqualSelector(
    [
        pageAccountSelector,
        globalSelector('accounts'),
        filteredNotifiesSelector,
        uiSelector('profile'),
    ],
    (account, accounts, notifies, profileUi) => ({
        account,
        accounts,
        notifies,
        currentTabId: profileUi.getIn(['activity', 'currentTabId']),
    })
);
