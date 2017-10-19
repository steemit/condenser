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
        "id": 1,
        "jsonrpc": "2.0",
        "result": {
            "email": {
                "notification_types": [
                    "receive"
                ],
                "sub_data": "test@example.com"
            },
            "wwwpoll": {
                "notification_types": null,
                "sub_data": ''
            }
        },
    },
    saved_transports: {
        "id": 1,
        "jsonrpc": "2.0",
        "result": {
            "email": {
                "notification_types": [
                    "receive"
                ],
                "sub_data": "test@example.com"
            },
            "wwwpoll": {
                "notification_types": [
                    "power_down",
                    "power_up",
                    "resteem",
                    "receive",
                ],
                "sub_data": ''
            }
        },
    },
};

const desired = {
    email: {
        notification_types: {
            power_down: false,
            power_up: false,
            resteem: false,
            receive: true,
            default_to_false: false,
        },
        sub_data: "test@example.com",
    },
    wwwpoll: {
        notification_types: {
            power_down: true,
            power_up: true,
            resteem: true,
            receive: true,
            default_to_false: false,
        },
        sub_data: '',
    },
};
/*
const stored = Map({
    email: Map({
        notification_types: Map({
            power_down: false,
            power_up: false,
            resteem: false,
            receive: true,
            default_to_false: false,
        }),
    }),
    wwwpoll: Map({
        notification_types: Map({
            power_down: true,
            power_up: true,
            resteem: true,
            receive: true,
            default_to_false: false,
        }),
    }),
});*/

const types = [
    'power_down',
    'power_up',
    'resteem',
    'receive',
    'default_to_false',
];

const settingsInitFalse = ['default_to_false'];

describe('normalizeSettingsFromApi', () => {
    it('should take api output & turn it into something useful in the frontend', () => {
        const normalized = normalizeSettingsFromApi(apiMockData.get_transports.result, types, settingsInitFalse);
        expect(normalized.toJS()).to.deep.equal(desired);
    });
});

describe('denormalizeSettingsToApi', () => {
    it('should take redux state and turn it into something the api can gobble up', () => {
        const denormalized = denormalizeSettingsToApi(fromJS(desired));
        expect(denormalized).to.deep.equal(apiMockData.saved_transports.result);
    });
});