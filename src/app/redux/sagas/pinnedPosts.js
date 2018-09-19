import { put, select, takeEvery } from 'redux-saga/effects';
import transaction from 'app/redux/Transaction';
import DialogManager from 'app/components/elements/common/DialogManager';
import { dispatch } from 'app/clientRender';
import { PINNED_TOGGLE } from '../constants/pinnedPosts';

export default function* watch() {
    yield takeEvery(PINNED_TOGGLE, togglePinned);
}

function* togglePinned(action) {
    const { link, isPin } = action.payload;

    const userName = yield select(state => state.user.getIn(['current', 'username']));
    const account = yield select(state => state.global.getIn(['accounts', userName]));

    const metadata = JSON.parse(account.get('json_metadata'));

    let pinnedPosts = metadata.pinnedPosts || [];

    if (isPin) {
        if (pinnedPosts.includes(link)) {
            return;
        }

        if (pinnedPosts.length >= 5) {
            DialogManager.info(
                'Максимальное количество закрепленных постов в блоге - 5.\n\n' +
                    'Если вы хотите изменить список закрепленных постов, открепите один пост, чтобы закрепить другой.'
            );
            return;
        }

        pinnedPosts.push(link);
    } else {
        pinnedPosts = pinnedPosts.filter(pinnedLink => pinnedLink !== link);
    }

    metadata.pinnedPosts = pinnedPosts;

    const jsonMetadata = JSON.stringify(metadata);

    yield put(
        transaction.actions.broadcastOperation({
            type: 'account_metadata',
            operation: {
                account: account.get('name'),
                memo_key: account.get('memo_key'),
                json_metadata: jsonMetadata,
            },
            successCallback: () => {
                dispatch({
                    type: 'global/UPDATE_ACCOUNT_METADATA',
                    payload: {
                        accountName: account.get('name'),
                        jsonMetadata,
                    },
                });
            },
            errorCallback: err => {
                console.error(err);
                DialogManager.alert('Не удалось выполнить запрос');
            },
        })
    );
}
