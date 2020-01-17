import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { actions as fetchDataActions } from 'app/redux/FetchDataSaga';
import Callout from 'app/components/elements/Callout';

class PostNotificationsList extends React.Component {
    static propTypes = {
        notifications: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                type: PropTypes.string,
                score: PropTypes.number,
                date: PropTypes.date,
                msg: PropTypes.string,
                url: PropTypes.url,
            })
        ),
        author: PropTypes.string.isRequired,
        permlink: PropTypes.string.isRequired,
        loading: PropTypes.bool,
        fetchPostNotifications: PropTypes.func.isRequired,
    };

    static defaultProps = {
        notifications: [],
        loading: true,
    };

    constructor() {
        super();
    }

    componentWillMount() {
        const { author, permlink, fetchPostNotifications } = this.props;
        fetchPostNotifications(author, permlink);
    }

    render() {
        const { notifications, loading } = this.props;

        const renderItem = item => {
            return (
                <div
                    key={item.id}
                    className="Notification__item"
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
        };

        return (
            <div className="">
                {notifications &&
                    notifications.length > 0 && (
                        <div style={{ lineHeight: '1rem' }}>
                            {notifications.length > 0 &&
                                notifications.map(item => renderItem(item))}
                        </div>
                    )}
                {notifications.length === 0 &&
                    !loading && <Callout>No activity on this post.</Callout>}

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
        const { author, permlink } = props;
        const postNotifications = state.global.getIn([
            'content',
            `${author}/${permlink}`,
            'post_notifications',
        ]);
        const postNotificationsLoading = state.global.getIn([
            'content',
            `${author}/${permlink}`,
            'post_notifications_loading',
        ]);
        return {
            ...props,
            notifications: postNotifications ? postNotifications.toJS() : [],
            loading: postNotificationsLoading,
        };
    },
    dispatch => ({
        fetchPostNotifications: (author, permlink) => {
            dispatch(
                fetchDataActions.getPostNotifications({ author, permlink })
            );
        },
    })
)(PostNotificationsList);
