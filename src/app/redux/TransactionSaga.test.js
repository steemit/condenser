/* eslint no-undef:0 no-unused-vars:0 */
/* global describe, it, before, beforeEach, after, afterEach */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import { select } from 'redux-saga/effects';
import { call } from 'redux-saga/effects';
import { preBroadcast_comment, createPermlink } from './TransactionSaga';
import {api, broadcast, auth, memo} from '@steemit/steem-js';

const mockOperation = {
    author : "Alice",
    body : "2",
    category : "hi",
    json_metadata : {
        tags: ["hi"],
        app: "steemit/0.1",
        format: "markdown",
    },
    parent_author : "Candide",
    parent_permlink : "cool",
    title : "test",
    __config : {
        autoVote : false,
        originalBody : null,
    }
};
const operation = ({
    type: 'comment', 
    ...mockOperation,
    errorCallback: () => '',
    successCallback: () => '',
});
const username = 'Beatrice';

describe('createPermlink', () => {
    it('should call the api to get a permlink if the title is valid', () => {
        const gen = createPermlink(operation.title, operation.author, operation.parent_author, operation.parent_permlink);
        const permlinkApiCall = gen.next().value;
        expect(permlinkApiCall).to.deep.equal(call([api, api.getContentAsync], operation.author, operation.title))
        // Calling gen.next().value will fail.
    });

    it('should generate a permlink if no valid title is given', () => {
        const gen = createPermlink('', operation.author, operation.parent_author, operation.parent_permlink); // TODO: sometimes the parent_permlink is undefined and this breaks.
        const done = gen.next().value
        expect(done).to.contain(`re-candide-cool-`) // TODO: Make the timestamp generator its own testable function, 
    });
});

describe('preBroadcast_comment', () => {
    it('should call createPermlink', () => {
        const gen = preBroadcast_comment({operation, username});
        const permlink = gen.next(operation.title, operation.author, operation.parent_author, operation.parent_permlink).value;
        const permlinkCall = permlink.next().value
        const apiCall = call([api, api.getContentAsync], operation.author, operation.title);
        expect(permlinkCall).to.deep.equal(apiCall)
    });
});