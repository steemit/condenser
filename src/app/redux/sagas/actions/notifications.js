import { call, put, all } from 'redux-saga/effects';
import constants from 'app/redux/constants';
import GlobalReducer from 'app/redux//GlobalReducer';
import { api } from 'golos-js';

// TODO: optimize
export function* hydrateNotifications(notifications) {
    const hydrateUsers = [];
    const hydrateContents = [];
    for (let notification of notifications) {
        const { fromUsers } = notification;

        for (let user of fromUsers) {
            hydrateUsers.push(user);
        }

        if (['mention'].includes(notification.eventType)) {
            const { parentPermlink, permlink } = notification;
            hydrateContents.push(call(
                [api, api.getContentAsync],
                parentPermlink,
                permlink,
                constants.DEFAULT_VOTE_LIMIT
            ));
        }
    }

    const contents = yield all(hydrateContents)
    yield put(GlobalReducer.actions.receiveContents({ contents }));

    const accounts = yield call([api, api.getAccountsAsync], hydrateUsers);
    yield put(GlobalReducer.actions.receiveAccounts({ accounts }));
}
