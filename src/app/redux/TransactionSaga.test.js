/* eslint no-undef:0 no-unused-vars:0 */
/* global describe, it, before, beforeEach, after, afterEach */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import { select, call } from 'redux-saga/effects';
import {
    preBroadcast_comment,
    createPermlink,
    createPatch
} from './TransactionSaga';
import {api, broadcast, auth, memo} from '@steemit/steem-js';
import { create } from 'domain';
import {DEBT_TICKER} from 'app/client_config';

const operation = ({
    type: 'comment', 
    author : "Alice",
    body : "The Body is a pretty long chunck of text that represents the user's voice, it seems they have much to say, and this is one place where they can do that.",
    category : "hi",
    json_metadata : {
        tags: ["hi"],
        app: "steemit/0.1",
        format: "markdown",
    },
    parent_author : "candide",
    parent_permlink : "cool",
    title : "test",
    __config : {},
    errorCallback: () => '',
    successCallback: () => '',
});

const {
    author,
    category,
    errorCallback,
    successCallback,
    parent_author,
    parent_permlink,
    type,
    __config,
    json_metadata,
    title,
    body,
} = operation;

const username = 'Beatrice';

describe('TransactionSaga', () => {
    describe('createPatch', () => {
        it('should return undefined if empty arguments are passed', () => {
            const result = createPatch('', '');
            expect(result).to.eql(undefined)
        });
        it('should return the patch that reconciles two different strings', () => {
            const testString = 'there is something interesting going on here that I do not fully understand it is seemingly complex but it is actually quite simple';
            const result = createPatch(testString, testString + 'ILU');
            expect(result).to.eql('@@ -120,12 +120,15 @@\n quite simple\n+ILU\n')
        });
    })

    describe('createPermlink', () => {
        const gen = createPermlink(operation.title, operation.author, operation.parent_author, operation.parent_permlink);
        it('should call the api to get a permlink if the title is valid', () => {
            const result = gen.next().value;
            const mockCall = call([api, api.getContentAsync], operation.author, operation.title);
            expect(result).to.eql(mockCall);
        });
        it('should return a string containing the transformed data from the api', () => {
            const permlink = gen.next({body: 'test'}).value;
            expect(permlink).to.contain('test'); // TODO: cannot deep equal due to date stamp at runtime.
        });
        it('should generate own permlink, independent of api if title is empty', () => {
            const gen2 = createPermlink('', operation.author, operation.parent_author, operation.parent_permlink);
            const result = gen2.next().value;
            expect(result).to.contain(`re-${parent_author}-${parent_permlink}-`); // TODO: cannot deep equal due to random hash at runtime.
        });
    });

    describe('preBroadcast_comment', () => {
        let gen = preBroadcast_comment({operation, username});

        it('should call createPermlink', () => {
            const permlink = gen.next(title, author, parent_author, parent_permlink).value;
            const expected = permlink.next().value
            const actual = call([api, api.getContentAsync],author, title);
            expect(expected).to.eql(actual)
        });
        it('should return the comment options array.', () => {
            let actual = gen.next('mock-permlink-123').value
            const expected = [['comment', {
                author,
                category,
                errorCallback,
                successCallback,
                parent_author,
                parent_permlink,
                type,
                __config,
                permlink: "mock-permlink-123",
                json_metadata: new Buffer(JSON.stringify(json_metadata), 'utf-8'),
                title: new Buffer((title || '').trim(), 'utf-8'),
                body: new Buffer(body, 'utf-8'), // TODO: new Buffer is deprecated, prefer Buffer.from()
            }]];
            expect(actual).to.eql(expected);
        });
        it('should return a patch as body value if patch is smaller than body.', () => {
            const originalBod = body + 'minor difference';
            operation.__config.originalBody = originalBod;
            gen = preBroadcast_comment({operation, username});
            gen.next(title, author, parent_author, parent_permlink);
            const actual = gen.next('mock-permlink-123').value
            const expected = Buffer.from(createPatch(originalBod, body), 'utf-8')
            expect(actual[0][1].body).to.eql(expected);
        });
        it('should return body as body value if patch is larger than body.', () => {
            const originalBod = 'major difference';
            operation.__config.originalBody = originalBod;
            gen = preBroadcast_comment({operation, username});
            gen.next(title, author, parent_author, parent_permlink);
            const actual = gen.next('mock-permlink-123').value
            const expected = Buffer.from(body, 'utf-8')
            expect(actual[0][1].body).to.eql(expected, 'utf-8'); 
        });
        it('should include comment_options and autoVote if specified.', () => {
            operation.__config.comment_options = true;
            operation.__config.autoVote = true;
            gen = preBroadcast_comment({operation, username});
            gen.next(title, author, parent_author, parent_permlink);
            const actual = gen.next('mock-permlink-123').value
            const expectedCommentOptions = ['comment_options', {
                author,
                permlink: 'mock-permlink-123',
                max_accepted_payout: ["1000000.000", DEBT_TICKER].join(" "),
                percent_steem_dollars: 10000, 
                allow_votes: true,
                allow_curation_rewards: true,
                extensions: [],
            }];
            const expectedAutoVoteOptions = ['vote', {
                voter: author,
                author,
                permlink: 'mock-permlink-123',
                weight: 10000,
            }];
            expect(actual[1]).to.eql(expectedCommentOptions);
            expect(actual[2]).to.eql(expectedAutoVoteOptions);
        });
    });
});