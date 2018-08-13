import { NOTIFICATION_ONLINE_ADD_NOTIFICATION } from 'src/app/redux/constants/notificationsOnline';

export const addNotificationOnline = payload => ({
    type: NOTIFICATION_ONLINE_ADD_NOTIFICATION,
    payload,
});
