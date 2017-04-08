/*global describe, it, before, beforeEach, after, afterEach */

import chai, {expect} from 'chai';
import dirtyChai from 'dirty-chai';
import sinon from 'sinon';
import {call, put} from 'redux-saga/effects';
import Apis from 'shared/api_client/ApiInstances';
import {fetchState} from './FetchDataSaga';
chai.use(dirtyChai);

sinon.stub(Apis, 'instance', () => ({
    db_api: {
        exec: () => {}
    }
}));

const action = {
    payload: {
        pathname: '/recent',
        search: '',
        action: 'PUSH'
    }
};

describe('sagas', () => {
/* not maintained
    it('should fetch state and submit RECEIVE_STATE action', () => {
        const url = '/recent';
        const db_api = Apis.instance().db_api;
        const expectedCallResult = call([db_api, db_api.exec], 'get_state', [url]);
        const generator = fetchState(action);
        const callResult = generator.next().value;
        expect(
            callResult.CALL.args
        ).to.be.eql(expectedCallResult.CALL.args);

        const expectedPutResult = put({type: 'global/RECEIVE_STATE', payload: undefined});
        const putResult = generator.next().value;
        expect(
            putResult
        ).to.be.eql(expectedPutResult);
    });

    it('should try to fetch state and submit STEEM_API_ERROR if failed', () => {
        const generator = fetchState(action);
        expect(generator.next().value).to.be.ok();
        const result = generator.throw({message: 'test error'}).value;
        const expectedPutResult = put({type: 'global/STEEM_API_ERROR', error: 'test error'});
        expect(
            result
        ).to.be.eql(expectedPutResult);
    });

    it('should try to fetch state and submit STEEM_API_ERROR if failed', () => {
        const pop_action = {payload: {...action.payload, action: 'POP'}};
        const generator = fetchState(pop_action);
        const result = generator.next().value;
        expect(result).to.be.null();
    });
*/
});
