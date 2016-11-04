import { call, put, select } from 'redux-saga/effects';
import Apis from 'shared/api_client/ApiInstances';
import GlobalReducer from './GlobalReducer';
import {getNotifications} from 'app/utils/ServerApiClient';

const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
)

function* pollData() {
    while(true) {
        yield call(wait, 20000);

        const username = yield select(state => state.user.getIn(['current', 'username']));
        if (username) {
            const nc = yield call(getNotifications, username);
            yield put({type: 'UPDATE_NOTIFICOUNTERS', payload: nc});
        }

        const ws_connection = yield select(state => state.app.get('ws_connection'));
        if (ws_connection && ws_connection.status !== 'open') {
            console.log('pollData: not connected, skipping');
        } else {
            try {
                const db_api = Apis.instance().db_api;
                const data = yield call([db_api, db_api.exec], 'get_dynamic_global_properties', []);
                // console.log('-- pollData.pollData -->', data);
                // const data = yield call([db_api, db_api.exec], 'get_discussions_by_created', [{limit: 10}]);
                // yield put(GlobalReducer.actions.receiveRecentPosts({data}));
            } catch (error) {
                console.error('~~ pollData saga error ~~>', error);
            }
        }
    }
}

export default pollData;
