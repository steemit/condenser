import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import { Map } from 'immutable';
import reducer from './OffchainReducer';

chai.use(chaiImmutable);

const mockAction = {
    type: 'user/SAVE_LOGIN_CONFIRM',
};

const mockActionWithPayload = { ...mockAction, payload: 'Foo Barman' };

describe('offchain reducer', () => {
    it('should provide a nice initial state, with any payload', () => {
        const initial = reducer();
        const expected = Map({ user: Map({}) });
        expect(initial).to.eql(expected);
        const withPayload = reducer(initial, mockActionWithPayload);
        expect(withPayload).to.eql(expected);
    });
    it('should return an account of null when action has no payload', () => {
        const initial = reducer();
        const account = reducer(initial, mockAction);
        expect(account).to.eql(Map({ user: Map({}), account: null }));
    });
});
