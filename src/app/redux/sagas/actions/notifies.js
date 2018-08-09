import { call, put, select } from 'redux-saga/effects';
import constants from 'app/redux/constants';
import GlobalReducer from 'app/redux//GlobalReducer';
import { api } from 'golos-js';

// TODO: optimize
export function* hydrateNotifies(notifies) {
    const hydrateUsers = [];
    const hydrateContents = [];
    for (let notify of notifies) {
        const { fromUsers } = notify;

        for (let user of fromUsers) {
            hydrateUsers.push(user);
        }

        if (['mention'].includes(notify.eventType)) {
            const { parentPermlink, permlink } = notify;
            const content = yield call(
                [api, api.getContentAsync],
                parentPermlink,
                permlink,
                constants.DEFAULT_VOTE_LIMIT
            );
            hydrateContents.push(content);
        }
    }

    for (let content of hydrateContents) {
        yield put(GlobalReducer.actions.receiveContent({ content }));
    }

    const accounts = yield call([api, api.getAccountsAsync], hydrateUsers);
    for (let account of accounts) {
        yield put(GlobalReducer.actions.receiveAccount({ account }));
    }
}
