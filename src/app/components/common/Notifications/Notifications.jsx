import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { NotificationStack } from 'react-notification';

let keyIndex = 0;

function defaultActiveBarStyleFactory(index, style) {
    return Object.assign(
      {},
      style,
      { bottom: `${2 + (index * 5)}rem` }
    );
  }

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
            ? notifications.toArray().map(notify => {
                  if (!notify.key) {
                      notify.key = ++keyIndex;
                  }
                  if (!notify.onClick) {
                      notify.onClick = (notification, deactivate) => {
                          deactivate();
                          removeNotification(notify.key);
                      };
                  }
                  return notify;
              })
            : [];

        return (
            <NotificationStack
                style={false}
                activeBarStyleFactory={defaultActiveBarStyleFactory}
                notifications={notificationsArray}
                onDismiss={notify => removeNotification(notify.key)}
            />
        );
    }
}
