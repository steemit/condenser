import React from 'react';
import { connect } from 'react-redux';

import * as notificationActions from 'app/redux/NotificationReducer';

class YotifiCounter extends React.Component {
    render() {
        const { unshown } = this.props;
        const count = unshown.count();
        if (count < 1) return null;
        return <div className="NotifiCounter">{count}</div>;
    }
}

YotifiCounter.propTypes = {
    unshown: React.PropTypes.object.isRequired,
};

export default connect(state => ({
    unshown: state.notification.unshown,
    username:
        state.user.getIn(['current', 'username']) ||
        state.offchain.get('account') ||
        '', // to see if we're logged in
}))(YotifiCounter);
