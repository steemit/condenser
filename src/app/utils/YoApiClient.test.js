/* eslint no-undef:0 no-unused-vars:0 */
/* global describe, it, before, beforeEach, after, afterEach */
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';

import { fromJS, Set } from 'immutable';

import {
    normalizeSettingsFromApi,
    denormalizeSettingsToApi,
} from './YoApiClient';

chai.use(chaiImmutable);

const apiMockData = {
    get_transports: {
        id: 1,
        jsonrpc: '2.0',
        result: {
            email: {
                notification_types: [
                    'account_update',
                    'power_down',
                    'security_new_mobile_device',
                    'security_withrawal',
                    'security_password_changed',
                    'receive',
                    'reward',
                    'send',
                    'post_reply'
                ],
                sub_data: 'test@example.com'
            },
            wwwpoll: {
                notification_types: null,
                sub_data: '',
            }
        },
    },
    saved_transports: {
        id: 1,
        jsonrpc: '2.0',
        result: {
            email: {
                notification_types: [
                    'account_update',
                    'power_down',
                    'security_new_mobile_device',
                    'security_withrawal',
                    'security_password_changed',
                    'receive',
                    'reward',
                    'send',
                    'post_reply'
                ],
                sub_data: 'test@example.com'
            },
            wwwpoll: {
                notification_types: [
                    'account_update',
                    'power_down',
                    'security_new_mobile_device',
                    'security_withrawal',
                    'security_password_changed',
                    'receive',
                    'reward',
                    'send',
                    'mention',
                    'feed',
                    'resteem',
                ],
                sub_data: ''
            }
        },
    },
};

const desired = {
    email: {
        notification_types: {
            security: true,
            wallet: true,
            postReplies: true,
            commentReplies: false,
            mentions: false,
            newPosts: false,
            resteems: false
        },
        sub_data: 'test@example.com',
    },
    wwwpoll: {
        notification_types: {
            security: true,
            wallet: true,
            postReplies: false,
            commentReplies: false,
            mentions: true,
            newPosts: true,
            resteems: true,
        },
        sub_data: '',
    },
};

describe('normalizeSettingsFromApi', () => {
    it('should take api output & turn it into something useful in the frontend', () => {
        const normalized = normalizeSettingsFromApi(apiMockData.get_transports.result);
        expect(normalized.toJS()).to.deep.equal(desired);
    });
});

describe('denormalizeSettingsToApi', () => {
    it('should take redux state and turn it into something the api can gobble up', () => {
        const denormalized = denormalizeSettingsToApi(fromJS(desired));
        expect(denormalized).to.deep.equal(apiMockData.saved_transports.result);
    });
});