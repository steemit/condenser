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

    onClickLoadMore = e => {
        e.preventDefault();
        const { username, notifications } = this.props;
        getAccountNotifications(username, notifications.last().get('id'));
    };

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
                        {renderNotifications(
                            notifications.get('notifications')
                        )}
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
                {!loading &&
                    notifications.get('isLastPage', false) && (
                        <center>
                            <a href="#" onClick={this.onClickLoadMore}>
                                Load more...
                            </a>
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
        getAccountNotifications: (username, last_id) => {
            const query = {
                account: username,
                limit: 5,
            };
            if (last_id) {
                query.last_id = last_id;
            }
            return dispatch(
                fetchDataSagaActions.getAccountNotifications(query)
            );
        },
    })
)(NotificationsList);
