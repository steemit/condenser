import {
    createDeepEqualSelector,
    globalSelector,
    entitiesArraySelector,
    uiSelector,
    routerParamSelector,
} from './../common';

// Activity selectors

export const pageAccountSelector = createDeepEqualSelector(
    [globalSelector('accounts'), routerParamSelector('accountName')],
    (accounts, userName) => accounts.get(userName)
);

export const activityContentSelector = createDeepEqualSelector(
    [pageAccountSelector, entitiesArraySelector('notifies'), globalSelector('accounts'), uiSelector('profile')],
    (account, notifies, accounts, profileUi) => ({
        account,
        notifies,
        accounts,
        currentTabId: profileUi.getIn(['activity', 'currentTabId'])
    })
);