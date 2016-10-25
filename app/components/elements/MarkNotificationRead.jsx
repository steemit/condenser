import React from 'react';
import {connect} from 'react-redux';
import {markNotificationRead} from 'app/utils/ServerApiClient';

class MarkNotificationRead extends React.Component {

    static propTypes = {
        nn: React.PropTypes.string,
        account: React.PropTypes.string,
        update: React.PropTypes.func
    };

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        const {account, nn, update} = this.props;
        markNotificationRead(account, nn).then(nc => update(nc));
    }

    render() {
        return null;
    }

}

export default connect(null, dispatch => ({
    update: (payload) => { dispatch({type: 'UPDATE_NOTIFICOUNTERS', payload})},
}))(MarkNotificationRead);
