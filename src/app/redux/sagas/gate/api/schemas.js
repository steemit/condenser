import { schema } from 'normalizr';

const notifySchema = new schema.Entity('notifies', {}, {
    idAttribute: '_id'
});

export default {
    NOTIFY: notifySchema,
    NOTIFY_ARRAY: [notifySchema],
};
