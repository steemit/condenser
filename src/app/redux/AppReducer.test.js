import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';

import { Map, OrderedMap, getIn } from 'immutable';

import reducer, { defaultState, appActions } from './AppReducer';

chai.use(chaiImmutable);

const mockActions = {
    LOCATION_CHANGE: {
        type: '@@router/LOCATION_CHANGE',
        payload: {
            pathname: 'testPath',
        },
    },
    [appActions.STEEM_API_ERROR]: {
        type: appActions.STEEM_API_ERROR,
    },
    [appActions.FETCH_DATA_BEGIN]: {
        type: appActions.FETCH_DATA_BEGIN,
    },
    [appActions.FETCH_DATA_END]: {
        type: appActions.FETCH_DATA_END,
    },
    [appActions.ADD_NOTIFICATION]: {
        type: appActions.ADD_NOTIFICATION,
        payload: {
            key: 'testKey',
        },
    },
    [appActions.REMOVE_NOTIFICATION]: {
        type: appActions.REMOVE_NOTIFICATION,
        payload: {
            key: 'testKey',
        },
    },
    [appActions.UPDATE_NOTIFICOUNTERS]: {
        type: appActions.UPDATE_NOTIFICOUNTERS,
        payload: {
            follow: 1,
            total: 2,
        },
    },
    [appActions.SET_USER_PREFERENCES]: {
        type: appActions.SET_USER_PREFERENCES,
        payload: {
            cat: 'mymy',
            dog: 'polly',
        },
    },
    [appActions.TOGGLE_NIGHTMODE]: {
        type: appActions.TOGGLE_NIGHTMODE,
    },
    [appActions.TOGGLE_BLOGMODE]: {
        type: appActions.TOGGLE_BLOGMODE,
    },
};

const key = mockActions[appActions.ADD_NOTIFICATION].payload.key;
const mockNotification = OrderedMap({
    [key]: {
        action: 'missing translation: en.g.dismiss',
        dismissAfter: 10000,
        key,
    },
});

describe('App reducer', () => {
    it('should provide a nice initial state', () => {
        const initial = reducer();
        expect(initial).to.equal(defaultState);
    });
    it('should return correct state for a LOCATION_CHANGE action', () => {
        const initial = reducer();
        const actual = reducer(initial, mockActions['LOCATION_CHANGE']);
        const out = actual.get('location');
        expect(out.pathname).to.eql(
            mockActions['LOCATION_CHANGE'].payload.pathname
        );
    });
    it('should return correct state for a STEEM_API_ERROR action', () => {
        const initial = reducer();
        const out = reducer(initial, mockActions[appActions.STEEM_API_ERROR]);
        expect(out).to.eql(initial);
    });
    it('should return correct state for a FETCH_DATA_BEGIN action', () => {
        const initial = reducer();
        const actual = reducer(
            initial,
            mockActions[appActions.FETCH_DATA_BEGIN]
        );
        const out = actual.get('loading');
        expect(out).to.eql(true);
    });
    it('should return correct state for a FETCH_DATA_END action', () => {
        const initial = reducer();
        const actual = reducer(initial, mockActions[appActions.FETCH_DATA_END]);
        const out = actual.get('loading');
        expect(out).to.eql(false);
    });
    it('should return correct state for a ADD_NOTIFICATION action', () => {
        const initial = reducer();
        const actual = reducer(
            initial,
            mockActions[appActions.ADD_NOTIFICATION]
        );
        const out = actual.getIn(['notifications', key]);
        expect(out).to.eql(mockNotification.get(key));
    });
    it('should return correct state for a REMOVE_NOTIFICATION action', () => {
        const initial = reducer();
        const initialWithNotification = initial.set(
            'notifications',
            mockNotification
        );
        const actual = reducer(
            initialWithNotification,
            mockActions[appActions.REMOVE_NOTIFICATION]
        );
        const out = actual.get('notifications');
        const expected = OrderedMap({});
        expect(out).to.eql(expected);
    });
    it('should return correct state for a UPDATE_NOTIFICOUNTERS action with a follow in payload', () => {
        const initial = reducer();
        let actual = reducer(
            initial,
            mockActions[appActions.UPDATE_NOTIFICOUNTERS]
        );
        let out = actual.get('notificounters');
        let expected = Map({ follow: 0, total: 1 });
        expect(out).to.eql(expected);
    });
    it('should return correct state for a UPDATE_NOTIFICOUNTERS action with no follow in payload', () => {
        const initial = reducer();
        mockActions[appActions.UPDATE_NOTIFICOUNTERS].payload = {
            follow: 0,
            total: 2,
        };
        const actual = reducer(
            initial,
            mockActions[appActions.UPDATE_NOTIFICOUNTERS]
        );
        const out = actual.get('notificounters');
        const expected = Map({ follow: 0, total: 2 });
        expect(out).to.eql(expected);
    });
    it('should return correct state for a SET_USER_PREFERENCES action', () => {
        const initial = reducer();
        let actual = reducer(
            initial,
            mockActions[appActions.SET_USER_PREFERENCES]
        );
        let out = actual.get('user_preferences');
        let expected = Map({ cat: 'mymy', dog: 'polly' });
        expect(out).to.eql(expected);
    });
    it('should return correct state for a TOGGLE_NIGHTMODE action', () => {
        const initial = reducer();
        const before = initial.getIn(['user_preferences', 'nightmode']);
        let actual = reducer(initial, mockActions[appActions.TOGGLE_NIGHTMODE]);
        const after = actual.getIn(['user_preferences', 'nightmode']);
        expect(after).to.eql(!before);
    });
    it('should return correct state for a TOGGLE_BLOGMODE action', () => {
        const initial = reducer();
        const before = initial.getIn(['user_preferences', 'blogmode']);
        let actual = reducer(initial, mockActions[appActions.TOGGLE_BLOGMODE]);
        const after = actual.getIn(['user_preferences', 'blogmode']);
        expect(after).to.eql(!before);
    });
});
