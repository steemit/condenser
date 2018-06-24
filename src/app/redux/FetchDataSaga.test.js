import { api } from '@steemit/steem-js';
import { List, Map } from 'immutable';
import { call, fork, put } from 'redux-saga/effects';
import { fetchState, getPromotedState } from './FetchDataSaga';
import * as globalActions from './GlobalReducer';

describe('fetchState', () => {
    it('trending should get promoted state', () => {
        const pathname = '/trending';
        const generator = fetchState({ payload: { pathname } });
        let next = generator.next();
        expect(next.value).toEqual(fork(getPromotedState, pathname));
    });

    it('hot should get promoted state', () => {
        const pathname = '/hot';
        const generator = fetchState({ payload: { pathname } });
        let next = generator.next();
        expect(next.value).toEqual(fork(getPromotedState, pathname));
    });
});

describe('getPromotedState', () => {
    it('should do nothing if already fetched', () => {
        const pathname = '/trending';
        const generator = getPromotedState(pathname);

        const mockStore = {
            global: Map({}),
        };
        mockStore.global = mockStore.global.setIn(
            ['discussion_idx', '', 'promoted'],
            List(['post1'])
        );
        const selectAction = generator.next().value;
        expect(selectAction.SELECT.selector(mockStore)).toEqual(
            List(['post1'])
        );

        // continue saga with fetched data
        expect(generator.next(List(['post1'])).done).toBe(true);
    });
    it('should call api if not fetched', () => {
        const pathname = '/trending';
        const generator = getPromotedState(pathname);

        generator.next(); // SELECT
        // continue with empty data
        const callAction = generator.next();
        expect(callAction.value).toEqual(
            call([api, api.getStateAsync], '/promoted/')
        );
        const mockState = {};
        const putAction = generator.next(mockState);
        expect(putAction.value.PUT).toEqual(
            globalActions.receiveState(mockState)
        );
    });
    it('should call api with tag', () => {
        const pathname = '/hot/food';
        const generator = getPromotedState(pathname);

        const mockStore = {
            global: Map({}),
        };
        mockStore.global = mockStore.global.setIn(
            ['discussion_idx', 'food', 'promoted'],
            List(['food2'])
        );
        const selectAction = generator.next().value;
        expect(selectAction.SELECT.selector(mockStore)).toEqual(
            List(['food2'])
        );

        // continue saga with empty data instead of mocked value
        const callAction = generator.next();
        expect(callAction.value).toEqual(
            call([api, api.getStateAsync], '/promoted/food')
        );
        const mockState = {};
        const putAction = generator.next(mockState);
        expect(putAction.value.PUT).toEqual(
            globalActions.receiveState(mockState)
        );
    });
});
