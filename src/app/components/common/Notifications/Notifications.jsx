import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { NotificationStack } from 'react-notification';

let keyIndex = 0;

@connect(
    state => ({
        notifications: state.app.get('notifications'),
    }),
    dispatch => ({
        removeNotification: key => dispatch({ type: 'REMOVE_NOTIFICATION', payload: { key } }),
    })
)
export default class Notifications extends Component {
    static propTypes = {
        notifications: PropTypes.object,
        removeNotification: PropTypes.func,
    };

    render() {
        const { notifications, removeNotification } = this.props;

        const notificationsArray = notifications
            ? notifications.toArray().map(n => {
                  if (!n.key) {
                      n.key = ++keyIndex;
                  }
                  n.onClick = () => removeNotification(n.key);
                  return n;
              })
            : [];

        return (
            <NotificationStack
                style={false}
                notifications={notificationsArray}
                onDismiss={n => removeNotification(n.key)}
            />
        );
    }
}
