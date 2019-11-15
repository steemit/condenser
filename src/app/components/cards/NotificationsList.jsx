import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import ClaimBox from 'app/components/elements/ClaimBox';

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
        const { username, notifications, getAccountNotifications } = this.props;
        const lastId = notifications.getIn(['notifications', -1, 'id']);
        getAccountNotifications(username, lastId);
    };

    render() {
        const {
            notifications,
            loading,
            isOwnAccount,
            accountName,
        } = this.props;

        const renderItem = item => (
            <div
                key={item.id}
                style={{
                    padding: '0.5em 1em',
                    background: 'rgba(225,255,225,' + item.score + '%)',
                }}
            >
                <span style={{ opacity: '0.5' }}>
                    {item.type}
                    {' / '}
                </span>
                <strong>
                    <a href={`/${item.url}`}>{item.msg}</a>
                </strong>
                <br />
                <small>
                    <TimeAgoWrapper date={item.date + 'Z'} />
                </small>
            </div>
        );

        return (
            <div className="">
                {isOwnAccount && <ClaimBox accountName={accountName} />}
                {notifications && (
                    <div style={{ lineHeight: '1rem' }}>
                        {notifications
                            .get('notifications')
                            .map(item => renderItem(item.toJS()))}
                    </div>
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
                    notifications &&
                    !notifications.get('isLastPage', false) && (
                        <center>
                            <br />
                            <a href="#" onClick={this.onClickLoadMore}>
                                <strong>Load more...</strong>
                            </a>
                        </center>
                    )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const accountName = props.username;
        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == accountName;
        return {
            ...props,
            isOwnAccount,
            accountName,
        };
    },
    dispatch => ({
        getAccountNotifications: (username, last_id) => {
            const query = {
                account: username,
                limit: 50,
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
