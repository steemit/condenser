import { fromJS, Set } from 'immutable';

import {
    normalizeSettingsFromApi,
    denormalizeSettingsToApi,
    fetchNotifications,
} from './YoApiClient';

import apiMockData from './YoMockData';

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
        expect(normalized.toJS()).toEqual(desired.settings);
    });
});

describe('denormalizeSettingsToApi', () => {
    it('should take redux state and turn it into something the api can gobble up', () => {
        const denormalized = denormalizeSettingsToApi(fromJS(desired.settings));
        expect(denormalized).toEqual(apiMockData.saved_transports.result);
    });
});

describe('fetchNotifications', () => {
    it('should return fetched notifications', async () => {
        const res = await fetchNotifications({ username: 'good' });
        expect(res).toEqual(apiMockData.get_notifications.result);
    });

    it('should validate incoming notifications and only return good ones', async () => {
        const res = await fetchNotifications({ username: 'bad' });
        expect(res.length).toEqual(1);
    });
});
