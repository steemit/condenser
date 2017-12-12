/* eslint no-undef:0 no-unused-vars:0 */
/* global describe, it, before, beforeEach, after, afterEach */
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';

import { fromJS, Set } from 'immutable';

import {
    normalizeSettingsFromApi,
    denormalizeSettingsToApi,
    normalize,
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
                    'security_withdrawal',
                    'security_password_changed',
                    'receive',
                    'reward',
                    'send',
                    'post_reply',
                ],
                sub_data: 'test@example.com',
            },
            wwwpoll: {
                notification_types: null,
                sub_data: '',
            },
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
                    'security_withdrawal',
                    'security_password_changed',
                    'receive',
                    'reward',
                    'send',
                    'post_reply',
                ],
                sub_data: 'test@example.com',
            },
            wwwpoll: {
                notification_types: [
                    'account_update',
                    'power_down',
                    'security_new_mobile_device',
                    'security_withdrawal',
                    'security_password_changed',
                    'receive',
                    'reward',
                    'send',
                    'mention',
                    'feed',
                    'resteem',
                ],
                sub_data: '',
            },
        },
    },
    get_notifications: {
        jsonrpc: '2.0',
        id: 1,
        result: [
            {
                notify_id: 39,
                notify_type: 'power_down',
                created: '2017-10-27T01:31:29.382749',
                updated: '2017-10-27T01:31:29.382749',
                read: false,
                shown: false,
                username: 'test_user',
                data: {
                    author: 'roadscape',
                    amount: 10000.2,
                },
            },
            {
                notify_id: 55,
                notify_type: 'power_down',
                created: '2017-10-27T01:15:29.383842',
                updated: '2017-10-27T01:15:29.383842',
                read: false,
                shown: false,
                username: 'test_user',
                data: {
                    author: 'roadscape',
                    amount: 10000.2,
                    item: {
                        parent_summary: 'whatever',
                    },
                },
            },
        ],
    },
};

const desired = {
    settings: {
        email: {
            notification_types: {
                security: true,
                wallet: true,
                postReplies: true,
                commentReplies: false,
                mentions: false,
                newPosts: false,
                resteems: false,
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
    },
    get_notifications: [
        {
            created: '2017-10-27T01:31:29.382749',
            data: {
                amount: 10000.2,
                author: 'roadscape',
            },
            id: '39',
            notificationType: 'power_down',
            read: false,
            shown: false,
            updated: '2017-10-27T01:31:29.382749',
            username: 'test_user',
        },
        {
            created: '2017-10-27T01:15:29.383842',
            data: {
                amount: 10000.2,
                author: 'roadscape',
                item: {
                    parentSummary: 'whatever',
                },
            },
            id: '55',
            notificationType: 'power_down',
            read: false,
            shown: false,
            updated: '2017-10-27T01:15:29.383842',
            username: 'test_user',
        },
    ],
};

describe('normalizeSettingsFromApi', () => {
    it('should take api output & turn it into something useful in the frontend', () => {
        const normalized = normalizeSettingsFromApi(
            apiMockData.get_transports.result
        );
        expect(normalized.toJS()).to.deep.equal(desired.settings);
    });
});

describe('denormalizeSettingsToApi', () => {
    it('should take redux state and turn it into something the api can gobble up', () => {
        const denormalized = denormalizeSettingsToApi(fromJS(desired.settings));
        expect(denormalized).to.deep.equal(apiMockData.saved_transports.result);
    });
});

describe('normalize', () => {
    it('should clean up incoming notification data', () => {
        const normalized = normalize(apiMockData.get_notifications.result);
        expect(normalized).to.deep.equal(desired.get_notifications);
    });
});
