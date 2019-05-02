/* global describe, it, before, beforeEach, after, afterEach */

import { call, select, all, takeEvery } from 'redux-saga/effects';
import steem, { api, broadcast } from '@steemit/steem-js';
import { cloneableGenerator } from 'redux-saga/utils';
import * as transactionActions from 'app/redux/TransactionReducer';
import {
    preBroadcast_comment,
    createPermlink,
    createPatch,
    transactionWatches,
    broadcastOperation,
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
    describe('watch user actions and trigger appropriate saga', () => {
        const gen = transactionWatches;
        it('should call the broadcastOperation saga with every transactionActions.BROADCAST_OPERATION action', () => {
            expect(gen).toEqual([
                takeEvery(
                    transactionActions.BROADCAST_OPERATION,
                    broadcastOperation
                ),
            ]);
        });
    });

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
