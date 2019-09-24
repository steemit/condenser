import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';

class NotificationsList extends React.Component {
    static propTypes = {
        notifications: PropTypes.object,
        username: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        loading: false,
    };

    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(
            this,
            'NotificationsList'
        );
    }

    componentWillMount() {
        const { username, notifications, getAccountNotifications } = this.props;
        if (username && !notifications) {
            getAccountNotifications(username);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, notifications, getAccountNotifications } = this.props;
        if (prevProps.username !== username && !notifications) {
            getAccountNotifications(username);
        }
    }

    render() {
        const { notifications, loading } = this.props;

        const renderNotifications = items =>
            items.map((item, i) => {
                return (
                    <li key={`notification_${i}`}>
                        {JSON.stringify(item.toJS())}
                    </li>
                );
            });

        return (
            <div id="posts_list" className="PostsList">
                {notifications && (
                    <ul className="PostsList__summaries hfeed" itemScope>
                        {renderNotifications(notifications)}
                    </ul>
                )}
                {loading && (
                    <center>
                        <LoadingIndicator
                            style={{ marginBottom: '2rem' }}
                            type="circle"
                        />
                    </center>
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        return {
            ...props,
        };
    },
    dispatch => ({
        getAccountNotifications: username => {
            return dispatch(
                fetchDataSagaActions.getAccountNotifications(username)
            );
        },
    })
)(NotificationsList);
