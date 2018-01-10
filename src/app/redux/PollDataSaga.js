import { call } from 'redux-saga/effects';
import { api } from '@steemit/steem-js';

const wait = ms =>
    new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    });

function* pollData() {
    while (true) {
        yield call(wait, 20000);

        try {
            yield call([api, api.getDynamicGlobalPropertiesAsync]); // TODO why?????
        } catch (error) {
            console.error('~~ pollData saga error ~~>', error);
        }
    }
}

export default pollData;
