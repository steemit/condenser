/*global describe, it, before, beforeEach, after, afterEach */
import Immutable from 'immutable';
import reducer, * as globalActions from '../GlobalReducer';

describe('global reducer', () => {
    it('should return empty state', () => {
        const reduced = reducer(undefined, {});

        expect(reduced.toJS()).toEqual({ status: {} });
    });

    it('should apply new global state', () => {
        const state = Immutable.fromJS(require('./global.json'));
        const reduced = reducer(undefined, globalActions.receiveState(state));
        //const action = {type: 'global/RECEIVE_STATE', payload: state};
        expect(reduced.toJS()).toEqual(state.toJS());
    });
});
