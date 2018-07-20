import React, { Component } from 'react';

export const NotificationHOC = WrappedNotification => {
    return class HOC extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                timeOutId: null,
            };
        }
        componentDidMount() {
            const { notification } = this.props;
            if (!notification.shown) {
                const timeOutId = setTimeout(
                    () => this.props.markShown(notification.id),
                    3000
                );
                this.setState({
                    timeOutId: timeOutId,
                });
            }
        }
        componentWillUnmount() {
            clearTimeout(this.state.timeOutId);
        }
        render() {
            return <WrappedNotification {...this.props} />;
        }
    };
};
