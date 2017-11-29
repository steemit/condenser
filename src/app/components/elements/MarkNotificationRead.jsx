import React from 'react';
import {connect} from 'react-redux';
import {markNotificationRead} from 'app/utils/ServerApiClient';

class MarkNotificationRead extends React.Component {

    static propTypes = {
        fields: React.PropTypes.string,
        account: React.PropTypes.string,
        update: React.PropTypes.func
    };

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        const {account, fields, update} = this.props;
        const fields_array = fields.replace(/\s/g,'').split(',');
        markNotificationRead(account, fields_array).then(nc => update(nc));
    }

    render() {
        return null;
    }

}

export default connect(null, dispatch => ({
    update: (payload) => { dispatch({type: 'UPDATE_NOTIFICOUNTERS', payload})},
}))(MarkNotificationRead);
