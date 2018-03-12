import { Map } from 'immutable';
import reducer from './OffchainReducer';

const mockAction = {
    type: 'user/SAVE_LOGIN_CONFIRM',
};

const mockActionWithPayload = { ...mockAction, payload: 'Foo Barman' };

describe('offchain reducer', () => {
    it('should provide a nice initial state, with any payload', () => {
        const initial = reducer();
        const expected = Map({ user: Map({}) });
        expect(initial).toEqual(expected);
        const withPayload = reducer(initial, mockActionWithPayload);
        expect(withPayload).toEqual(expected);
    });
    it('should return an account of null when action has no payload', () => {
        const initial = reducer();
        const account = reducer(initial, mockAction);
        expect(account).toEqual(Map({ user: Map({}), account: null }));
    });
});
