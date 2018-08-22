import { put, select, takeEvery } from 'redux-saga/effects';
import transaction from 'app/redux/Transaction';
import DialogManager from 'app/components/elements/common/DialogManager';
import { dispatch } from 'shared/UniversalRender';
import {
    PINNED_TOGGLE,
} from '../constants/pinnedPosts';

export default function* watch() {
    yield takeEvery(PINNED_TOGGLE, togglePinned);
}

function* togglePinned(action) {
    const { link, isPin } = action.payload;

    const userName = yield select(state => state.user.getIn(['current', 'username']));
    const account = yield select(state => state.global.getIn(['accounts', userName]));

    const metadata = JSON.parse(account.get('json_metadata'));

    let pinnedPosts = account.get('pinnedPosts').toJS();

    if (isPin) {
        if (pinnedPosts.includes(link)) {
            return;
        }

        if (pinnedPosts.length >= 5) {
            return;
        }

        pinnedPosts.push(link);
    } else {
        pinnedPosts = pinnedPosts.filter(pinnedLink => pinnedLink !== link);
    }

    metadata.pinnedPosts = pinnedPosts;

    yield put(transaction.actions.broadcastOperation({
        type: 'account_metadata',
        operation: {
            account: account.get('name'),
            memo_key: account.get('memo_key'),
            json_metadata: JSON.stringify(metadata),
        },
        successCallback: () => {
            dispatch({
                type: 'global/PINNED_UPDATE',
                payload: {
                    accountName: account.get('name'),
                    pinnedPosts,
                },
            });
        },
        errorCallback: err => {
            console.error(err);
            DialogManager.alert('Не удалось выполнить запрос');
        },
    }))
}
