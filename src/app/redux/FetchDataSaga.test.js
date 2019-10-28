import { call, put } from 'redux-saga/effects';
import { api } from '@steemit/steem-js';
import { callBridge } from 'app/utils/steemApi';
import * as appActions from './AppReducer';
import * as globalActions from './GlobalReducer';
import constants from './constants';

import { fetchData } from './FetchDataSaga';

describe('FetchDataSaga', () => {
    describe('should fetch multiple and filter', () => {
        let payload = {
            order: 'blog',
            category: '@bob',
            author: 'alice',
            permlink: 'hair',
            postFilter: value => value.author === 'bob',
        };
        let action = {
            category: '',
            payload,
        };
        constants.FETCH_DATA_BATCH_SIZE = 2;
        const gen = fetchData(action);
        it('should signal data fetch', () => {
            const actual = gen.next().value;
            expect(actual).toEqual(
                put(
                    globalActions.fetchingData({
                        order: 'blog',
                        category: '@bob',
                    })
                )
            );
        });
        it('should call discussions by blog', () => {
            let actual = gen.next().value;
            expect(actual).toEqual(put(appActions.fetchDataBegin()));

            actual = gen.next().value;
            expect(actual).toEqual(
                call(callBridge, 'get_account_posts', {
                    sort: 'blog',
                    account: payload.category.slice(1),
                    limit: constants.FETCH_DATA_BATCH_SIZE,
                    start_author: payload.author,
                    start_permlink: payload.permlink,
                })
            );
        });
        it('should continue fetching data filtering 1 out', () => {
            let actual = gen.next([
                {
                    author: 'alice',
                },
                {
                    author: 'bob',
                    permlink: 'post1',
                },
            ]).value;
            expect(actual).toEqual(
                put(
                    globalActions.receiveData({
                        data: [
                            { author: 'alice' },
                            { author: 'bob', permlink: 'post1' },
                        ],
                        order: 'blog',
                        category: '@bob',
                        author: 'alice',
                        fetching: true,
                        endOfData: false,
                    })
                )
            );
        });
        it('should finish fetching data filtering 1 out', () => {
            let actual = gen.next().value;
            expect(actual).toEqual(
                call(callBridge, 'get_account_posts', {
                    sort: 'blog',
                    account: payload.category.slice(1),
                    limit: constants.FETCH_DATA_BATCH_SIZE,
                    start_author: 'bob',
                    start_permlink: 'post1',
                })
            );

            actual = gen.next([
                {
                    author: 'bob',
                    permlink: 'post2',
                },
            ]).value;
            expect(actual).toEqual(
                put(
                    globalActions.receiveData({
                        data: [{ author: 'bob', permlink: 'post2' }],
                        order: 'blog',
                        category: '@bob',
                        author: 'alice',
                        fetching: false,
                        endOfData: true,
                    })
                )
            );

            actual = gen.next().value;
            expect(actual).toEqual(put(appActions.fetchDataEnd()));
        });
    });
    describe('should not fetch more batches than max batch size', () => {
        let payload = {
            order: 'blog',
            author: 'alice',
            permlink: 'hair',
            category: '@bob',
            postFilter: value => value.author === 'bob',
        };
        let action = {
            category: '',
            payload,
        };
        constants.FETCH_DATA_BATCH_SIZE = 2;
        constants.MAX_BATCHES = 2;
        const gen = fetchData(action);

        let actual = gen.next().value;
        expect(actual).toEqual(
            put(
                globalActions.fetchingData({
                    order: 'blog',
                    category: '@bob',
                })
            )
        );

        actual = gen.next().value;
        expect(actual).toEqual(put(appActions.fetchDataBegin()));

        actual = gen.next().value;
        expect(actual).toEqual(
            call(callBridge, 'get_account_posts', {
                sort: 'blog',
                account: payload.category.slice(1),
                limit: constants.FETCH_DATA_BATCH_SIZE,
                start_author: payload.author,
                start_permlink: payload.permlink,
            })
        );

        // these all will not satisfy the filter
        actual = gen.next([
            {
                author: 'alice',
            },
            {
                author: 'alice',
            },
        ]).value;
        expect(actual).toEqual(
            put(
                globalActions.receiveData({
                    data: [{ author: 'alice' }, { author: 'alice' }],
                    order: 'blog',
                    category: '@bob',
                    author: 'alice',
                    fetching: true,
                    endOfData: false,
                })
            )
        );

        actual = gen.next().value;
        expect(actual).toEqual(
            call(callBridge, 'get_account_posts', {
                sort: 'blog',
                account: payload.category.slice(1),
                limit: constants.FETCH_DATA_BATCH_SIZE,
                start_author: 'alice',
            })
        );

        actual = gen.next([
            {
                author: 'alice',
            },
            {
                author: 'alice',
            },
        ]).value;
        expect(actual).toEqual(
            put(
                globalActions.receiveData({
                    data: [{ author: 'alice' }, { author: 'alice' }],
                    order: 'blog',
                    category: '@bob',
                    author: 'alice',
                    fetching: false,
                    endOfData: false,
                })
            )
        );

        actual = gen.next().value;
        expect(actual).toEqual(put(appActions.fetchDataEnd()));
    });
});
