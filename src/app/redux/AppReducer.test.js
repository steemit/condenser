import { Map, OrderedMap, getIn } from 'immutable';

import reducer, {
    defaultState,
    steemApiError,
    fetchDataBegin,
    fetchDataEnd,
    addNotification,
    removeNotification,
    setUserPreferences,
    receiveFeatureFlags,
    selectors,
    toggleNightmode,
    toggleBlogmode,
} from './AppReducer';

const mockPayloads = {
    addNotification: {
        key: 'testKey',
    },
    removeNotification: {
        pathname: 'testPath',
    },
    removeNotification: {
        key: 'testKey',
    },
    setUserPreferences: {
        cat: 'mymy',
        dog: 'polly',
    },
};

const mockActions = {
    LOCATION_CHANGE: {
        type: '@@router/LOCATION_CHANGE',
        payload: {
            pathname: 'testPath',
        },
    },
};

const key = mockPayloads.addNotification.key;
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
        expect(initial).toBe(defaultState);
    });
    it('should return correct state for a LOCATION_CHANGE action', () => {
        const initial = reducer();
        const actual = reducer(initial, mockActions['LOCATION_CHANGE']);
        const out = actual.get('location');
        expect(out.pathname).toEqual(
            mockActions['LOCATION_CHANGE'].payload.pathname
        );
    });
    it('should return correct state for a STEEM_API_ERROR action', () => {
        const initial = reducer();
        const out = reducer(initial, steemApiError());
        expect(out).toEqual(initial);
    });
    it('should return correct state for a FETCH_DATA_BEGIN action', () => {
        const initial = reducer();
        const actual = reducer(initial, fetchDataBegin());
        const out = actual.get('loading');
        expect(out).toEqual(true);
    });
    it('should return correct state for a FETCH_DATA_END action', () => {
        const initial = reducer();
        const actual = reducer(initial, fetchDataEnd());
        const out = actual.get('loading');
        expect(out).toEqual(false);
    });
    it('should return correct state for a ADD_NOTIFICATION action', () => {
        const initial = reducer();
        const actual = reducer(
            initial,
            addNotification(mockPayloads.addNotification)
        );
        const out = actual.getIn(['notifications', key]);
        expect(out).toEqual(mockNotification.get(key));
    });
    it('should return correct state for a REMOVE_NOTIFICATION action', () => {
        const initial = reducer();
        const initialWithNotification = initial.set(
            'notifications',
            mockNotification
        );
        const actual = reducer(
            initialWithNotification,
            removeNotification(mockPayloads.removeNotification)
        );
        const out = actual.get('notifications');
        const expected = OrderedMap();
        expect(out).toEqual(expected);
    });
    it('should return correct state for a SET_USER_PREFERENCES action', () => {
        const initial = reducer();
        let actual = reducer(
            initial,
            setUserPreferences(mockPayloads.setUserPreferences)
        );
        let out = actual.get('user_preferences');
        let expected = Map({ cat: 'mymy', dog: 'polly' });
        expect(out).toEqual(expected);
    });
    it('should return correct state for a TOGGLE_NIGHTMODE action', () => {
        const initial = reducer();
        const before = initial.getIn(['user_preferences', 'nightmode']);
        let actual = reducer(initial, toggleNightmode());
        const after = actual.getIn(['user_preferences', 'nightmode']);
        expect(after).toEqual(!before);
    });
    it('should return correct state for a TOGGLE_BLOGMODE action', () => {
        const initial = reducer();
        const before = initial.getIn(['user_preferences', 'blogmode']);
        let actual = reducer(initial, toggleBlogmode());
        const after = actual.getIn(['user_preferences', 'blogmode']);
        expect(after).toEqual(!before);
    });
    test('should merge in received feature flags', () => {
        // Arrange
        const initial = reducer();

        // Act
        const withFlags = reducer(
            initial,
            receiveFeatureFlags({
                flying: true,
            })
        );
        const withMoreFlags = reducer(
            withFlags,
            receiveFeatureFlags({
                swimming: false,
            })
        );

        // Assert
        expect(selectors.getFeatureFlag(withMoreFlags, 'swimming')).toEqual(
            false
        );
        expect(selectors.getFeatureFlag(withMoreFlags, 'flying')).toEqual(true);
        expect(selectors.getFeatureFlag(withMoreFlags, 'dancing')).toEqual(
            false
        );
    });
});
