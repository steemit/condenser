/* global describe, it, before, beforeEach, after, afterEach */

import { call, select } from 'redux-saga/effects';
import { api } from '@steemit/steem-js';
import {
    preBroadcast_comment,
    createPermlink,
    createPatch,
    watchForBroadcast,
    watchForUpdateAuthorities,
    watchForUpdateMeta,
    watchForRecoverAccount,
    preBroadcast_transfer,
} from './TransactionSaga';
import { DEBT_TICKER } from 'app/client_config';

import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

configure({ adapter: new Adapter() });

const operation = {
    type: 'comment',
    author: 'Alice',
    body:
        "The Body is a pretty long chunck of text that represents the user's voice, it seems they have much to say, and this is one place where they can do that.",
    category: 'hi',
    json_metadata: {
        tags: ['hi'],
        app: 'steemit/0.1',
        format: 'markdown',
    },
    parent_author: 'candide',
    parent_permlink: 'cool',
    title: 'test',
    __config: {},
    errorCallback: () => '',
    successCallback: () => '',
    memo: '#testing',
};

const username = 'Beatrice';

describe('TransactionSaga', () => {
    describe('createPatch', () => {
        it('should return undefined if empty arguments are passed', () => {
            const actual = createPatch('', '');
            expect(actual).toEqual(undefined);
        });
        it('should return the patch that reconciles two different strings', () => {
            const testString =
                'there is something interesting going on here that I do not fully understand it is seemingly complex but it is actually quite simple';
            const actual = createPatch(testString, testString + 'ILU');
            expect(actual).toEqual(
                '@@ -120,12 +120,15 @@\n quite simple\n+ILU\n'
            );
        });
    });

    describe('watchForBroadcast', () => {
        const gen = watchForBroadcast();
        it('should call takeEvery with BROADCAST_OPERATION', () => {
            const actual = gen.next().value;
            const expected = {
                '@@redux-saga/IO': true,
                TAKE: 'transaction/BROADCAST_OPERATION',
            };
            expect(actual).toEqual(expected);
        });
    });

    describe('watchForUpdateAuthorities', () => {
        const gen = watchForUpdateAuthorities();
        it('should call takeEvery with UPDATE_AUTHORITIES', () => {
            const actual = gen.next().value;
            const expected = {
                '@@redux-saga/IO': true,
                TAKE: 'transaction/UPDATE_AUTHORITIES',
            };
            expect(actual).toEqual(expected);
        });
    });

    describe('watchForUpdateMeta', () => {
        const gen = watchForUpdateMeta();
        it('should call takeEvery with UPDATE_META', () => {
            const actual = gen.next().value;
            const expected = {
                '@@redux-saga/IO': true,
                TAKE: 'transaction/UPDATE_META',
            };
            expect(actual).toEqual(expected);
        });
    });

    describe('preBroadcast_transfer', () => {
        const operationSansMemo = {
            ...operation,
            memo: undefined,
        };
        const arg = { operation: operationSansMemo };
        it('should return select object if it has a memo attribute with string value starting with #', () => {
            const genR = preBroadcast_transfer({ operation });
            const actual = genR.next().value;
            const expected = select(state =>
                state.user.getIn(['current', 'private_keys', 'memo_private'])
            );
            expect(Object.keys(actual)).toEqual(['@@redux-saga/IO', 'SELECT']);
        });
        it('should return the operation unchanged if it has no memo attribute', () => {
            let gen = preBroadcast_transfer(arg);
            const actual = gen.next().value;
            expect(actual).toEqual(operationSansMemo);
        });
    });

    describe('createPermlink', () => {
        const gen = createPermlink(
            operation.title,
            operation.author,
            operation.parent_author,
            operation.parent_permlink
        );
        it('should call the api to get a permlink if the title is valid', () => {
            const actual = gen.next().value;
            const mockCall = call(
                [api, api.getContentAsync],
                operation.author,
                operation.title
            );
            expect(actual).toEqual(mockCall);
        });
        it('should return a string containing the transformed data from the api', () => {
            const permlink = gen.next({ body: 'test' }).value;
            expect(permlink.indexOf('test') > -1).toEqual(true); // TODO: cannot deep equal due to date stamp at runtime.
        });
        it('should generate own permlink, independent of api if title is empty', () => {
            const gen2 = createPermlink(
                '',
                operation.author,
                operation.parent_author,
                operation.parent_permlink
            );
            const actual = gen2.next().value;
            expect(
                actual.indexOf(
                    `re-${operation.parent_author}-${
                        operation.parent_permlink
                    }-`
                ) > -1
            ).toEqual(true); // TODO: cannot deep equal due to random hash at runtime.
        });
    });

    describe('preBroadcast_comment', () => {
        let gen = preBroadcast_comment({ operation, username });

        it('should call createPermlink', () => {
            const permlink = gen.next(
                operation.title,
                operation.author,
                operation.parent_author,
                operation.parent_permlink
            ).value;
            const actual = permlink.next().value;
            const expected = call(
                [api, api.getContentAsync],
                operation.author,
                operation.title
            );
            expect(expected).toEqual(actual);
        });
        it('should return the comment options array.', () => {
            let actual = gen.next('mock-permlink-123').value;
            const expected = [
                [
                    'comment',
                    {
                        author: operation.author,
                        category: operation.category,
                        errorCallback: operation.errorCallback,
                        successCallback: operation.successCallback,
                        parent_author: operation.parent_author,
                        parent_permlink: operation.parent_permlink,
                        type: operation.type,
                        __config: operation.__config,
                        memo: operation.memo,
                        permlink: 'mock-permlink-123',
                        json_metadata: JSON.stringify(operation.json_metadata),
                        title: new Buffer(
                            (operation.title || '').trim(),
                            'utf-8'
                        ),
                        body: new Buffer(operation.body, 'utf-8'), // TODO: new Buffer is deprecated, prefer Buffer.from()
                    },
                ],
            ];
            expect(actual).toEqual(expected);
        });
        it('should return a patch as body value if patch is smaller than body.', () => {
            const originalBod = operation.body + 'minor difference';
            operation.__config.originalBody = originalBod;
            gen = preBroadcast_comment({ operation, username });
            gen.next(
                operation.title,
                operation.author,
                operation.parent_author,
                operation.parent_permlink
            );
            const actual = gen.next('mock-permlink-123').value;
            const expected = Buffer.from(
                createPatch(originalBod, operation.body),
                'utf-8'
            );
            expect(actual[0][1].body).toEqual(expected);
        });
        it('should return body as body value if patch is larger than body.', () => {
            const originalBod = 'major difference';
            operation.__config.originalBody = originalBod;
            gen = preBroadcast_comment({ operation, username });
            gen.next(
                operation.title,
                operation.author,
                operation.parent_author,
                operation.parent_permlink
            );
            const actual = gen.next('mock-permlink-123').value;
            const expected = Buffer.from(operation.body, 'utf-8');
            expect(actual[0][1].body).toEqual(expected, 'utf-8');
        });
    });
});
