import React from 'react';
import {connect} from 'react-redux';

class YotifiCounter extends React.Component {

    componentWillMount() {
        if (!!this.props.username) {
            this.props.fetchNotifications(this.props.username);
        }
    }

    render() {
        const { unshown } = this.props;
        const count = unshown.count();
        if (count < 1) return null;
        return <div className="NotifiCounter">{count}</div>;
    }
}

YotifiCounter.propTypes = {
    unshown: React.PropTypes.object.isRequired,
    fetchNotifications: React.PropTypes.func.isRequired,
}

export default connect(
    (state) => ({
        unshown: state.notification.unshown,
        username: state.user.getIn(['current', 'username']) || state.offchain.get('account') || '', // to see if we're logged in
    }),
    (dispatch) => ({
        fetchNotifications: (username) => {
            dispatch({
                type: 'notification/FETCH_ALL',
                username,
            });
        },
    }),
)(YotifiCounter);
