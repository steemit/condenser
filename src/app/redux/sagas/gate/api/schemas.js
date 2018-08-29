import { schema } from 'normalizr';

const notificationSchema = new schema.Entity('notifications', {}, {
    idAttribute: '_id'
});

export default {
    NOTIFICATION: notificationSchema,
    NOTIFICATION_ARRAY: [notificationSchema],
};
