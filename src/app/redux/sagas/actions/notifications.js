import { call, put, all, select } from 'redux-saga/effects';
import constants from 'app/redux/constants';
import GlobalReducer from 'app/redux//GlobalReducer';
import { api } from 'golos-js';
import { numberWithCommas, vestsToGolosPower } from 'app/utils/StateFunctions';

export function* hydrateNotifications(notifications) {
    const hydrateUsers = [];
    const hydrateContents = [];

    const currentUser = yield select(state => state.user.get('current'));
    const state = yield select(state => state);

    for (let notification of notifications) {
        const { fromUsers = [], eventType } = notification;

        for (let user of fromUsers) {
            let account = yield select(state => state.global.get('accounts').get(user));
            if (!account) hydrateUsers.push(user);
        }

        if (
            ['vote', 'flag', 'repost', 'reply', 'mention', 'reward', 'curatorReward'].includes(
                eventType
            )
        ) {
            let author = '';
            if (['vote', 'flag', 'reward'].includes(eventType)) {
                author = currentUser.get('username');
            } else if (['curatorReward'].includes(eventType)) {
                author = notification.curatorTargetAuthor;
                notification.curatorReward = numberWithCommas(
                    vestsToGolosPower(state, `${notification.curatorReward} GESTS`)
                );
            } else if (['repost', 'reply', 'mention'].includes(eventType)) {
                author = fromUsers[0];
            }

            const { permlink } = notification;
            const content = yield select(state =>
                state.global.getIn(['content', `${author}/${permlink}`])
            );

            if (!content) {
                hydrateContents.push(
                    call([api, api.getContentAsync], author, permlink, constants.DEFAULT_VOTE_LIMIT)
                );
            }
        }
    }

    if (hydrateContents.length) {
        const contents = yield all(hydrateContents);
        yield put(GlobalReducer.actions.receiveContents({ contents }));
    }

    if (hydrateUsers.length) {
        const accounts = yield call([api, api.getAccountsAsync], hydrateUsers);
        yield put(GlobalReducer.actions.receiveAccounts({ accounts }));
    }

    return notifications;
}
