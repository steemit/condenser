import {
    createDeepEqualSelector,
    globalSelector,
    routerParamSelector,
    entitiesArraySelector,
} from './../common';

// Activity selectors

export const pageAccountSelector = createDeepEqualSelector(
    [globalSelector('accounts'), routerParamSelector('accountName')],
    (accounts, userName) => accounts.get(userName)
);

export const activityContentSelector = createDeepEqualSelector(
    [pageAccountSelector, entitiesArraySelector('notifies'), globalSelector('accounts')],
    (account, notifies, accounts) => ({
        account,
        notifies,
        accounts
    })
);