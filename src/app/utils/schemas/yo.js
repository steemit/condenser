const operations = require('./operations');

const NotificationType = {
    power_down: 1,
    power_up: 2,
    resteem: 3,
    feed: 4,
    reward: 5,
    send: 6,
    mention: 7,
    follow: 8,
    vote: 9,
    comment_reply: 10,
    post_reply: 11,
    account_update: 12,
    message: 13,
    receive: 14,
};

const TransportType = {
    desktop: 1,
    email: 2,
    sms: 3,
};

const Priority = {
    low: 1,
    normal: 2,
    high: 3,
    always: 4,
};

const ActionStatus = {
    sent: 1,
    rate_limited: 2,
    failed: 3,
    perm_failed: 4,
};

const EventOrigin = {
    blockchain: 1,
    steemit: 2,
};

const EventPriority = {
    blockchain: 1,
    steemit: 2,
};

const NOTIFICATION_TYPES = Object.keys(NotificationType);
const TRANSPORT_TYPES = Object.keys(TransportType);
const EVENT_ORIGINS = Object.keys(EventOrigin);
const EVENT_PRIORITIES = Object.keys(EventPriority);

const upstreamDef = {
    $schema: 'http://json-schema.org/draft-06/schema#',
    $id: 'https://schema.steemit.com/yo/objects.json',
    title: 'notification transport schema',
    definitions: {
        ...operations,
        transport: {
            title: 'transport',
            type: 'object',
            properties: {
                transport: {
                    $ref: '#/definitions/transport_type',
                },
                notification_types: {
                    type: 'array',
                    uniqueItems: true,
                    items: {
                        $ref: '#/definitions/notification_type',
                    },
                },
                data: {
                    type: 'object',
                },
            },
            required: ['transport', 'notification_types'],
            additionalProperties: false,
        },
        notification: {
            title: 'notification schema',
            type: 'object',
            properties: {
                notify_id: {
                    type: 'number',
                },
                notify_type: {
                    $ref: '#/definitions/notification_type',
                },
                created: {
                    type: 'string',
                },
                updated: {
                    type: 'string',
                },
                read: {
                    type: 'boolean',
                },
                shown: {
                    type: 'boolean',
                },
                username: {
                    type: 'string',
                },
                to_username: {
                    type: 'string',
                },
                from_username: {
                    type: 'string',
                },
                data: {
                    type: 'object',
                    anyOf: Object.keys(operations).map(opName => ({
                        '#ref': `#/definitions/${opName}`,
                    })),
                },
                priority: {
                    $ref: '#/definitions/priority',
                },
            },
            required: [
                'notify_id',
                'notify_type',
                'created',
                'updated',
                'read',
                'shown',
                'username',
                'data',
            ],
            additionalProperties: false,
        },
        priority: {
            type: 'string',
            enum: EVENT_PRIORITIES,
        },
        notification_type: {
            type: 'string',
            enum: NOTIFICATION_TYPES,
        },
        transport_type: {
            type: 'string',
            enum: TRANSPORT_TYPES,
        },
        event_origin: {
            type: 'string',
            enum: EVENT_ORIGINS,
        },
        event_urn: {
            type: 'string',
        },
        event: {
            title: 'event schema',
            type: 'object',
            properties: {
                priority: {
                    $ref: '#/definitions/priority',
                },
                urn: {
                    $ref: '#/definitions/event_urn',
                },
                origin: {
                    $ref: '#/definitions/event_origin',
                },
                data: {
                    type: 'object',
                },
            },
            required: ['priority', 'urn', 'origin', 'data'],
            additionalProperties: false,
        },
    },
};

module.exports = {
    ...upstreamDef,
    ...upstreamDef.definitions.notification,
};
