import React from 'react';
import NotificationOnlineContent from 'src/app/components/common/NotificationOnlineContent';
import Icon from 'golos-ui/Icon';

import { NOTIFICATION_ONLINE_ADD_NOTIFICATION } from 'src/app/redux/constants/notificationsOnline';

export const createAddNotificationOnlineAction = (props) => {
    const baseStyles = {
        display: 'flex',
        alignItems: 'center',
        left: 'auto',
        background: '#FFFFFF',
        borderRadius: '6px',
        paddingTop: '0',
        paddingBottom: '0',
        paddingLeft: '20px',
        paddingRight: '20px',
        lineHeight: '1',
        minHeight: '60px',
    };

    return {
        type: 'ADD_NOTIFICATION',
        payload: {
            barStyle: {
                ...baseStyles,
                right: '-100%',
            },
            activeBarStyle: {
                ...baseStyles,
                right: '2.5rem',
            },
            actionStyle: {
                display: 'flex',
                alignItems: 'center',
                marginLeft: '18px',
                cursor: 'pointer',
            },
            key: 'chain_' + Date.now(),
            message: <NotificationOnlineContent {...props} />,
            action: <Icon name="cross" size="14" style={{ color: '#E1E1E1' }} />,
            dismissAfter: 15000,
        }
    };
}

export const addNotificationOnline = payload => ({
    type: NOTIFICATION_ONLINE_ADD_NOTIFICATION,
    payload,
});


