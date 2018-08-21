import throttle from 'lodash/throttle';
import { api } from 'golos-js';
import { getStoreState, dispatch } from 'shared/UniversalRender';

let usersToLoad = [];
let currentLoading = [];

export function loadUserLazy(accountName) {
    if (
        accountName &&
        !usersToLoad.includes(accountName) &&
        !currentLoading.includes(accountName)
    ) {
        const state = getStoreState();

        if (!state.global.hasIn(['accounts', accountName])) {
            usersToLoad.push(accountName);
            lazyLoadUsers();
        }
    }
}

const lazyLoadUsers = throttle(
    async function() {
        try {
            currentLoading = usersToLoad;
            usersToLoad = [];
            const accounts = await api.getAccountsAsync(currentLoading);

            dispatch({
                type: 'global/RECEIVE_ACCOUNTS',
                payload: {
                    accounts,
                },
            });

            currentLoading = [];
        } catch (err) {
            console.error(err);
        }
    },
    100,
    { leading: false }
);
