import { fork, put, all, takeEvery, select } from 'redux-saga/effects';

import React from 'react';
import { api } from 'golos-js';

import { NOTIFICATION_ONLINE_ADD_NOTIFICATION } from 'src/app/redux/constants/notificationsOnline';
import constants from 'app/redux/constants';

import NotificationContent from 'src/app/redux/sagas/gate/api/NotificationOnlineContent';
import Icon from 'golos-ui/Icon';

function createAddNotificationOnlineAction(msg, account) {
    const baseStyles = {
        display: 'flex',
        alignItems: 'center',
        left: 'auto',
        background: '#FFFFFF',
        borderRadius: '6px',
        paddingTop: '0',
        paddingBottom: '0',
        paddingLeft: '20px',
        paddingRight: '20px',
        lineHeight: '1',
        minHeight: '60px',
    };

    const payload = {
        barStyle: {
            ...baseStyles,
            right: '-100%',
        },
        activeBarStyle: {
            ...baseStyles,
            right: '2.5rem',
        },
        message: <NotificationContent msg={msg} account={account} />,
        action: <Icon name="cross" size="14" style={{ color: '#E1E1E1' }} />,
        actionStyle: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: '18px',
            cursor: 'pointer',
        },
        key: 'chain_' + Date.now(),
        dismissAfter: 15000,
    };

    return {
        type: 'ADD_NOTIFICATION',
        payload,
    };
}

export default function* rootSaga() {
    yield fork(addNotificationsOnlineWatch);
}

function* addNotificationsOnlineWatch() {
    yield takeEvery(NOTIFICATION_ONLINE_ADD_NOTIFICATION, handleAddNotification);
}

// TODO: look in cache before call to api
function* handleAddNotification({ payload: { subscribe, unsubscribe, reply, mention } }) {
    const stateGlobal = yield select(state => state.global);

    if (subscribe) {
        yield all(subscribe.map(function* (notification) {
            const { counter, follower } = notification; // {counter: 1, follower: "destroyer2k"}

            const msg = `<a href="/@${follower}">@${follower}</a> подписался на ваш блог. 😊`;
            yield put(createAddNotificationOnlineAction(msg));
        }));
    }

    if (unsubscribe) {
        yield all(unsubscribe.map(function*(notification) {
            const { counter, follower } = notification; // {counter: 1, follower: "destroyer2k"}

            const msg = `<a href="/@${follower}">@${follower}</a> отписался от вашего блога. 😔`;
            yield put(createAddNotificationOnlineAction(msg));
        }));
    }

    if (reply) {
        yield all(reply.map(function* (notification) {
            const { counter, author, permlink } = notification; // {"counter":1,"author":"destroyer2k","permlink":"re-devall-re-nickshtefan-re-destroyer2k-s-20180810t180227217z"}

            const content = call(
                [api, api.getContentAsync],
                author,
                permlink,
                constants.DEFAULT_VOTE_LIMIT
            );

            let title = content.title;
            let parentLink = content.link;

            if (content.parent_author) {
                title = content.root_title;
                parentLink = `/${content.category}/@${content.parent_author}/${
                    content.parent_permlink
                }`;
            }

            const msg = `<a href="/@${author}">@${author}</a> ответил на вашу запись <a href="${parentLink}">${title}</a>. ✌️`;
            yield put(createAddNotificationOnlineAction(msg));
        }));
    }

    if (mention) {
        yield all(mention.map(function* (notification) {
            const { counter, permlink } = notification; // {"counter":1,"permlink":"re-devall-re-nickshtefan-re-destroyer2k-s-20180810t180227217z"}
        }));
    }
}
