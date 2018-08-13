import { call, fork, put, all, takeEvery, select } from 'redux-saga/effects';

import React from 'react';
import { api } from 'golos-js';

import g from 'app/redux/GlobalReducer';
import { getAccount } from 'app/redux/SagaShared';

import { NOTIFICATION_ONLINE_ADD_NOTIFICATION } from 'src/app/redux/constants/notificationsOnline';
import constants from 'app/redux/constants';

import NotificationOnlineContent from 'src/app/redux/sagas/gate/api/NotificationOnlineContent';
import Icon from 'golos-ui/Icon';

function createAddNotificationOnlineAction(props) {
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
        message: <NotificationOnlineContent {...props} />,
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
function* handleAddNotification({ payload: { vote, subscribe, unsubscribe, reply, mention } }) {
    const stateGlobal = yield select(state => state.global);

    console.log(stateGlobal.toJS());

    if (vote) {
        yield all(vote.map(function*(notification) {
            const { counter, voter, permlink } = notification; // {counter: 1, voter: "destroyer2k", permlink: "re-nickshtefan-re-destroyer2k-s-20180803t094131915z"}
        
            const current = yield select(state => state.user.get('current'));
            const author = current.get('username');

            const account = yield call(getAccount, voter);

            const content = yield call(
                [api, api.getContentAsync],
                author,
                permlink,
                constants.DEFAULT_VOTE_LIMIT
            );

            console.log(23, content)

            let title = content.title;
            let link = content.link;

            if (content.parent_author) {
                title = content.root_title;
                link = content.url;
                // link = `/${content.category}/@${content.parent_author}/${
                //     content.parent_permlink
                // }`;
            }

            yield put(
                createAddNotificationOnlineAction({
                    type: 'vote',
                    account,
                    title,
                    link,
                })
            );
        }));
    }

    if (subscribe) {
        yield all(
            subscribe.map(function*(notification) {
                const { counter, follower } = notification; // {counter: 1, follower: "destroyer2k"}

                const account = yield call(getAccount, follower);
                yield put(
                    createAddNotificationOnlineAction({
                        type: 'subscribe',
                        account,
                    })
                );
            })
        );
    }

    if (unsubscribe) {
        yield all(
            unsubscribe.map(function*(notification) {
                const { counter, follower } = notification; // {counter: 1, follower: "destroyer2k"}

                const account = yield call(getAccount, follower);
                yield put(
                    createAddNotificationOnlineAction({
                        type: 'unsubscribe',
                        account,
                    })
                );
            })
        );
    }

    if (reply) {
        yield all(
            reply.map(function*(notification) {
                const { counter, author, permlink } = notification; // {"counter":1,"author":"destroyer2k","permlink":"re-devall-re-nickshtefan-re-destroyer2k-s-20180810t180227217z"}

                const account = yield call(getAccount, author);

                const content = yield call(
                    [api, api.getContentAsync],
                    author,
                    permlink,
                    constants.DEFAULT_VOTE_LIMIT
                );

                let title = content.title;
                let link = content.link;

                if (content.parent_author) {
                    title = content.root_title;
                    link = content.url;
                    // link = `/${content.category}/@${content.parent_author}/${
                    //     content.parent_permlink
                    // }`;
                }

                yield put(
                    createAddNotificationOnlineAction({
                        type: 'reply',
                        account,
                        title,
                        link,
                    })
                );
            })
        );
    }

    if (mention) {
        yield all(
            mention.map(function*(notification) {
                const { counter, permlink } = notification; // {"counter":1,"permlink":"re-devall-re-nickshtefan-re-destroyer2k-s-20180810t180227217z"}
            })
        );
    }
}
