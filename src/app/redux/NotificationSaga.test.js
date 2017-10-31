/* eslint no-undef:0 no-unused-vars:0 */
/* global describe, it, before, beforeEach, after, afterEach */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import { call, put, select } from 'redux-saga/effects';
import { fetchNotifications } from 'app/utils/YoApiClient';
import { fetchAll, fetchSome, getUsernameFromState, getNotificationsById } from './NotificationSaga';

describe('fetchAll', () => {
    it('should get the username from state', () => {
        const gen = fetchAll();

        const withUsername = gen.next().value;
        expect(withUsername).to.deep.equal(select(getUsernameFromState));

        const withPayload = gen.next('basil frankenweiler').value;
        expect(withPayload).to.deep.equal(call(fetchNotifications, 'basil frankenweiler'));

        const fetch = gen.next({ data: 'from online' }).value;
        expect(fetch).to.deep.equal(put({ type: 'notification/RECEIVE_ALL', payload: { data: 'from online' } }));

        const done = gen.next();
        expect(done).to.deep.equal({ done: true, value: undefined });
    });
});

describe('fetchSome', () => {
    it('should work with sane defaults', () => {
        const gen = fetchSome({});

        const withUsername = gen.next().value;
        expect(withUsername).to.deep.equal(select(getUsernameFromState));

        const withNotifsNoFilter = gen.next().value;
        expect(withNotifsNoFilter).to.deep.equal(select(getNotificationsById));

        const callFetch = gen.next().value;
        expect(callFetch.CALL.args).to.contain('after');
    });
});