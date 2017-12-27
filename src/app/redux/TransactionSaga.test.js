/* global describe, it, before, beforeEach, after, afterEach */

import chai, { expect } from 'chai';
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
            expect(actual).to.eql(undefined);
        });
        it('should return the patch that reconciles two different strings', () => {
            const testString =
                'there is something interesting going on here that I do not fully understand it is seemingly complex but it is actually quite simple';
            const actual = createPatch(testString, testString + 'ILU');
            expect(actual).to.eql(
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
            expect(actual).to.eql(expected);
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
            expect(actual).to.eql(expected);
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
            expect(actual).to.eql(expected);
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
            expect(actual).to.have.all.keys('@@redux-saga/IO', 'SELECT');
        });
        it('should return the operation unchanged if it has no memo attribute', () => {
            let gen = preBroadcast_transfer(arg);
            const actual = gen.next().value;
            expect(actual).to.eql(operationSansMemo);
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
            expect(actual).to.eql(mockCall);
        });
        it('should return a string containing the transformed data from the api', () => {
            const permlink = gen.next({ body: 'test' }).value;
            expect(permlink).to.contain('test'); // TODO: cannot deep equal due to date stamp at runtime.
        });
        it('should generate own permlink, independent of api if title is empty', () => {
            const gen2 = createPermlink(
                '',
                operation.author,
                operation.parent_author,
                operation.parent_permlink
            );
            const actual = gen2.next().value;
            expect(actual).to.contain(
                `re-${operation.parent_author}-${operation.parent_permlink}-`
            ); // TODO: cannot deep equal due to random hash at runtime.
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
            const expected = call([api, api.getContentAsync], operation.author, operation.title);
            expect(expected).to.eql(actual);
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
                        title: new Buffer((operation.title || '').trim(), 'utf-8'),
                        body: new Buffer(operation.body, 'utf-8'), // TODO: new Buffer is deprecated, prefer Buffer.from()
                    },
                ],
            ];
            expect(actual).to.eql(expected);
        });
        it('should return a patch as body value if patch is smaller than body.', () => {
            const originalBod = operation.body + 'minor difference';
            operation.__config.originalBody = originalBod;
            gen = preBroadcast_comment({ operation, username });
            gen.next(operation.title, operation.author, operation.parent_author, operation.parent_permlink);
            const actual = gen.next('mock-permlink-123').value;
            const expected = Buffer.from(
                createPatch(originalBod, operation.body),
                'utf-8'
            );
            expect(actual[0][1].body).to.eql(expected);
        });
        it('should return body as body value if patch is larger than body.', () => {
            const originalBod = 'major difference';
            operation.__config.originalBody = originalBod;
            gen = preBroadcast_comment({ operation, username });
            gen.next(operation.title, operation.author, operation.parent_author, operation.parent_permlink);
            const actual = gen.next('mock-permlink-123').value;
            const expected = Buffer.from(operation.body, 'utf-8');
            expect(actual[0][1].body).to.eql(expected, 'utf-8');
        });
        it('should include comment_options and autoVote if specified.', () => {
            operation.__config.comment_options = true;
            operation.__config.autoVote = true;
            gen = preBroadcast_comment({ operation, username });
            gen.next(operation.title, operation.author, operation.parent_author, operation.parent_permlink);
            const actual = gen.next('mock-permlink-123').value;
            const expectedCommentOptions = [
                'comment_options',
                {
                    author: operation.author,
                    permlink: 'mock-permlink-123',
                    max_accepted_payout: ['1000000.000', DEBT_TICKER].join(' '),
                    percent_steem_dollars: 10000,
                    allow_votes: true,
                    allow_curation_rewards: true,
                    extensions: [],
                },
            ];
            const expectedAutoVoteOptions = [
                'vote',
                {
                    voter: operation.author,
                    author: operation.author,
                    permlink: 'mock-permlink-123',
                    weight: 10000,
                },
            ];
            expect(actual[1]).to.eql(expectedCommentOptions);
            expect(actual[2]).to.eql(expectedAutoVoteOptions);
        });
    });
});
