import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';

class NotificationsList extends React.Component {
    static propTypes = {
        notifications: PropTypes.object.isRequired,
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
                <ul className="PostsList__summaries hfeed" itemScope>
                    {renderNotifications(notifications)}
                </ul>
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

export default connect((state, props) => {
    return {
        ...props,
    };
})(NotificationsList);
