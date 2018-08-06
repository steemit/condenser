import { call, put, select } from 'redux-saga/effects';
import constants from 'app/redux/constants';
import GlobalReducer from 'app/redux//GlobalReducer';
import { api } from 'golos-js';

export function* hydrateNotifies(notifies) {
    for (let key in notifies) {
        const notify = notifies[key];
        const { fromUsers } = notify;

        const accounts = yield call([api, api.getAccountsAsync], fromUsers);
        for (let i in accounts) {
            const account = accounts[i];
            yield put(GlobalReducer.actions.receiveAccount({ account }));
        }

        if (['mention'].includes(notify.eventType)) {
            const { parentPermlink, permlink } = notify;
            const content = yield call(
                [api, api.getContentAsync],
                parentPermlink,
                permlink,
                constants.DEFAULT_VOTE_LIMIT
            );
            yield put(GlobalReducer.actions.receiveContent({ content }));
        }
    }
}
