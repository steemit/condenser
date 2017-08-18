/*global describe, it, before, beforeEach, after, afterEach */

import chai, {expect} from 'chai';
import chaiImmutable from 'chai-immutable';
import Immutable, {Map} from 'immutable';
import ReducerModule from '../GlobalReducer';
chai.use(chaiImmutable);

const {reducer, actions} = ReducerModule;

describe('global reducer', () => {
    it('should return empty state', () => {
        expect(
            reducer(undefined, {})
        ).to.equal(Map({}));
    });

    it('should apply new global state', () => {
        const state = Immutable.fromJS(require('./global.json'));
        //const action = {type: 'global/RECEIVE_STATE', payload: state};
        expect(
            reducer(undefined, actions.receiveState(state))
        ).to.equal(state);
    });
});
