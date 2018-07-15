import { Map } from 'immutable';
import { api } from '@steemit/steem-js';
import types, {
    settingsInitFalse,
    toggleNotificationGroups,
} from 'app/components/elements/notification/type';

/**
 * Re-formats API notifications response a little bit.
 *
 * @param {Array} res
 *
 * @return {Array}
 */
export const normalize = res =>
    res.map(fromApi => {
        const normalized = {
            ...fromApi,
            id: fromApi.notify_id.toString(),
            notificationType: fromApi.notify_type,
        };

        delete normalized.notify_id;
        delete normalized.notify_type;

        if (fromApi.data.item && fromApi.data.item.parent_summary) {
            normalized.data.item.parentSummary =
                fromApi.data.item.parent_summary;
            delete normalized.data.item.parent_summary;
        }

        return normalized;
    });

/**
 * Cleans up settings from Yo.
 *
 * If notification_types is null, assume we need to set defaults.
 *
 * @param {Object} transportsFromApi transports part of the payload from api
 * @return {Object}
 */
export function normalizeSettingsFromApi(transportsFromApi) {
    // For each of the transports coming through from the API,
    // If the API's notification_types is truthy,
    // Transform array of enabled types into a Map based on our type->group mapping config,
    // And assign it to our output Map.
    // If incoming settings is null, assign default types.
    return Object.keys(transportsFromApi).reduce((transports, transport) => {
        const typesFromApi =
            transportsFromApi[transport].notification_types !== null
                ? transportsFromApi[transport].notification_types
                : types.filter(t => {
                      return settingsInitFalse.indexOf(t) === -1;
                  });

        const groups = toggleNotificationGroups;

        return transports
            .setIn(
                [transport, 'notification_types'],
                Object.keys(groups).reduce((acc, k) => {
                    return acc.set(k, typesFromApi.indexOf(groups[k][0]) > -1);
                }, Map())
            )
            .setIn(
                [transport, 'sub_data'],
                transportsFromApi[transport].sub_data
            );
    }, Map());
}

export function denormalizeSettingsToApi(settings) {
    return settings
        .entrySeq()
        .toJS()
        .reduce((transports, transport) => {
            return {
                ...transports,
                [transport[0]]: {
                    notification_types: transport[1]
                        .get('notification_types')
                        .reduce((transportTypes, enabled, type) => {
                            return enabled
                                ? [
                                      ...transportTypes,
                                      ...toggleNotificationGroups[type],
                                  ]
                                : transportTypes;
                        }, []),
                    sub_data: transport[1].get('sub_data'),
                },
            };
        }, {});
}

/**
 * Builds the request body for a Jussi API call.
 *
 * @param {String} method
 * @param {Object} params
 */
const buildJussiRequest = (method, params) => ({
    method: 'post',
    credentials: 'same-origin',
    headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
    },
    body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
    }),
});

/**
 * Requests notifications from Yo.
 *
 * @param {Object} options
 * @param {String} options.username
 * @param {String} [options.before] created before timestamp, formatted like 2017-10-12T21:25:06.964364
 * @param {String} [options.after] modified after timestamp, formatted like 2017-10-12T21:25:06.964364
 * @param {String[]} [options.types] only these notification types
 * @return {Object} normalized notifications, or if error, an object with error property
 */
export async function fetchNotifications({ username, before, after, types }) {
    const optionalParams = {};
    if (after) optionalParams.updated_after = after;
    if (before) optionalParams.created_before = before;
    if (types) optionalParams.notify_types = types;

    const res = api.callAsync('yo.get_notifications', {
        username,
        ...optionalParams,
    });

    if (res.result && res.result.length > 0) {
        return normalize(res.result);
    }

    return [];
}

export const markAsRead = async ids => api.callAsync('yo.mark_read', ids);

export const markAsUnread = async ids => api.callAsync('yo.mark_unread', ids);

export const markAsShown = async ids => api.callAsync('yo.mark_shown', ids);

/**
 *
 * @param {String} username
 * @return {Map|Object} if error, object w/ error prop
 */
export async function getNotificationSettings(username) {
    const res = api.callAsync('yo.get_transports', { username });
    return normalizeSettingsFromApi(res.result);
}

/**
 *
 * @param {String} username
 * @param {Object} settings
 * @return {Map|Object} if error, object w/ error prop
 */
export async function saveNotificationSettings(username, settings) {
    const res = api.callAsync(
        'yo.set_transports',
        username,
        denormalizeSettingsToApi(settings)
    );
    return normalizeSettingsFromApi(res.result);
}
