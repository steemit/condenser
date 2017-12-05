import { call, put, select } from 'redux-saga/effects';
import {api} from '@steemit/steem-js';
import * as appActions from 'app/redux/AppReducer';
import {getNotifications, webPushRegister} from 'app/utils/ServerApiClient';
import registerServiceWorker from 'app/utils/RegisterServiceWorker';

const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
)

let webpush_params = null;

function* pollData() {
    while(true) {
        yield call(wait, 20000);

        const username = yield select(state => state.user.getIn(['current', 'username']));
        if (username) {
            if (webpush_params === null) {
                try {
                    webpush_params = yield call(registerServiceWorker);
                    if (webpush_params) yield call(webPushRegister, username, webpush_params);
                } catch (error) {
                    console.error(error);
                    webpush_params = {error};
                }
            }
            const nc = yield call(getNotifications, username, webpush_params);
            yield put(appActions.updateNotificounters(nc));
        }

        try {
            yield call([api, api.getDynamicGlobalPropertiesAsync]);
        } catch (error) {
            console.error('~~ pollData saga error ~~>', error);
        }
    }
}

export default pollData;
